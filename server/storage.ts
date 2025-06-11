import { users, projects, codePatterns, duplicateGroups, patternGroups, type User, type UpsertUser, type Project, type InsertProject, type CodePattern, type InsertCodePattern, type DuplicateGroup, type InsertDuplicateGroup } from "@shared/schema";
import { db } from "./db";
import { eq, and, count } from "drizzle-orm";
import type { ReplitProject, AnalysisResult } from "./replitApi";

interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(upsertUser: UpsertUser): Promise<User>;
  getUserProjects(userId: string): Promise<Project[]>;
  syncUserProjects(userId: string, replitProjects: ReplitProject[]): Promise<void>;
  getUserProjectStats(userId: string): Promise<any>;
  storeAnalysisResults(userId: string, results: AnalysisResult[]): Promise<void>;
  getUserDuplicates(userId: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user || undefined;
  }

  async upsertUser(upsertUser: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(upsertUser)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: upsertUser.email,
          firstName: upsertUser.firstName,
          lastName: upsertUser.lastName,
          profileImageUrl: upsertUser.profileImageUrl,
        }
      })
      .returning();
    return user;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  }

  async syncUserProjects(userId: string, replitProjects: ReplitProject[]): Promise<void> {
    for (const replitProject of replitProjects) {
      await db
        .insert(projects)
        .values({
          userId,
          replitId: replitProject.id,
          title: replitProject.title,
          description: replitProject.description,
          language: replitProject.language,
          url: replitProject.url,
          fileCount: replitProject.fileCount || 0,
          lastUpdated: replitProject.lastUpdated || new Date(),
        })
        .onConflictDoUpdate({
          target: projects.replitId,
          set: {
            title: replitProject.title,
            description: replitProject.description,
            language: replitProject.language,
            url: replitProject.url,
            fileCount: replitProject.fileCount || 0,
            lastUpdated: replitProject.lastUpdated || new Date(),
          }
        });
    }
  }

  async getUserProjectStats(userId: string): Promise<any> {
    const userProjects = await this.getUserProjects(userId);
    const totalProjects = userProjects.length;
    
    const duplicateStats = await db
      .select({ count: count() })
      .from(duplicateGroups)
      .where(eq(duplicateGroups.userId, userId));
    
    const duplicatesFound = duplicateStats[0]?.count || 0;
    
    const languages = userProjects.reduce((acc, project) => {
      acc[project.language] = (acc[project.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalProjects,
      duplicatesFound,
      similarPatterns: 0, // Will be calculated from analysis
      languages,
    };
  }

  async storeAnalysisResults(userId: string, results: AnalysisResult[]): Promise<void> {
    for (const result of results) {
      // Store code patterns
      for (const pattern of result.patterns) {
        await db
          .insert(codePatterns)
          .values({
            userId,
            projectId: result.projectId,
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
        await db
          .insert(duplicateGroups)
          .values({
            userId,
            projectId: result.projectId,
            patternType: duplicate.patternType,
            similarityScore: duplicate.similarityScore,
            description: duplicate.description,
            patternIds: duplicate.patterns.map(p => p.patternHash),
          })
          .onConflictDoNothing();
      }
    }
  }

  async getUserDuplicates(userId: string): Promise<any[]> {
    return await db.select().from(duplicateGroups).where(eq(duplicateGroups.userId, userId));
  }
}

export const storage = new DatabaseStorage();