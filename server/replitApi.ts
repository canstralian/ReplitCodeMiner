
import crypto from 'crypto';

export interface ReplitProject {
  id: string;
  title: string;
  description?: string;
  language: string;
  url: string;
  fileCount?: number;
  lastUpdated?: string;
}

export interface CodeFile {
  path: string;
  content: string;
  language: string;
  size: number;
}

export interface CodePattern {
  filePath: string;
  patternHash: string;
  codeSnippet: string;
  patternType: 'function' | 'import' | 'component' | 'class';
  lineStart: number;
  lineEnd: number;
  complexity?: number;
}

export interface DuplicateMatch {
  patternHash: string;
  similarityScore: number;
  patternType: string;
  matches: CodePattern[];
}

export interface AnalysisResult {
  projectId: string;
  patterns: CodePattern[];
  duplicates: DuplicateMatch[];
  metrics: {
    filesAnalyzed: number;
    patternsFound: number;
    duplicatesDetected: number;
    processingTime: number;
  };
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class ReplitApiService {
  private readonly baseUrl = 'https://replit.com/graphql';
  private readonly cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CONCURRENT_REQUESTS = 3;
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private getCachedData<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCachedData<T>(key: string, data: T, ttl = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  async fetchUserProjects(accessToken: string): Promise<ReplitProject[]> {
    const cacheKey = `projects:${accessToken.slice(-8)}`;
    const cached = this.getCachedData<ReplitProject[]>(cacheKey);
    if (cached) return cached;

    try {
      const query = `
        query {
          currentUser {
            repls(first: 100) {
              items {
                id
                title
                description
                url
                language
                timeUpdated
                files {
                  path
                  type
                }
              }
            }
          }
        }
      `;

      const response = await this.fetchWithTimeout(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      const repls = data.data?.currentUser?.repls?.items || [];

      const projects = repls.map((repl: any) => ({
        id: repl.id,
        title: repl.title,
        description: repl.description,
        language: repl.language || 'unknown',
        url: repl.url,
        fileCount: repl.files?.filter((f: any) => f.type === 'file').length || 0,
        lastUpdated: repl.timeUpdated,
      }));

      this.setCachedData(cacheKey, projects);
      return projects;
    } catch (error) {
      console.error('Error fetching user projects:', error);
      throw new Error(`Failed to fetch projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fetchProjectFiles(accessToken: string, projectId: string): Promise<CodeFile[]> {
    const cacheKey = `files:${projectId}`;
    const cached = this.getCachedData<CodeFile[]>(cacheKey);
    if (cached) return cached;

    try {
      const query = `
        query GetReplFiles($replId: String!) {
          repl(id: $replId) {
            files {
              path
              content
              type
              size
            }
          }
        }
      `;

      const response = await this.fetchWithTimeout(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { replId: projectId },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      const files = data.data?.repl?.files || [];

      const codeFiles = files
        .filter((file: any) => file.type === 'file' && this.isCodeFile(file.path) && file.size < 1024 * 1024) // Skip files > 1MB
        .map((file: any) => ({
          path: file.path,
          content: file.content || '',
          language: this.getLanguageFromPath(file.path),
          size: file.size || 0,
        }));

      this.setCachedData(cacheKey, codeFiles, this.CACHE_TTL * 2); // Cache files longer
      return codeFiles;
    } catch (error) {
      console.error('Error fetching project files:', error);
      throw new Error(`Failed to fetch files for project ${projectId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeProjects(accessToken: string, projectIds: string[]): Promise<AnalysisResult[]> {
    const startTime = Date.now();
    const results: AnalysisResult[] = [];
    
    // Process projects in batches to avoid overwhelming the API
    const batches = this.chunkArray(projectIds, this.MAX_CONCURRENT_REQUESTS);
    
    for (const batch of batches) {
      const batchPromises = batch.map(async (projectId) => {
        const projectStartTime = Date.now();
        
        try {
          const files = await this.fetchProjectFiles(accessToken, projectId);
          const patterns = this.extractCodePatterns(files);
          const duplicates = this.findDuplicates(patterns);

          return {
            projectId,
            patterns,
            duplicates,
            metrics: {
              filesAnalyzed: files.length,
              patternsFound: patterns.length,
              duplicatesDetected: duplicates.length,
              processingTime: Date.now() - projectStartTime,
            },
          };
        } catch (error) {
          console.error('Error analyzing project:', { 
            projectId, 
            error: error instanceof Error ? error.message : String(error) 
          });
          
          return {
            projectId,
            patterns: [],
            duplicates: [],
            metrics: {
              filesAnalyzed: 0,
              patternsFound: 0,
              duplicatesDetected: 0,
              processingTime: Date.now() - projectStartTime,
            },
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    console.log(`Analysis completed in ${Date.now() - startTime}ms for ${projectIds.length} projects`);
    return results;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private extractCodePatterns(files: CodeFile[]): CodePattern[] {
    const patterns: CodePattern[] = [];

    for (const file of files) {
      if (file.content.length > 50000) continue; // Skip very large files
      
      const lines = file.content.split('\n');

      try {
        // Extract patterns based on file type
        const functionPatterns = this.extractFunctionPatterns(file, lines);
        const importPatterns = this.extractImportPatterns(file, lines);
        
        patterns.push(...functionPatterns, ...importPatterns);

        // Extract component patterns for JS/TS files
        if (['javascript', 'typescript'].includes(file.language)) {
          const componentPatterns = this.extractComponentPatterns(file, lines);
          patterns.push(...componentPatterns);
        }

        // Extract class patterns for OOP languages
        if (['javascript', 'typescript', 'python'].includes(file.language)) {
          const classPatterns = this.extractClassPatterns(file, lines);
          patterns.push(...classPatterns);
        }
      } catch (error) {
        console.warn(`Error extracting patterns from ${file.path}:`, error);
      }
    }

    return patterns;
  }

  private extractFunctionPatterns(file: CodeFile, lines: string[]): CodePattern[] {
    const patterns: CodePattern[] = [];
    const functionRegexes = {
      javascript: /(?:function\s+(\w+)|const\s+(\w+)\s*=|(\w+)\s*:\s*function|(\w+)\s*=\s*\(.*?\)\s*=>)/g,
      python: /def\s+(\w+)\s*\(/g,
      java: /(?:public|private|protected)?\s*(?:static)?\s*\w+\s+(\w+)\s*\(/g,
    };

    const regex = functionRegexes[file.language as keyof typeof functionRegexes] || functionRegexes.javascript;

    lines.forEach((line, index) => {
      let match;
      const lineRegex = new RegExp(regex.source, regex.flags);
      
      while ((match = lineRegex.exec(line)) !== null) {
        const functionName = match[1] || match[2] || match[3] || match[4];
        if (!functionName) continue;

        const snippet = this.extractFunctionBody(lines, index);
        const hash = this.hashCode(snippet);
        const complexity = this.calculateCyclomaticComplexity(snippet);

        patterns.push({
          filePath: file.path,
          patternHash: hash,
          codeSnippet: snippet,
          patternType: 'function',
          lineStart: index + 1,
          lineEnd: index + snippet.split('\n').length,
          complexity,
        });
      }
    });

    return patterns;
  }

  private extractClassPatterns(file: CodeFile, lines: string[]): CodePattern[] {
    const patterns: CodePattern[] = [];
    const classRegexes = {
      javascript: /class\s+(\w+)/g,
      typescript: /class\s+(\w+)/g,
      python: /class\s+(\w+)/g,
    };

    const regex = classRegexes[file.language as keyof typeof classRegexes];
    if (!regex) return patterns;

    lines.forEach((line, index) => {
      const match = regex.exec(line);
      if (match) {
        const className = match[1];
        const snippet = this.extractClassBody(lines, index);
        const hash = this.hashCode(snippet);

        patterns.push({
          filePath: file.path,
          patternHash: hash,
          codeSnippet: snippet,
          patternType: 'class',
          lineStart: index + 1,
          lineEnd: index + snippet.split('\n').length,
        });
      }
    });

    return patterns;
  }

  private extractImportPatterns(file: CodeFile, lines: string[]): CodePattern[] {
    const patterns: CodePattern[] = [];
    const importRegexes = {
      javascript: /^import\s+.*from\s+['"]([^'"]+)['"];?$/,
      typescript: /^import\s+.*from\s+['"]([^'"]+)['"];?$/,
      python: /^(?:from\s+\S+\s+)?import\s+.+$/,
    };

    const regex = importRegexes[file.language as keyof typeof importRegexes];
    if (!regex) return patterns;

    lines.forEach((line, index) => {
      const match = regex.exec(line.trim());
      if (match) {
        const hash = this.hashCode(line.trim());

        patterns.push({
          filePath: file.path,
          patternHash: hash,
          codeSnippet: line.trim(),
          patternType: 'import',
          lineStart: index + 1,
          lineEnd: index + 1,
        });
      }
    });

    return patterns;
  }

  private extractComponentPatterns(file: CodeFile, lines: string[]): CodePattern[] {
    const patterns: CodePattern[] = [];
    const componentRegex = /(?:const\s+(\w+)\s*=.*=>|function\s+(\w+)\s*\(.*\)\s*{)/;

    lines.forEach((line, index) => {
      const match = componentRegex.exec(line);
      if (match && this.looksLikeReactComponent(line)) {
        const componentName = match[1] || match[2];
        const snippet = this.extractComponentBody(lines, index);
        const hash = this.hashCode(snippet);

        patterns.push({
          filePath: file.path,
          patternHash: hash,
          codeSnippet: snippet,
          patternType: 'component',
          lineStart: index + 1,
          lineEnd: index + snippet.split('\n').length,
        });
      }
    });

    return patterns;
  }

  private extractFunctionBody(lines: string[], startIndex: number): string {
    const result = [lines[startIndex]];
    let braceCount = 0;
    let i = startIndex;

    // Count opening braces in the first line
    for (const char of lines[startIndex]) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }

    // Continue until braces are balanced or we hit a reasonable limit
    while (braceCount > 0 && i + 1 < lines.length && result.length < 100) {
      i++;
      result.push(lines[i]);

      for (const char of lines[i]) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (braceCount === 0) break;
      }
    }

    return result.join('\n');
  }

  private extractClassBody(lines: string[], startIndex: number): string {
    return this.extractFunctionBody(lines, startIndex);
  }

  private extractComponentBody(lines: string[], startIndex: number): string {
    return this.extractFunctionBody(lines, startIndex);
  }

  private calculateCyclomaticComplexity(code: string): number {
    const complexityKeywords = ['if', 'else', 'while', 'for', 'case', 'catch', '&&', '||', '?'];
    let complexity = 1; // Base complexity

    complexityKeywords.forEach(keyword => {
      const matches = code.match(new RegExp(`\\b${keyword}\\b`, 'g'));
      complexity += matches ? matches.length : 0;
    });

    return complexity;
  }

  private looksLikeReactComponent(line: string): boolean {
    return /return\s*\(|\<[A-Z]|jsx|React|useState|useEffect/.test(line);
  }

  private findDuplicates(patterns: CodePattern[]): DuplicateMatch[] {
    const duplicates: DuplicateMatch[] = [];
    const hashGroups: Record<string, CodePattern[]> = {};

    // Group patterns by hash
    patterns.forEach(pattern => {
      if (!hashGroups[pattern.patternHash]) {
        hashGroups[pattern.patternHash] = [];
      }
      hashGroups[pattern.patternHash].push(pattern);
    });

    // Find exact duplicates
    Object.entries(hashGroups).forEach(([hash, group]) => {
      if (group.length > 1) {
        duplicates.push({
          patternHash: hash,
          similarityScore: 1.0,
          patternType: group[0].patternType,
          matches: group,
        });
      }
    });

    // Find fuzzy duplicates (only for functions with reasonable size)
    const functionPatterns = patterns.filter(p => 
      p.patternType === 'function' && 
      p.codeSnippet.length > 50 && 
      p.codeSnippet.length < 1000
    );

    for (let i = 0; i < functionPatterns.length; i++) {
      for (let j = i + 1; j < functionPatterns.length; j++) {
        const similarity = this.calculateSimilarity(
          functionPatterns[i].codeSnippet,
          functionPatterns[j].codeSnippet
        );

        if (similarity > 0.8 && similarity < 1.0) {
          duplicates.push({
            patternHash: `fuzzy_${i}_${j}`,
            similarityScore: similarity,
            patternType: 'function',
            matches: [functionPatterns[i], functionPatterns[j]],
          });
        }
      }
    }

    return duplicates;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1.0;
    
    const distance = this.levenshteinDistance(str1, str2);
    return (maxLen - distance) / maxLen;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    if (str1.length === 0) return str2.length;
    if (str2.length === 0) return str1.length;

    const matrix: number[][] = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private hashCode(str: string): string {
    // Normalize whitespace and remove comments for better duplicate detection
    const normalized = str
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  private isCodeFile(path: string): boolean {
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.html', '.css', '.scss', '.json', '.md'];
    return codeExtensions.some(ext => path.toLowerCase().endsWith(ext));
  }

  private getLanguageFromPath(path: string): string {
    const ext = path.toLowerCase().split('.').pop();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript', 
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
    };
    return languageMap[ext || ''] || 'text';
  }

  // Memory management
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}
