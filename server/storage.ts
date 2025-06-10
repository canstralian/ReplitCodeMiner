import { 
  users, 
  projects, 
  codePatterns, 
  duplicateGroups, 
  patternGroups,
  type User, 
  type UpsertUser,
  type Project,
  type InsertProject,
  type CodePattern,
  type InsertCodePattern,
  type DuplicateGroup,
  type InsertDuplicateGroup
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql, like, or } from "drizzle-orm";
import type { ReplitProject, AnalysisResult } from "./replitApi";
import { logger, AppError } from "./logger";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  getUserProjects(userId: string): Promise<Project[]>;
  syncUserProjects(userId: string, replitProjects: ReplitProject[]): Promise<void>;
  getUserProjectStats(userId: string): Promise<{
    totalProjects: number;
    duplicatesFound: number;
    similarPatterns: number;
    languages: Record<string, number>;
  }>;
  
  // Analysis operations
  storeAnalysisResults(userId: string, results: AnalysisResult[]): Promise<void>;
  getUserDuplicates(userId: string): Promise<DuplicateGroup[]>;
  getDuplicateGroup(userId: string, groupId: number): Promise<DuplicateGroup | undefined>;
  
  // Search operations
  searchCodePatterns(userId: string, options: {
    query?: string;
    language?: string;
    patternType?: string;
  }): Promise<CodePattern[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async getUserProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.lastUpdated));
  }

  async syncUserProjects(userId: string, replitProjects: ReplitProject[]): Promise<void> {
    if (replitProjects.length === 0) return;

    // Batch insert for better performance
    const batchSize = 50;
    for (let i = 0; i < replitProjects.length; i += batchSize) {
      const batch = replitProjects.slice(i, i + batchSize);
      
      try {
        await db.transaction(async (tx) => {
          for (const replitProject of batch) {
            await tx
              .insert(projects)
              .values({
                userId,
                replitId: replitProject.id,
                title: replitProject.title,
                url: replitProject.url,
                language: replitProject.language,
                description: replitProject.description,
                fileCount: replitProject.fileCount || 0,
                lastUpdated: replitProject.lastUpdated || new Date(),
              })
              .onConflictDoUpdate({
                target: [projects.userId, projects.replitId],
                set: {
                  title: replitProject.title,
                  url: replitProject.url,
                  language: replitProject.language,
                  description: replitProject.description,
                  fileCount: replitProject.fileCount || 0,
                  lastUpdated: replitProject.lastUpdated || new Date(),
                  updatedAt: new Date(),
                },
              });
          }
        });
      } catch (error) {
        logger.error('Error syncing project batch', { 
          error: (error as Error).message, 
          userId, 
          batchStart: i 
        });
        throw new AppError('Failed to sync projects', 500);
      }
    }
  }

  async getUserProjectStats(userId: string): Promise<{
    totalProjects: number;
    duplicatesFound: number;
    similarPatterns: number;
    languages: Record<string, number>;
  }> {
    try {
      const [projectCount] = await db
        .select({ count: count() })
        .from(projects)
        .where(eq(projects.userId, userId));

      const [duplicateCount] = await db
        .select({ count: count() })
        .from(duplicateGroups)
        .where(eq(duplicateGroups.userId, userId));

      const [patternCount] = await db
        .select({ count: count() })
        .from(codePatterns)
        .where(eq(codePatterns.userId, userId));

      const languageStats = await db
        .select({
          language: projects.language,
          count: count(),
        })
        .from(projects)
        .where(eq(projects.userId, userId))
        .groupBy(projects.language);

      const languages: Record<string, number> = {};
      languageStats.forEach(stat => {
        if (stat.language) {
          languages[stat.language] = stat.count;
        }
      });

      return {
        totalProjects: projectCount.count,
        duplicatesFound: duplicateCount.count,
        similarPatterns: patternCount.count,
        languages,
      };
    } catch (error) {
      logger.error('Error fetching project stats', { error: (error as Error).message, userId });
      throw new AppError('Failed to fetch project statistics', 500);
    }
  }

  // Analysis operations
  async storeAnalysisResults(userId: string, results: AnalysisResult[]): Promise<void> {
    for (const result of results) {
      // Find the project
      const [project] = await db
        .select()
        .from(projects)
        .where(and(
          eq(projects.userId, userId),
          eq(projects.replitId, result.projectId)
        ));

      if (!project) continue;

      // Store code patterns
      for (const pattern of result.patterns) {
        await db
          .insert(codePatterns)
          .values({
            userId,
            projectId: project.id,
            filePath: pattern.filePath,
            patternHash: pattern.patternHash,
            codeSnippet: pattern.codeSnippet,
            patternType: pattern.patternType,
            lineStart: pattern.lineStart,
            lineEnd: pattern.lineEnd,
          })
          .onConflictDoNothing();
      }

      // Store duplicate groups
      for (const duplicate of result.duplicates) {
        const [group] = await db
          .insert(duplicateGroups)
          .values({
            userId,
            groupHash: duplicate.patterns[0]?.patternHash || '',
            similarityScore: duplicate.similarityScore,
            patternType: duplicate.patternType,
            description: duplicate.description,
          })
          .returning();

        // Link patterns to group
        for (const pattern of duplicate.patterns) {
          const [storedPattern] = await db
            .select()
            .from(codePatterns)
            .where(and(
              eq(codePatterns.userId, userId),
              eq(codePatterns.patternHash, pattern.patternHash)
            ));

          if (storedPattern) {
            await db
              .insert(patternGroups)
              .values({
                groupId: group.id,
                patternId: storedPattern.id,
              })
              .onConflictDoNothing();
          }
        }
      }
    }
  }

  async getUserDuplicates(userId: string): Promise<DuplicateGroup[]> {
    return await db
      .select()
      .from(duplicateGroups)
      .where(eq(duplicateGroups.userId, userId))
      .orderBy(desc(duplicateGroups.createdAt));
  }

  async getDuplicateGroup(userId: string, groupId: number): Promise<DuplicateGroup | undefined> {
    const [group] = await db
      .select()
      .from(duplicateGroups)
      .where(and(
        eq(duplicateGroups.userId, userId),
        eq(duplicateGroups.id, groupId)
      ));
    return group;
  }

  // Search operations
  async searchCodePatterns(userId: string, options: {
    query?: string;
    language?: string;
    patternType?: string;
  }): Promise<CodePattern[]> {
    let query = db
      .select()
      .from(codePatterns)
      .where(eq(codePatterns.userId, userId));

    if (options.patternType) {
      query = query.where(eq(codePatterns.patternType, options.patternType));
    }

    if (options.query) {
      query = query.where(
        sql`${codePatterns.codeSnippet} ILIKE ${`%${options.query}%`}`
      );
    }

    return await query.orderBy(desc(codePatterns.createdAt));
  }
}

export const storage = new DatabaseStorage();