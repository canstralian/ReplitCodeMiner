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
}

export interface CodePattern {
  filePath: string;
  patternHash: string;
  codeSnippet: string;
  patternType: 'function' | 'import' | 'component' | 'class';
  lineStart: number;
  lineEnd: number;
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
}

export class ReplitApiService {
  private readonly baseUrl = 'https://replit.com/graphql';

  async fetchUserProjects(accessToken: string): Promise<ReplitProject[]> {
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
              }
            }
          }
        }
      `;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }

      const repls = data.data?.currentUser?.repls?.items || [];

      return repls.map((repl: any) => ({
        id: repl.id,
        title: repl.title,
        description: repl.description,
        language: repl.language || 'unknown',
        url: repl.url,
        fileCount: 0, // Will be updated when analyzing
        lastUpdated: repl.timeUpdated,
      }));
    } catch (error) {
      console.error('Error fetching user projects:', error);
      throw error;
    }
  }

  async fetchProjectFiles(accessToken: string, projectId: string): Promise<CodeFile[]> {
    try {
      const query = `
        query GetReplFiles($replId: String!) {
          repl(id: $replId) {
            files {
              path
              content
              type
            }
          }
        }
      `;

      const response = await fetch(this.baseUrl, {
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
        console.error('Error analyzing project:', { projectId, error: error instanceof Error ? error.message : String(error) });
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
    const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=|(\w+)\s*:\s*function)/g;

    lines.forEach((line, index) => {
      const match = functionRegex.exec(line);
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

    // Find groups with multiple patterns (duplicates)
    Object.entries(hashGroups).forEach(([hash, group]) => {
      if (group.length > 1) {
        duplicates.push({
          patternHash: hash,
          similarityScore: 1.0, // Exact match
          patternType: group[0].patternType,
          matches: group,
        });
      }
    });

    return duplicates;
  }

  private levenshteinDistance(str1: string, str2: string): number {
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
}