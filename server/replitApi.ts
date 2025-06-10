import crypto from 'crypto';
import { logger, AppError } from './logger';

export interface ReplitProject {
  id: string;
  title: string;
  url: string;
  language: string;
  description?: string;
  fileCount?: number;
  lastUpdated?: Date;
}

export interface CodeFile {
  path: string;
  content: string;
  language: string;
}

export interface AnalysisResult {
  projectId: string;
  patterns: CodePattern[];
  duplicates: DuplicateMatch[];
}

export interface CodePattern {
  filePath: string;
  patternHash: string;
  codeSnippet: string;
  patternType: string;
  lineStart: number;
  lineEnd: number;
}

export interface DuplicateMatch {
  patterns: CodePattern[];
  similarityScore: number;
  patternType: string;
  description: string;
}

export class ReplitApiService {
  private readonly GRAPHQL_ENDPOINT = 'https://replit.com/graphql';
  
  async fetchUserProjects(accessToken: string): Promise<ReplitProject[]> {
    const query = `
      query GetUserRepls {
        currentUser {
          repls(first: 100) {
            items {
              id
              title
              url
              language
              description
              fileCount
              timeUpdated
            }
          }
        }
      }
    `;

    try {
      if (!accessToken) {
        throw new AppError('Access token is required', 401);
      }

      logger.debug('Fetching projects from Replit API');
      
      const response = await fetch(this.GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new AppError('Unauthorized access to Replit API', 401);
        }
        if (response.status === 429) {
          throw new AppError('Rate limit exceeded', 429);
        }
        throw new AppError(`Failed to fetch projects: ${response.statusText}`, response.status);
      }

      const data = await response.json();
      
      if (data.errors) {
        logger.error('GraphQL errors from Replit API', { errors: data.errors });
        throw new AppError(`GraphQL errors: ${JSON.stringify(data.errors)}`, 400);
      }

      const repls = data.data?.currentUser?.repls?.items || [];
      
      const projects = repls.map((repl: any) => {
        if (!repl.id || !repl.title) {
          logger.warn('Invalid repl data received', { repl });
          return null;
        }
        
        return {
          id: repl.id,
          title: repl.title,
          url: repl.url || '',
          language: repl.language || 'unknown',
          description: repl.description || '',
          fileCount: repl.fileCount || 0,
          lastUpdated: repl.timeUpdated ? new Date(repl.timeUpdated) : new Date(),
        };
      }).filter(Boolean);

      logger.info('Successfully fetched projects from Replit API', { count: projects.length });
      return projects;
    } catch (error) {
      logger.error('Error fetching Replit projects', { 
        error: (error as Error).message,
        stack: (error as Error).stack 
      });
      throw error instanceof AppError ? error : new AppError('Failed to fetch projects from Replit API', 500);
    }
  }

  async fetchProjectFiles(accessToken: string, projectId: string): Promise<CodeFile[]> {
    const query = `
      query GetReplFiles($replId: String!) {
        repl(id: $replId) {
          id
          files {
            id
            path
            content
            type
          }
        }
      }
    `;

    try {
      const response = await fetch(this.GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          variables: { replId: projectId }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project files: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      const files = data.data?.repl?.files || [];
      
      return files
        .filter((file: any) => file.type === 'file' && this.isCodeFile(file.path))
        .map((file: any) => ({
          path: file.path,
          content: file.content || '',
          language: this.getLanguageFromPath(file.path),
        }));
    } catch (error) {
      console.error('Error fetching project files:', error);
      throw error;
    }
  }

  async analyzeProjects(accessToken: string, projectIds: string[]): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];

    for (const projectId of projectIds) {
      try {
        const files = await this.fetchProjectFiles(accessToken, projectId);
        const patterns = this.extractCodePatterns(files);
        const duplicates = this.findDuplicates(patterns);
        
        results.push({
          projectId,
          patterns,
          duplicates,
        });
      } catch (error) {
        console.error(`Error analyzing project ${projectId}:`, error);
      }
    }

    return results;
  }

  private extractCodePatterns(files: CodeFile[]): CodePattern[] {
    const patterns: CodePattern[] = [];

    for (const file of files) {
      const lines = file.content.split('\n');
      
      // Extract function patterns
      const functionPatterns = this.extractFunctionPatterns(file, lines);
      patterns.push(...functionPatterns);
      
      // Extract import patterns
      const importPatterns = this.extractImportPatterns(file, lines);
      patterns.push(...importPatterns);
      
      // Extract component patterns (for React/Vue)
      if (file.language === 'javascript' || file.language === 'typescript') {
        const componentPatterns = this.extractComponentPatterns(file, lines);
        patterns.push(...componentPatterns);
      }
    }

    return patterns;
  }

  private extractFunctionPatterns(file: CodeFile, lines: string[]): CodePattern[] {
    const patterns: CodePattern[] = [];
    const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=|(\w+)\s*:\s*function)/;

    lines.forEach((line, index) => {
      const match = line.match(functionRegex);
      if (match) {
        const functionName = match[1] || match[2] || match[3];
        const snippet = this.extractFunctionBody(lines, index);
        const hash = this.hashCode(snippet);
        
        patterns.push({
          filePath: file.path,
          patternHash: hash,
          codeSnippet: snippet,
          patternType: 'function',
          lineStart: index + 1,
          lineEnd: index + snippet.split('\n').length,
        });
      }
    });

    return patterns;
  }

  private extractImportPatterns(file: CodeFile, lines: string[]): CodePattern[] {
    const patterns: CodePattern[] = [];
    const importRegex = /^import\s+.*from\s+['"]([^'"]+)['"];?$/;

    lines.forEach((line, index) => {
      const match = importRegex.exec(line.trim());
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

  private findDuplicates(patterns: CodePattern[]): DuplicateMatch[] {
    const duplicates: DuplicateMatch[] = [];
    const patternGroups = new Map<string, CodePattern[]>();

    // Group patterns by hash
    patterns.forEach(pattern => {
      if (!patternGroups.has(pattern.patternHash)) {
        patternGroups.set(pattern.patternHash, []);
      }
      patternGroups.get(pattern.patternHash)!.push(pattern);
    });

    // Find groups with multiple patterns (duplicates)
    patternGroups.forEach((groupPatterns, hash) => {
      if (groupPatterns.length > 1) {
        duplicates.push({
          patterns: groupPatterns,
          similarityScore: 100, // Exact match
          patternType: groupPatterns[0].patternType,
          description: `${groupPatterns.length} identical ${groupPatterns[0].patternType} patterns found`,
        });
      }
    });

    // Find similar patterns using fuzzy matching
    const similarDuplicates = this.findSimilarPatterns(patterns);
    duplicates.push(...similarDuplicates);

    return duplicates;
  }

  private findSimilarPatterns(patterns: CodePattern[]): DuplicateMatch[] {
    const similar: DuplicateMatch[] = [];
    const threshold = 0.8; // 80% similarity
    const processed = new Set<string>();

    // Group patterns by type for more efficient comparison
    const patternsByType = new Map<string, CodePattern[]>();
    patterns.forEach(pattern => {
      if (!patternsByType.has(pattern.patternType)) {
        patternsByType.set(pattern.patternType, []);
      }
      patternsByType.get(pattern.patternType)!.push(pattern);
    });

    // Only compare patterns of the same type
    patternsByType.forEach(typePatterns => {
      for (let i = 0; i < typePatterns.length; i++) {
        for (let j = i + 1; j < typePatterns.length; j++) {
          const pattern1 = typePatterns[i];
          const pattern2 = typePatterns[j];
          
          const pairKey = `${pattern1.patternHash}-${pattern2.patternHash}`;
          if (processed.has(pairKey)) continue;
          processed.add(pairKey);
          
          // Skip if patterns are too different in size
          const sizeDiff = Math.abs(pattern1.codeSnippet.length - pattern2.codeSnippet.length);
          if (sizeDiff > Math.max(pattern1.codeSnippet.length, pattern2.codeSnippet.length) * 0.5) {
            continue;
          }
          
          const similarity = this.calculateSimilarity(pattern1.codeSnippet, pattern2.codeSnippet);
          
          if (similarity >= threshold) {
            similar.push({
              patterns: [pattern1, pattern2],
              similarityScore: Math.round(similarity * 100),
              patternType: pattern1.patternType,
              description: `Similar ${pattern1.patternType} patterns with ${Math.round(similarity * 100)}% similarity`,
            });
          }
        }
      }
    });

    return similar;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private hashCode(str: string): string {
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  private isCodeFile(path: string): boolean {
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.html', '.css', '.scss', '.json', '.md'];
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
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
    };
    return languageMap[ext || ''] || 'text';
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
    
    // Continue until braces are balanced
    while (braceCount > 0 && i + 1 < lines.length) {
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

  private extractComponentBody(lines: string[], startIndex: number): string {
    // Similar to extractFunctionBody but with React-specific logic
    return this.extractFunctionBody(lines, startIndex);
  }

  private looksLikeReactComponent(line: string): boolean {
    // Check if line contains JSX-like patterns or common React patterns
    return /return\s*\(|\<[A-Z]|jsx|React/.test(line);
  }
}
