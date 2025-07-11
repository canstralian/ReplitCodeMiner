
import { storage } from './storage';
import PatternDetector from './patternDetection';
import { LRUCache } from 'lru-cache';
import { logger } from './logger';

interface AnalysisResult {
  totalFiles: number;
  duplicatesFound: number;
  similarityScores: number[];
  patternTypes: Record<string, number>;
  processingTime: number;
  optimizationStats: {
    cacheHits: number;
    cacheMisses: number;
    batchesProcessed: number;
  };
}

interface CachedAnalysis {
  result: AnalysisResult;
  timestamp: number;
  projectHashes: string[];
  version: string;
}

interface BatchProcessingResult {
  patterns: any[];
  duplicates: any[];
  processingTime: number;
}

export class AnalysisService {
  private storage: typeof storage;
  private analysisCache: LRUCache<string, CachedAnalysis>;
  private patternCache: LRUCache<string, any>;
  private processingQueue: Map<string, Promise<AnalysisResult>>;
  private readonly CACHE_VERSION = '2.0.0';
  private readonly BATCH_SIZE = 50;
  private readonly MAX_CONCURRENT_BATCHES = 3;

  constructor() {
    this.storage = storage;
    this.processingQueue = new Map();

    // Optimized cache configurations
    this.analysisCache = new LRUCache({
      max: 500, // Increased cache size
      ttl: 1000 * 60 * 60 * 2, // 2 hours TTL
      allowStale: true,
      updateAgeOnGet: true,
      updateAgeOnHas: true
    });

    this.patternCache = new LRUCache({
      max: 5000, // Significantly increased pattern cache
      ttl: 1000 * 60 * 60 * 6, // 6 hours TTL
      allowStale: true,
      updateAgeOnGet: true,
      updateAgeOnHas: true
    });

    // Cleanup old cache entries periodically
    setInterval(() => this.cleanupCache(), 1000 * 60 * 30); // 30 minutes
  }

  async analyzeProjects(userId: string, projects: any[]): Promise<AnalysisResult> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(userId, projects);

    // Check if analysis is already in progress
    if (this.processingQueue.has(cacheKey)) {
      logger.info(`Analysis already in progress for user ${userId}, waiting...`);
      return await this.processingQueue.get(cacheKey)!;
    }

    // Check cache first
    const cached = this.analysisCache.get(cacheKey);
    if (cached && this.isCacheValid(cached, projects)) {
      logger.info(`Cache hit for user ${userId}, analysis completed in ${Date.now() - startTime}ms`);
      return {
        ...cached.result,
        processingTime: Date.now() - startTime,
        optimizationStats: {
          ...cached.result.optimizationStats,
          cacheHits: (cached.result.optimizationStats?.cacheHits || 0) + 1
        }
      };
    }

    // Start new analysis
    const analysisPromise = this.performOptimizedAnalysis(userId, projects, startTime);
    this.processingQueue.set(cacheKey, analysisPromise);

    try {
      const result = await analysisPromise;
      
      // Cache the result with version info
      this.analysisCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
        projectHashes: projects.map(p => PatternDetector.generatePatternHash(JSON.stringify(p))),
        version: this.CACHE_VERSION
      });

      return result;
    } finally {
      this.processingQueue.delete(cacheKey);
    }
  }

  private async performOptimizedAnalysis(userId: string, projects: any[], startTime: number): Promise<AnalysisResult> {
    const optimizationStats = {
      cacheHits: 0,
      cacheMisses: 0,
      batchesProcessed: 0
    };

    try {
      // Extract and batch files for processing
      const allFiles = this.extractFilesEfficiently(projects);
      logger.info(`Extracted ${allFiles.length} files for analysis`);

      if (allFiles.length === 0) {
        return this.createEmptyResult(startTime, optimizationStats);
      }

      // Process files in batches for memory efficiency
      const batches = this.createBatches(allFiles, this.BATCH_SIZE);
      const batchResults = await this.processBatchesConcurrently(batches, optimizationStats);

      // Aggregate results efficiently
      const aggregatedResult = this.aggregateResults(batchResults, allFiles.length, optimizationStats);
      
      // Async storage of results (don't wait for completion)
      this.storeResultsAsync(userId, batchResults);

      aggregatedResult.processingTime = Date.now() - startTime;
      logger.info(`Analysis completed for user ${userId} in ${aggregatedResult.processingTime}ms`);

      return aggregatedResult;

    } catch (error) {
      logger.error(`Analysis failed for user ${userId}:`, error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractFilesEfficiently(projects: any[]): Array<{ projectId: string; filePath: string; content: string; size: number }> {
    const files: Array<{ projectId: string; filePath: string; content: string; size: number }> = [];
    
    for (const project of projects) {
      if (!project.files || !Array.isArray(project.files)) continue;
      
      for (const file of project.files) {
        const content = file.content || '';
        
        // Skip empty files and files that are too large (>1MB)
        if (content.length === 0 || content.length > 1024 * 1024) continue;
        
        // Skip binary files and common non-code files
        if (this.shouldSkipFile(file.path, content)) continue;
        
        files.push({
          projectId: project.id,
          filePath: file.path,
          content,
          size: content.length
        });
      }
    }

    // Sort by file size for optimal processing order
    return files.sort((a, b) => a.size - b.size);
  }

  private shouldSkipFile(filePath: string, content: string): boolean {
    const skipExtensions = ['.jpg', '.png', '.gif', '.pdf', '.zip', '.exe', '.bin'];
    const skipPatterns = ['/node_modules/', '/.git/', '/dist/', '/build/'];
    
    // Check file extension
    if (skipExtensions.some(ext => filePath.toLowerCase().endsWith(ext))) return true;
    
    // Check file path patterns
    if (skipPatterns.some(pattern => filePath.includes(pattern))) return true;
    
    // Check if content appears to be binary
    if (this.isBinaryContent(content)) return true;
    
    return false;
  }

  private isBinaryContent(content: string): boolean {
    // Simple binary detection - check for null bytes or high ratio of non-printable characters
    const nullBytes = (content.match(/\0/g) || []).length;
    if (nullBytes > 0) return true;
    
    const nonPrintable = content.replace(/[\x20-\x7E\n\r\t]/g, '').length;
    return (nonPrintable / content.length) > 0.3;
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async processBatchesConcurrently(
    batches: Array<Array<{ projectId: string; filePath: string; content: string; size: number }>>,
    stats: { cacheHits: number; cacheMisses: number; batchesProcessed: number }
  ): Promise<BatchProcessingResult[]> {
    const results: BatchProcessingResult[] = [];
    
    // Process batches with controlled concurrency
    for (let i = 0; i < batches.length; i += this.MAX_CONCURRENT_BATCHES) {
      const currentBatches = batches.slice(i, i + this.MAX_CONCURRENT_BATCHES);
      
      const batchPromises = currentBatches.map(batch => this.processBatch(batch, stats));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);
    }
    
    return results;
  }

  private async processBatch(
    files: Array<{ projectId: string; filePath: string; content: string; size: number }>,
    stats: { cacheHits: number; cacheMisses: number; batchesProcessed: number }
  ): Promise<BatchProcessingResult> {
    const startTime = Date.now();
    const patterns: any[] = [];
    const duplicates: any[] = [];
    const hashGroups = new Map<string, any[]>();

    for (const file of files) {
      const cacheKey = `patterns_${PatternDetector.generatePatternHash(file.content)}_v2`;
      let filePatterns = this.patternCache.get(cacheKey);

      if (!filePatterns) {
        filePatterns = PatternDetector.extractPatterns(file.content, file.filePath);
        this.patternCache.set(cacheKey, filePatterns);
        stats.cacheMisses++;
      } else {
        stats.cacheHits++;
      }

      patterns.push(...filePatterns);

      // Group patterns by hash for duplicate detection
      for (const pattern of filePatterns) {
        if (!hashGroups.has(pattern.hash)) {
          hashGroups.set(pattern.hash, []);
        }
        hashGroups.get(pattern.hash)!.push({
          ...file,
          pattern
        });
      }
    }

    // Find duplicates within this batch
    for (const [hash, group] of hashGroups) {
      if (group.length > 1) {
        // Calculate similarity scores more efficiently
        const similarities = this.calculateBatchSimilarities(group);
        duplicates.push(...similarities);
      }
    }

    stats.batchesProcessed++;
    
    return {
      patterns,
      duplicates,
      processingTime: Date.now() - startTime
    };
  }

  private calculateBatchSimilarities(group: any[]): any[] {
    const similarities: any[] = [];
    
    // Use more efficient similarity calculation for groups
    if (group.length <= 10) {
      // For small groups, calculate all pairs
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const similarity = PatternDetector.calculateSimilarity(
            group[i].content,
            group[j].content
          );
          
          if (similarity.score >= 0.7) { // Only store high-similarity duplicates
            similarities.push({
              file1: group[i],
              file2: group[j],
              similarity
            });
          }
        }
      }
    } else {
      // For large groups, sample pairs to avoid O(n²) complexity
      const maxPairs = 20;
      const step = Math.ceil((group.length * (group.length - 1)) / 2 / maxPairs);
      
      let pairCount = 0;
      for (let i = 0; i < group.length && pairCount < maxPairs; i += step) {
        for (let j = i + 1; j < group.length && pairCount < maxPairs; j += step) {
          const similarity = PatternDetector.calculateSimilarity(
            group[i].content,
            group[j].content
          );
          
          if (similarity.score >= 0.7) {
            similarities.push({
              file1: group[i],
              file2: group[j],
              similarity
            });
          }
          pairCount++;
        }
      }
    }
    
    return similarities;
  }

  private aggregateResults(
    batchResults: BatchProcessingResult[],
    totalFiles: number,
    stats: { cacheHits: number; cacheMisses: number; batchesProcessed: number }
  ): AnalysisResult {
    const allPatterns = batchResults.flatMap(r => r.patterns);
    const allDuplicates = batchResults.flatMap(r => r.duplicates);
    
    // Calculate pattern type distribution
    const patternTypes: Record<string, number> = {};
    for (const pattern of allPatterns) {
      patternTypes[pattern.type] = (patternTypes[pattern.type] || 0) + 1;
    }
    
    // Extract similarity scores
    const similarityScores = allDuplicates.map(d => d.similarity.score);
    
    return {
      totalFiles,
      duplicatesFound: allDuplicates.length,
      similarityScores,
      patternTypes,
      processingTime: 0, // Will be set by caller
      optimizationStats: stats
    };
  }

  private async storeResultsAsync(userId: string, batchResults: BatchProcessingResult[]): Promise<void> {
    // Don't await this - fire and forget for better performance
    setImmediate(async () => {
      try {
        // Convert batch results to storage format
        const analysisResults = batchResults.map(batch => ({
          projectId: 'batch', // You may want to track project IDs better
          patterns: batch.patterns.map(p => ({
            filePath: p.filePath || '',
            patternHash: p.hash,
            codeSnippet: p.signature || '',
            patternType: p.type,
            lineStart: 1,
            lineEnd: p.lines || 1
          })),
          duplicates: batch.duplicates.map(d => ({
            patternHash: d.similarity.hash || '',
            similarityScore: d.similarity.score,
            patternType: d.similarity.type || 'unknown'
          }))
        }));

        await this.storage.storeAnalysisResults(userId, analysisResults);
      } catch (error) {
        logger.error('Failed to store analysis results asynchronously:', error);
      }
    });
  }

  private createEmptyResult(startTime: number, stats: any): AnalysisResult {
    return {
      totalFiles: 0,
      duplicatesFound: 0,
      similarityScores: [],
      patternTypes: {},
      processingTime: Date.now() - startTime,
      optimizationStats: stats
    };
  }

  private generateCacheKey(userId: string, projects: any[]): string {
    const projectsData = projects.map(p => ({
      id: p.id,
      updated: p.updated || p.lastUpdated,
      fileCount: p.fileCount || 0
    }));
    
    const projectsHash = PatternDetector.generatePatternHash(
      JSON.stringify(projectsData) + this.CACHE_VERSION
    );
    
    return `analysis_${userId}_${projectsHash}`;
  }

  private isCacheValid(cached: CachedAnalysis, projects: any[]): boolean {
    // Check cache version
    if (cached.version !== this.CACHE_VERSION) return false;
    
    // Check if cache is too old (more than 24 hours)
    if (Date.now() - cached.timestamp > 1000 * 60 * 60 * 24) return false;
    
    // Check project hashes
    const currentHashes = projects.map(p => 
      PatternDetector.generatePatternHash(JSON.stringify(p))
    );
    
    return JSON.stringify(cached.projectHashes) === JSON.stringify(currentHashes);
  }

  private cleanupCache(): void {
    const before = this.analysisCache.size + this.patternCache.size;
    
    // Let LRU cache handle its own cleanup, just log stats
    const after = this.analysisCache.size + this.patternCache.size;
    
    if (before !== after) {
      logger.info(`Cache cleanup: ${before} -> ${after} entries`);
    }
  }

  // Public method to get cache statistics
  public getCacheStats() {
    return {
      analysisCache: {
        size: this.analysisCache.size,
        max: this.analysisCache.max
      },
      patternCache: {
        size: this.patternCache.size,
        max: this.patternCache.max
      },
      activeProcessing: this.processingQueue.size
    };
  }

  // Method to clear caches if needed
  public clearCaches(): void {
    this.analysisCache.clear();
    this.patternCache.clear();
    logger.info('Analysis and pattern caches cleared');
  }
}

export default AnalysisService;
