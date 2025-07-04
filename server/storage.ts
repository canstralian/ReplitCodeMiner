import { users, projects, codePatterns, duplicateGroups, patternGroups, type User, type UpsertUser, type Project, type InsertProject, type CodePattern, type InsertCodePattern, type DuplicateGroup, type InsertDuplicateGroup } from "@shared/schema";
import { db } from "./db";
import { eq, and, count } from "drizzle-orm";
import type { ReplitProject, AnalysisResult } from "./replitApi";

export const storage = {
  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
        }
      })
      .returning();
    return user;
  },

  async getUser(userId: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user || null;
  },

  async syncUserProjects(userId: string, replitProjects: ReplitProject[]): Promise<void> {
    for (const project of replitProjects) {
      // Check if project already exists by URL (since URL is unique for each project)
      const existingProject = await db.select().from(projects)
        .where(and(eq(projects.userId, userId), eq(projects.url, project.url)))
        .limit(1);
      
      if (existingProject.length > 0) {
        // Update existing project
        await db.update(projects)
          .set({
            title: project.title,
            description: project.description,
            language: project.language,
            fileCount: project.fileCount || 0,
            lastUpdated: new Date(project.lastUpdated || Date.now()),
            updatedAt: new Date(),
          })
          .where(eq(projects.id, existingProject[0].id));
      } else {
        // Insert new project
        await db.insert(projects)
          .values({
            userId,
            title: project.title,
            description: project.description,
            language: project.language,
            url: project.url,
            fileCount: project.fileCount || 0,
            lastUpdated: new Date(project.lastUpdated || Date.now()),
          });
      }
    }
  },

  async getUserProjects(userId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  },

  async getUserProjectStats(userId: string) {
    const [projectCount] = await db.select({ count: count() })
      .from(projects)
      .where(eq(projects.userId, userId));

    const [duplicateCount] = await db.select({ count: count() })
      .from(duplicateGroups)
      .where(eq(duplicateGroups.userId, userId));

    const userProjects = await this.getUserProjects(userId);
    const languages = userProjects.reduce((acc, project) => {
      const language = project.language || 'unknown';
      acc[language] = (acc[language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalProjects: projectCount.count,
      duplicatesFound: duplicateCount.count,
      similarPatterns: 0, // TODO: implement pattern counting
      languages,
    };
  },

  async storeAnalysisResults(userId: string, results: AnalysisResult[]): Promise<void> {
    try {
      return await db.transaction(async (tx) => {
        for (const result of results) {
          // Find the project by external ID to get the internal integer ID
          const project = await tx.select()
            .from(projects)
            .where(and(
              eq(projects.userId, userId),
              eq(projects.url, `https://replit.com/${result.projectId}`)
            ))
            .limit(1);
          
          if (project.length === 0) {
            console.warn(`Project not found for ID: ${result.projectId}`);
            continue;
          }
          
          const projectId = project[0].id;
          
          // Batch insert code patterns
          if (result.patterns.length > 0) {
            const patternValues = result.patterns.map(pattern => ({
              userId,
              projectId,
              filePath: pattern.filePath,
              patternHash: pattern.patternHash,
              codeSnippet: pattern.codeSnippet,
              patternType: pattern.patternType,
              lineStart: pattern.lineStart,
              lineEnd: pattern.lineEnd,
            }));

            // Insert in batches of 100
            for (let i = 0; i < patternValues.length; i += 100) {
              const batch = patternValues.slice(i, i + 100);
              await tx.insert(codePatterns)
                .values(batch)
                .onConflictDoNothing();
            }
          }

          // Batch insert duplicate groups
          if (result.duplicates.length > 0) {
            const duplicateValues = result.duplicates.map(duplicate => ({
              userId,
              patternHash: duplicate.patternHash,
              similarityScore: duplicate.similarityScore.toString(),
              patternType: duplicate.patternType,
            }));

            await tx.insert(duplicateGroups)
              .values(duplicateValues)
              .onConflictDoNothing();
          }
        }
      });
    } catch (error) {
      console.error('Error storing analysis results:', error);
      throw new Error(`Failed to store analysis results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getUserDuplicates(userId: string) {
    try {
      return await db.select().from(duplicateGroups).where(eq(duplicateGroups.userId, userId));
    } catch (error) {
      console.error('Error fetching user duplicates:', error);
      // Return empty array if table doesn't exist or other DB errors
      return [];
    }
  },

  async getDuplicateGroup(userId: string, groupId: number) {
    const [group] = await db.select()
      .from(duplicateGroups)
      .where(and(eq(duplicateGroups.userId, userId), eq(duplicateGroups.id, groupId)));
    return group || null;
  },

  async searchCodePatterns(userId: string, searchParams: {
    query: string;
    language?: string;
    patternType?: string;
  }) {
    let query = db.select().from(codePatterns).where(eq(codePatterns.userId, userId));

    // Add more sophisticated search logic here
    return await query;
  },
};