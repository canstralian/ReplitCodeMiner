import { 
  users, 
  projects, 
  codePatterns, 
  duplicateGroups, 
  patternGroups,
  searchHistory,
  savedSearches,
  aiAnalysis,
  codeMetrics,
  refactoringSuggestions,
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
import { eq, and, desc, count, sql, like, or, gte } from "drizzle-orm";
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

    // Analytics operations
    getAnalytics(userId: string, timeRange: string): Promise<any>;

    // Search history operations
    addSearchHistory(userId: string, searchData: {
      query: string;
      filters: any;
      resultCount: number;
      executionTime: number;
    }): Promise<void>;
    getSearchHistory(userId: string, limit: number): Promise<any[]>;
  
    // Saved searches operations
    saveSearch(userId: string, searchData: {
      name: string;
      query: string;
      filters: any;
      isPublic: boolean;
    }): Promise<any>;
    getSavedSearches(userId: string): Promise<any[]>;
  
    // AI Analysis operations
    storeAIAnalysis(userId: string, analysisData: {
      analysisType: string;
      projectId?: number;
      patternId?: number;
      aiProvider?: string;
      prompt: string;
      response: string;
      confidence: number;
      metadata?: any;
    }): Promise<void>;
  
    // Code metrics operations
    storeCodeMetrics(userId: string, metricsData: {
      projectId: number;
      filePath: string;
      complexity: number;
      linesOfCode: number;
      maintainabilityIndex: number;
      technicalDebt: number;
      codeSmells: any;
      securityIssues: any;
      performance: any;
    }): Promise<void>;
  
    // Refactoring suggestions operations
    storeRefactoringSuggestion(userId: string, suggestionData: {
      duplicateGroupId: number;
      suggestionsType: string;
      title: string;
      description: string;
      beforeCode: string;
      afterCode: string;
      estimatedEffort: string;
      potentialSavings: number;
      priority: number;
    }): Promise<void>;
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
        totalProjects: projectCount?.count || 0,
        duplicatesFound: duplicateCount?.count || 0,
        similarPatterns: patternCount?.count || 0,
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
  async searchCodePatterns(userId: string, searchParams: {
    query: string;
    language?: string;
    patternType?: string;
  }): Promise<any[]> {
    const { query, language, patternType } = searchParams;

    let searchQuery = db
      .select({
        id: codePatterns.id,
        filePath: codePatterns.filePath,
        codeSnippet: codePatterns.codeSnippet,
        patternType: codePatterns.patternType,
        lineStart: codePatterns.lineStart,
        lineEnd: codePatterns.lineEnd,
        projectTitle: projects.title,
        projectLanguage: projects.language,
      })
      .from(codePatterns)
      .innerJoin(projects, eq(codePatterns.projectId, projects.id))
      .where(eq(codePatterns.userId, userId));

    // Apply filters
    if (language) {
      searchQuery = searchQuery.where(eq(projects.language, language));
    }

    if (patternType) {
      searchQuery = searchQuery.where(eq(codePatterns.patternType, patternType));
    }

    const results = await searchQuery;

    // Simple text search in code snippets
    return results.filter(result => 
      result.codeSnippet.toLowerCase().includes(query.toLowerCase()) ||
      result.filePath.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Analytics operations
  async getAnalytics(userId: string, timeRange: string): Promise<any> {
    const timeFilter = this.getTimeFilter(timeRange);

    // Get overview stats
    const [projectStats] = await db
      .select({
        totalProjects: count(projects.id),
      })
      .from(projects)
      .where(eq(projects.userId, userId));

    const [duplicateStats] = await db
      .select({
        duplicatesFound: count(duplicateGroups.id),
      })
      .from(duplicateGroups)
      .where(and(
        eq(duplicateGroups.userId, userId),
        timeFilter ? gte(duplicateGroups.createdAt, timeFilter) : undefined
      ));

    const [patternStats] = await db
      .select({
        codePatterns: count(codePatterns.id),
      })
      .from(codePatterns)
      .where(and(
        eq(codePatterns.userId, userId),
        timeFilter ? gte(codePatterns.createdAt, timeFilter) : undefined
      ));

    // Get duplicates by language
    const duplicatesByLanguage = await db
      .select({
        language: projects.language,
        count: count(codePatterns.id),
      })
      .from(codePatterns)
      .innerJoin(projects, eq(codePatterns.projectId, projects.id))
      .where(eq(codePatterns.userId, userId))
      .groupBy(projects.language);

    // Get pattern types distribution
    const patternTypes = await db
      .select({
        patternType: codePatterns.patternType,
        count: count(codePatterns.id),
      })
      .from(codePatterns)
      .where(eq(codePatterns.userId, userId))
      .groupBy(codePatterns.patternType);

    return {
      overview: {
        totalProjects: projectStats.totalProjects || 0,
        duplicatesFound: duplicateStats.duplicatesFound || 0,
        codePatterns: patternStats.codePatterns || 0,
        lastScan: "2 hours ago", // This should come from actual last analysis time
        duplicatePercentage: 12.4, // Calculate based on actual data
        trend: "+2.3%"
      },
      duplicatesByLanguage: duplicatesByLanguage.map(item => ({
        name: item.language || 'Unknown',
        value: item.count,
        color: this.getLanguageColor(item.language || '')
      })),
      patternTypes: patternTypes.map(item => ({
        name: item.patternType || 'Unknown',
        count: item.count,
        percentage: Math.round((item.count / (patternStats.codePatterns || 1)) * 100)
      })),
      timeSeriesData: [], // TODO: Implement time series data
      topDuplicateProjects: [] // TODO: Implement top projects
    };
  }

  // Search history operations
  async addSearchHistory(userId: string, searchData: {
    query: string;
    filters: any;
    resultCount: number;
    executionTime: number;
  }): Promise<void> {
    await db.insert(searchHistory).values({
      userId,
      ...searchData
    });
  }

  async getSearchHistory(userId: string, limit: number = 10): Promise<any[]> {
    return await db
      .select()
      .from(searchHistory)
      .where(eq(searchHistory.userId, userId))
      .orderBy(desc(searchHistory.createdAt))
      .limit(limit);
  }

  // Saved searches operations
  async saveSearch(userId: string, searchData: {
    name: string;
    query: string;
    filters: any;
    isPublic: boolean;
  }): Promise<any> {
    const [savedSearch] = await db
      .insert(savedSearches)
      .values({
        userId,
        ...searchData
      })
      .returning();

    return savedSearch;
  }

  async getSavedSearches(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(savedSearches)
      .where(eq(savedSearches.userId, userId))
      .orderBy(desc(savedSearches.createdAt));
  }

  // AI Analysis operations
  async storeAIAnalysis(userId: string, analysisData: {
    analysisType: string;
    projectId?: number;
    patternId?: number;
    aiProvider?: string;
    prompt: string;
    response: string;
    confidence: number;
    metadata?: any;
  }): Promise<void> {
    await db.insert(aiAnalysis).values({
      userId,
      processingTime: 0, // Will be calculated by caller
      ...analysisData
    });
  }

  // Code metrics operations
  async storeCodeMetrics(userId: string, metricsData: {
    projectId: number;
    filePath: string;
    complexity: number;
    linesOfCode: number;
    maintainabilityIndex: number;
    technicalDebt: number;
    codeSmells: any;
    securityIssues: any;
    performance: any;
  }): Promise<void> {
    await db.insert(codeMetrics).values({
      userId,
      ...metricsData
    });
  }

  // Refactoring suggestions operations
  async storeRefactoringSuggestion(userId: string, suggestionData: {
    duplicateGroupId: number;
    suggestionsType: string;
    title: string;
    description: string;
    beforeCode: string;
    afterCode: string;
    estimatedEffort: string;
    potentialSavings: number;
    priority: number;
  }): Promise<void> {
    await db.insert(refactoringSuggestions).values({
      userId,
      ...suggestionData
    });
  }

  // Helper methods
  private getTimeFilter(timeRange: string): Date | null {
    const now = new Date();
    switch (timeRange) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  }

  private getLanguageColor(language: string): string {
    const colors: Record<string, string> = {
      javascript: '#f7df1e',
      typescript: '#3178c6',
      python: '#3776ab',
      html: '#e34f26',
      css: '#1572b6',
      java: '#ed8b00',
      csharp: '#239120',
      php: '#777bb4',
      ruby: '#cc342d',
      go: '#00add8'
    };
    return colors[language.toLowerCase()] || '#6b7280';
  }
}

export const storage = new DatabaseStorage();