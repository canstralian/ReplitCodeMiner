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
  private patternCache: LRUCache<string, any>;

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
  }

  private async performAnalysis(userId: string, projects: any[]): Promise<AnalysisResult> {
    const allFiles: Array<{ projectId: string; filePath: string; content: string }> = [];
    const duplicateGroups: Array<Array<any>> = [];
    const patternTypes: Record<string, number> = {};

    // Extract all files from projects
    for (const project of projects) {
      if (project.files) {
        for (const file of project.files) {
          allFiles.push({
            projectId: project.id,
            filePath: file.path,
            content: file.content || ''
          });
        }
      }
    }

    // Analyze patterns and find duplicates
    const filePatterns = new Map<string, any>();
    const hashGroups = new Map<string, any[]>();

    for (const file of allFiles) {
      try {
        // Skip empty or very large files
        if (!file.content || file.content.length > 1024 * 1024) {
          continue;
        }

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
            ...file,
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
    const similarityScores: number[] = [];
    let duplicatesFound = 0;

    for (const [hash, group] of Array.from(hashGroups)) {
      if (group.length > 1) {
        duplicatesFound += group.length - 1;

        // Calculate detailed similarity for each pair
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const similarity = PatternDetector.calculateSimilarity(
              group[i].content,
              group[j].content
            );
            similarityScores.push(similarity.score);

            // Store in database for future reference
            // TODO: Implement proper duplicate storage
            console.log(`Duplicate found: ${group[i].filePath} matches ${group[j].filePath} with score ${similarity.score}`);
          }
        }
      }
    }

    return {
      duplicateGroups: [],
      totalPatterns: Object.keys(patternTypes).length,
      processingTime: 0, // Will be set by caller
      metrics: {
        filesAnalyzed: allFiles.length,
        patternsFound: Object.keys(patternTypes).length,
        duplicatesDetected: duplicatesFound,
        languages: patternTypes
      }
    };
  }

  private generateCacheKey(userId: string, projects: any[]): string {
    const projectsHash = PatternDetector.generatePatternHash(
      JSON.stringify(projects.map(p => ({ id: p.id, updated: p.updated })))
    );
    return `analysis_${userId}_${projectsHash}`;
  }

  private isCacheValid(cached: CachedAnalysis, projects: any[]): boolean {
    const currentHashes = projects.map(p => PatternDetector.generatePatternHash(JSON.stringify(p)));
    return JSON.stringify(cached.projectHashes) === JSON.stringify(currentHashes);
  }
}

export default AnalysisService;