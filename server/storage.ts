
import { users, projects, codePatterns, duplicateGroups, patternGroups, type User, type UpsertUser, type Project, type InsertProject, type CodePattern, type InsertCodePattern, type DuplicateGroup, type InsertDuplicateGroup } from "@shared/schema";
import { db } from "./db";
import { eq, and, count, inArray, desc, asc } from "drizzle-orm";
import type { ReplitProject, ReplitAnalysisResult, ReplitCodePattern, DuplicateMatch } from "./replitApi";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

interface StorageMetrics {
  queriesExecuted: number;
  queryTime: number;
  cacheHits: number;
  cacheMisses: number;
}

class StorageService {
  private metrics: StorageMetrics = {
    queriesExecuted: 0,
    queryTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  };

  private queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly BATCH_SIZE = 100;

  async upsertUser(userData: UpsertUser): Promise<User> {
    const startTime = Date.now();
    
    try {
      const [user] = await db.insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImageUrl: userData.profileImageUrl,
            updatedAt: new Date(),
          }
        })
        .returning();
      
      this.updateMetrics(startTime);
      logger.info(`User upserted: ${user.id}`);
      
      // Clear related cache entries
      this.invalidateUserCache(user.id);
      
      return user;
    } catch (error) {
      logger.error('Error upserting user:', error);
      throw new Error(`Failed to upsert user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUser(userId: string): Promise<User | null> {
    const cacheKey = `user:${userId}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      this.metrics.cacheHits++;
      return cached;
    }

    const startTime = Date.now();
    
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      this.updateMetrics(startTime);
      this.metrics.cacheMisses++;
      
      const result = user || null;
      if (result) {
        this.setCache(cacheKey, result, this.DEFAULT_CACHE_TTL);
      }
      
      return result;
    } catch (error) {
      logger.error('Error fetching user:', error);
      throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async syncUserProjects(userId: string, replitProjects: ReplitProject[]): Promise<void> {
    if (!replitProjects || replitProjects.length === 0) {
      logger.info(`No projects to sync for user ${userId}`);
      return;
    }

    const startTime = Date.now();
    logger.info(`Syncing ${replitProjects.length} projects for user ${userId}`);

    try {
      // Process projects in batches for better performance
      const batches = this.createBatches(replitProjects, this.BATCH_SIZE);
      
      for (const batch of batches) {
        await this.processBatchSync(userId, batch);
      }

      this.updateMetrics(startTime);
      this.invalidateProjectsCache(userId);
      
      logger.info(`Successfully synced ${replitProjects.length} projects for user ${userId}`);
    } catch (error) {
      logger.error(`Error syncing projects for user ${userId}:`, error);
      throw new Error(`Failed to sync projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async processBatchSync(userId: string, batch: ReplitProject[]): Promise<void> {
    const projectValues = batch.map(project => ({
      userId,
      title: project.title || 'Untitled Project',
      description: project.description || '',
      language: project.language || 'unknown',
      url: project.url || '',
      fileCount: project.fileCount || 0,
      lastUpdated: new Date(project.lastUpdated || Date.now()),
    }));

    // Use a transaction for batch operations
    await db.transaction(async (tx) => {
      for (const projectData of projectValues) {
        await tx.insert(projects)
          .values(projectData)
          .onConflictDoUpdate({
            target: projects.url,
            set: {
              title: projectData.title,
              description: projectData.description,
              language: projectData.language,
              url: projectData.url,
              fileCount: projectData.fileCount,
              lastUpdated: projectData.lastUpdated,
              updatedAt: new Date(),
            }
          });
      }
    });
  }

  async getUserProjects(userId: string, options: { 
    limit?: number; 
    offset?: number; 
    sortBy?: 'title' | 'lastUpdated' | 'fileCount';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<Project[]> {
    const { limit = 100, offset = 0, sortBy = 'lastUpdated', sortOrder = 'desc' } = options;
    const cacheKey = `projects:${userId}:${limit}:${offset}:${sortBy}:${sortOrder}`;
    
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.metrics.cacheHits++;
      return cached;
    }

    const startTime = Date.now();
    
    try {
      // Build the query with proper sorting and pagination
      const baseQuery = db.select().from(projects).where(eq(projects.userId, userId));
      
      let result;
      if (sortBy === 'title') {
        result = sortOrder === 'asc' 
          ? await baseQuery.orderBy(asc(projects.title)).limit(limit).offset(offset)
          : await baseQuery.orderBy(desc(projects.title)).limit(limit).offset(offset);
      } else if (sortBy === 'lastUpdated') {
        result = sortOrder === 'asc' 
          ? await baseQuery.orderBy(asc(projects.lastUpdated)).limit(limit).offset(offset)
          : await baseQuery.orderBy(desc(projects.lastUpdated)).limit(limit).offset(offset);
      } else if (sortBy === 'fileCount') {
        result = sortOrder === 'asc' 
          ? await baseQuery.orderBy(asc(projects.fileCount)).limit(limit).offset(offset)
          : await baseQuery.orderBy(desc(projects.fileCount)).limit(limit).offset(offset);
      } else {
        // Default sorting
        result = await baseQuery.orderBy(desc(projects.lastUpdated)).limit(limit).offset(offset);
      }
      
      this.updateMetrics(startTime);
      this.metrics.cacheMisses++;
      this.setCache(cacheKey, result, this.DEFAULT_CACHE_TTL);
      
      return result;
    } catch (error) {
      logger.error(`Error fetching projects for user ${userId}:`, error);
      throw new Error(`Failed to fetch projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserProjectStats(userId: string) {
    const cacheKey = `stats:${userId}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      this.metrics.cacheHits++;
      return cached;
    }

    const startTime = Date.now();
    
    try {
      // Optimized query with proper joins and aggregations
      const stats = await db
        .select({
          totalProjects: sql<number>`count(distinct ${projects.id})`.as('totalProjects'),
          totalDuplicateGroups: sql<number>`count(distinct ${duplicateGroups.id})`.as('totalDuplicateGroups'),
          totalPatterns: sql<number>`count(distinct ${codePatterns.id})`.as('totalPatterns'),
          avgFileCount: sql<number>`avg(${projects.fileCount})`.as('avgFileCount'),
          totalFiles: sql<number>`sum(${projects.fileCount})`.as('totalFiles'),
        })
        .from(projects)
        .leftJoin(codePatterns, eq(projects.id, codePatterns.projectId))
        .leftJoin(duplicateGroups, eq(duplicateGroups.userId, projects.userId))
        .where(eq(projects.userId, userId))
        .groupBy(projects.userId);

      this.updateMetrics(startTime);
      this.metrics.cacheMisses++;

      const result = stats[0] || {
        totalProjects: 0,
        totalDuplicateGroups: 0,
        totalPatterns: 0,
        avgFileCount: 0,
        totalFiles: 0,
      };

      this.setCache(cacheKey, result, this.DEFAULT_CACHE_TTL);
      return result;
    } catch (error) {
      logger.error(`Error fetching project stats for user ${userId}:`, error);
      throw new Error(`Failed to fetch project stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async storeAnalysisResults(userId: string, results: ReplitAnalysisResult[]): Promise<void> {
    if (!results || results.length === 0) {
      logger.info(`No analysis results to store for user ${userId}`);
      return;
    }

    const startTime = Date.now();
    logger.info(`Storing analysis results for user ${userId}: ${results.length} results`);

    try {
      await db.transaction(async (tx) => {
        for (const result of results) {
          // Store code patterns in batches
          if (result.patterns && result.patterns.length > 0) {
            const patternBatches = this.createBatches(result.patterns, this.BATCH_SIZE);
            
            for (const batch of patternBatches) {
              const patternValues = batch
                .filter((pattern: ReplitCodePattern) => pattern.filePath && pattern.patternHash) // Filter invalid patterns
                .map((pattern: ReplitCodePattern) => ({
                  userId,
                  projectId: parseInt(result.projectId.toString(), 10),
                  filePath: pattern.filePath,
                  patternHash: pattern.patternHash,
                  codeSnippet: pattern.codeSnippet.substring(0, 5000), // Limit snippet size
                  patternType: pattern.patternType,
                  lineStart: pattern.lineStart || 1,
                  lineEnd: pattern.lineEnd || 1,
                }));

              if (patternValues.length > 0) {
                await tx.insert(codePatterns)
                  .values(patternValues)
                  .onConflictDoNothing(); // Ignore duplicates
              }
            }
          }

          // Store duplicate groups in batches
          if (result.duplicates && result.duplicates.length > 0) {
            const duplicateBatches = this.createBatches(result.duplicates, this.BATCH_SIZE);
            
            for (const batch of duplicateBatches) {
              const duplicateValues = batch
                .filter((duplicate: DuplicateMatch) => duplicate.patternHash && duplicate.similarityScore) // Filter invalid duplicates
                .map((duplicate: DuplicateMatch) => ({
                  userId,
                  patternHash: duplicate.patternHash,
                  similarityScore: Math.min(duplicate.similarityScore, 1).toString(), // Ensure score <= 1
                  patternType: duplicate.patternType || 'unknown',
                }));

              if (duplicateValues.length > 0) {
                await tx.insert(duplicateGroups)
                  .values(duplicateValues)
                  .onConflictDoNothing(); // Ignore duplicates
              }
            }
          }
        }
      });

      this.updateMetrics(startTime);
      this.invalidateAnalysisCache(userId);
      
      logger.info(`Successfully stored analysis results for user ${userId}`);
    } catch (error) {
      logger.error(`Error storing analysis results for user ${userId}:`, error);
      throw new Error(`Failed to store analysis results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserDuplicates(userId: string, options: {
    limit?: number;
    offset?: number;
    minSimilarity?: number;
  } = {}) {
    const { limit = 100, offset = 0, minSimilarity = 0.7 } = options;
    const cacheKey = `duplicates:${userId}:${limit}:${offset}:${minSimilarity}`;
    
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.metrics.cacheHits++;
      return cached;
    }

    const startTime = Date.now();
    
    try {
      const result = await db.select()
        .from(duplicateGroups)
        .where(
          and(
            eq(duplicateGroups.userId, userId),
            sql`${duplicateGroups.similarityScore}::float >= ${minSimilarity}`
          )
        )
        .orderBy(desc(duplicateGroups.similarityScore))
        .limit(limit)
        .offset(offset);
      
      this.updateMetrics(startTime);
      this.metrics.cacheMisses++;
      this.setCache(cacheKey, result, this.DEFAULT_CACHE_TTL);
      
      return result;
    } catch (error) {
      logger.error(`Error fetching duplicates for user ${userId}:`, error);
      // Return empty array on error to prevent crashes
      return [];
    }
  }

  async getDuplicateGroup(userId: string, groupId: number) {
    const cacheKey = `duplicate_group:${userId}:${groupId}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      this.metrics.cacheHits++;
      return cached;
    }

    const startTime = Date.now();
    
    try {
      const [group] = await db.select()
        .from(duplicateGroups)
        .where(and(eq(duplicateGroups.userId, userId), eq(duplicateGroups.id, groupId)))
        .limit(1);
      
      this.updateMetrics(startTime);
      this.metrics.cacheMisses++;
      
      const result = group || null;
      if (result) {
        this.setCache(cacheKey, result, this.DEFAULT_CACHE_TTL);
      }
      
      return result;
    } catch (error) {
      logger.error(`Error fetching duplicate group ${groupId} for user ${userId}:`, error);
      return null;
    }
  }

  async searchCodePatterns(userId: string, searchParams: {
    query: string;
    language?: string;
    patternType?: string;
    limit?: number;
    offset?: number;
  }) {
    const { query, language, patternType, limit = 50, offset = 0 } = searchParams;
    const cacheKey = `search:${userId}:${query}:${language}:${patternType}:${limit}:${offset}`;
    
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.metrics.cacheHits++;
      return cached;
    }

    const startTime = Date.now();
    
    try {
      const conditions = [eq(codePatterns.userId, userId)];

      // Add search conditions
      if (query && query.trim()) {
        conditions.push(
          sql`${codePatterns.codeSnippet} ILIKE ${`%${query.trim()}%`}`
        );
      }

      if (language) {
        conditions.push(
          sql`${codePatterns.filePath} ILIKE ${`%.${language}`}`
        );
      }
      
      if (patternType) {
        conditions.push(eq(codePatterns.patternType, patternType));
      }

      // Add ordering and pagination
      const result = await db.select()
        .from(codePatterns)
        .where(and(...conditions))
        .orderBy(desc(codePatterns.createdAt))
        .limit(limit)
        .offset(offset);
      
      this.updateMetrics(startTime);
      this.metrics.cacheMisses++;
      this.setCache(cacheKey, result, this.DEFAULT_CACHE_TTL);
      
      return result;
    } catch (error) {
      logger.error(`Error searching code patterns for user ${userId}:`, error);
      throw new Error(`Failed to search code patterns: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserSettings(userId: string) {
    const cacheKey = `settings:${userId}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      this.metrics.cacheHits++;
      return cached;
    }

    const startTime = Date.now();
    
    try {
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      this.updateMetrics(startTime);
      this.metrics.cacheMisses++;

      // Return enhanced default settings structure
      const settings = {
        profile: {
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          profileImageUrl: user.profileImageUrl || '',
        },
        notifications: {
          emailNotifications: true,
          taskadeIntegration: true,
          analysisComplete: true,
          duplicatesFound: true,
        },
        analysis: {
          autoAnalyze: false,
          duplicateThreshold: 0.8,
          excludePatterns: [],
          includeLanguages: ['javascript', 'python', 'typescript', 'java', 'cpp'],
          maxFileSize: 1024 * 1024, // 1MB
          batchSize: 50,
        },
        privacy: {
          profileVisibility: 'private',
          shareAnalytics: false,
          dataRetention: 30,
        },
        performance: {
          cacheEnabled: true,
          maxConcurrentAnalysis: 3,
          analysisTimeout: 300000, // 5 minutes
        }
      };

      this.setCache(cacheKey, settings, this.DEFAULT_CACHE_TTL);
      return settings;
    } catch (error) {
      logger.error(`Error fetching settings for user ${userId}:`, error);
      throw new Error(`Failed to fetch settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateUserSettings(userId: string, settings: any) {
    const startTime = Date.now();
    
    try {
      // Validate settings structure
      if (!settings || typeof settings !== 'object') {
        throw new Error('Invalid settings data');
      }

      // Update user profile information if provided
      if (settings.profile && typeof settings.profile === 'object') {
        const profileUpdates: Partial<UpsertUser> = {};
        
        if (settings.profile.firstName) profileUpdates.firstName = settings.profile.firstName;
        if (settings.profile.lastName) profileUpdates.lastName = settings.profile.lastName;
        
        if (Object.keys(profileUpdates).length > 0) {
          await db
            .update(users)
            .set({
              ...profileUpdates,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));
        }
      }

      this.updateMetrics(startTime);
      this.invalidateUserCache(userId);
      this.invalidateCache(`settings:${userId}`);
      
      logger.info(`Settings updated for user ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Error updating settings for user ${userId}:`, error);
      throw new Error(`Failed to update settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Utility methods
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private updateMetrics(startTime: number): void {
    this.metrics.queriesExecuted++;
    this.metrics.queryTime += Date.now() - startTime;
  }

  private getFromCache(key: string): any {
    const cached = this.queryCache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.timestamp + cached.ttl) {
      this.queryCache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.queryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Cleanup old cache entries if cache gets too large
    if (this.queryCache.size > 1000) {
      const oldestKeys = Array.from(this.queryCache.keys()).slice(0, 100);
      oldestKeys.forEach(key => this.queryCache.delete(key));
    }
  }

  private invalidateCache(pattern: string): void {
    const keysToDelete = Array.from(this.queryCache.keys()).filter(key => key.includes(pattern));
    keysToDelete.forEach(key => this.queryCache.delete(key));
  }

  private invalidateUserCache(userId: string): void {
    this.invalidateCache(`user:${userId}`);
    this.invalidateCache(`settings:${userId}`);
    this.invalidateCache(`stats:${userId}`);
  }

  private invalidateProjectsCache(userId: string): void {
    this.invalidateCache(`projects:${userId}`);
    this.invalidateCache(`stats:${userId}`);
  }

  private invalidateAnalysisCache(userId: string): void {
    this.invalidateCache(`duplicates:${userId}`);
    this.invalidateCache(`search:${userId}`);
    this.invalidateCache(`stats:${userId}`);
  }

  // Public method to get storage metrics
  public getMetrics(): StorageMetrics & { cacheSize: number } {
    return {
      ...this.metrics,
      cacheSize: this.queryCache.size
    };
  }

  // Method to clear cache if needed
  public clearCache(): void {
    this.queryCache.clear();
    logger.info('Storage cache cleared');
  }
}

// Export singleton instance
export const storage = new StorageService();
