import { storage } from './storage';
import PatternDetector, { type CodePattern } from './patternDetection';
import { LRUCache } from 'lru-cache';
import { logger } from './logger';

export interface AnalysisResult {
  duplicateGroups: DuplicateGroup[];
  totalPatterns: number;
  processingTime: number;
  metrics: AnalysisMetrics;
}

export interface CachedAnalysis {
  result: AnalysisResult;
  timestamp: number;
  projectHashes: string[];
}

export interface AnalysisMetrics {
  filesAnalyzed: number;
  patternsFound: number;
  duplicatesDetected: number;
  languages: Record<string, number>;
}

export interface DuplicateGroup {
  id: string;
  patterns: CodePattern[];
  similarityScore: number;
  type: string;
}

export class AnalysisService {
  private storage: typeof storage;
  private analysisCache: LRUCache<string, CachedAnalysis>;
  private patternCache: LRUCache<string, CodePattern[]>;

  constructor() {
    this.storage = storage;

    // Initialize caches with optimized settings
    this.analysisCache = new LRUCache({
      max: 100,
      ttl: 1000 * 60 * 30, // 30 minutes
      allowStale: true
    });

    this.patternCache = new LRUCache({
      max: 1000,
      ttl: 1000 * 60 * 60, // 1 hour
      allowStale: true
    });
  }

  async analyzeProjects(userId: string, projects: any[]): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      // Generate cache key based on project content
      const cacheKey = this.generateCacheKey(userId, projects);
      const cached = this.analysisCache.get(cacheKey);

      if (cached && this.isCacheValid(cached, projects)) {
        return cached.result;
      }

      // Perform analysis
      const result = await this.performAnalysis(userId, projects);

      // Cache result
      this.analysisCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
        projectHashes: projects.map(p => PatternDetector.generatePatternHash(JSON.stringify(p)))
      });

      result.processingTime = Date.now() - startTime;
      return result;
    } catch (error) {
      logger.error('Error in analyzeProjects:', {
        userId,
        projectCount: projects.length,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  private async performAnalysis(userId: string, projects: any[]): Promise<AnalysisResult> {
    const allFiles: Array<{ projectId: string; filePath: string; content: string }> = [];
    const duplicateGroups: DuplicateGroup[] = [];
    const patternTypes: Record<string, number> = {};
    const languageStats: Record<string, number> = {};

    // Extract all files from projects
    for (const project of projects) {
      if (project.files && Array.isArray(project.files)) {
        for (const file of project.files) {
          if (file.path && file.content) {
            allFiles.push({
              projectId: project.id,
              filePath: file.path,
              content: file.content
            });
          }
        }
      }
    }

    // Analyze patterns and find duplicates
    const filePatterns = new Map<string, CodePattern[]>();
    const hashGroups = new Map<string, Array<{ file: any; pattern: CodePattern }>>();

    for (const file of allFiles) {
      try {
        // Skip empty or very large files
        if (!file.content || file.content.length > 1024 * 1024) {
          continue;
        }

        // Get file language from extension
        const language = this.getLanguageFromPath(file.filePath);
        languageStats[language] = (languageStats[language] || 0) + 1;

        const cacheKey = `patterns_${PatternDetector.generatePatternHash(file.content)}`;
        let patterns = this.patternCache.get(cacheKey);

        if (!patterns) {
          patterns = PatternDetector.extractPatterns(file.content, file.filePath);
          this.patternCache.set(cacheKey, patterns);
        }

        filePatterns.set(file.filePath, patterns);

        // Group by pattern hash for efficient duplicate detection
        for (const pattern of patterns) {
          if (!hashGroups.has(pattern.hash)) {
            hashGroups.set(pattern.hash, []);
          }
          hashGroups.get(pattern.hash)!.push({
            file,
            pattern
          });
          
          // Count pattern types
          patternTypes[pattern.type] = (patternTypes[pattern.type] || 0) + 1;
        }
      } catch (error) {
        logger.error('Error processing file during analysis:', {
          filePath: file.filePath,
          projectId: file.projectId,
          error: error instanceof Error ? error.message : String(error)
        });
        // Continue processing other files
        continue;
      }
    }

    // Find duplicates in hash groups
    let duplicatesFound = 0;
    let groupIdCounter = 0;

    for (const [hash, group] of Array.from(hashGroups)) {
      if (group.length > 1) {
        // Calculate average similarity score for the group
        let totalSimilarity = 0;
        let comparisons = 0;

        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const similarity = PatternDetector.calculateSimilarity(
              group[i].file.content,
              group[j].file.content
            );
            totalSimilarity += similarity.score;
            comparisons++;
          }
        }

        const avgSimilarity = comparisons > 0 ? totalSimilarity / comparisons : 0;
        
        // Only include groups with significant similarity
        if (avgSimilarity > 0.7) {
          duplicateGroups.push({
            id: `group_${groupIdCounter++}`,
            patterns: group.map(g => g.pattern),
            similarityScore: avgSimilarity,
            type: group[0].pattern.type
          });
          
          duplicatesFound += group.length - 1;
        }
      }
    }

    return {
      duplicateGroups,
      totalPatterns: Object.values(patternTypes).reduce((sum, count) => sum + count, 0),
      processingTime: 0, // Will be set by caller
      metrics: {
        filesAnalyzed: allFiles.length,
        patternsFound: Object.values(patternTypes).reduce((sum, count) => sum + count, 0),
        duplicatesDetected: duplicatesFound,
        languages: languageStats
      }
    };
  }

  private generateCacheKey(userId: string, projects: any[]): string {
    try {
      const projectsHash = PatternDetector.generatePatternHash(
        JSON.stringify(projects.map(p => ({ id: p.id, updated: p.updated || p.lastUpdated })))
      );
      return `analysis_${userId}_${projectsHash}`;
    } catch (error) {
      logger.error('Error generating cache key:', error);
      return `analysis_${userId}_${Date.now()}`;
    }
  }

  private isCacheValid(cached: CachedAnalysis, projects: any[]): boolean {
    try {
      const currentHashes = projects.map(p => PatternDetector.generatePatternHash(JSON.stringify(p)));
      return JSON.stringify(cached.projectHashes) === JSON.stringify(currentHashes);
    } catch (error) {
      logger.error('Error validating cache:', error);
      return false;
    }
  }

  private getLanguageFromPath(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'py': return 'python';
      case 'java': return 'java';
      case 'cpp': case 'cc': case 'cxx': return 'cpp';
      case 'c': return 'c';
      case 'cs': return 'csharp';
      case 'go': return 'go';
      case 'rs': return 'rust';
      case 'php': return 'php';
      case 'rb': return 'ruby';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'unknown';
    }
  }

  // Clear all caches
  public clearCaches(): void {
    this.analysisCache.clear();
    this.patternCache.clear();
  }

  // Get cache statistics
  public getCacheStats() {
    return {
      analysisCache: {
        size: this.analysisCache.size,
        calculatedSize: this.analysisCache.calculatedSize
      },
      patternCache: {
        size: this.patternCache.size,
        calculatedSize: this.patternCache.calculatedSize
      }
    };
  }
}

export default AnalysisService;