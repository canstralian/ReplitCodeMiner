
import { createHash } from 'crypto';
import { diffLines } from 'diff';

export interface CodePattern {
  type: string;
  name: string;
  signature: string;
  hash: string;
  complexity: number;
  lines: number;
  filePath?: string;
  startLine?: number;
  endLine?: number;
}

export interface SimilarityResult {
  score: number;
  patterns: string[];
  type: 'structural' | 'semantic' | 'syntactic';
  hash?: string;
}

class PatternDetector {
  private static readonly SIMILARITY_THRESHOLD = 0.75;
  private static readonly HASH_ALGORITHM = 'sha256';
  private static readonly MAX_PATTERN_LENGTH = 10000; // Limit pattern size for memory efficiency
  
  // Pre-compiled regex patterns for better performance
  private static readonly REGEX_CACHE = {
    function: /(?:function|const|let|var)\s+(\w+)\s*[=:]?\s*(?:\([^)]*\)|=>)/g,
    component: /(?:export\s+)?(?:default\s+)?(?:function|const)\s+(\w+)\s*.*?(?:return\s*\(|=>)/g,
    import: /import\s+.*?from\s+['"]([^'"]+)['"]/g,
    hook: /const\s+\[([^\]]+)\]\s*=\s*use(\w+)/g,
    class: /class\s+(\w+)(?:\s+extends\s+\w+)?\s*\{/g,
    method: /(?:public|private|protected)?\s*(\w+)\s*\([^)]*\)\s*(?::\s*\w+)?\s*\{/g
  };

  /**
   * Generate optimized hash for code pattern
   */
  static generatePatternHash(content: string): string {
    if (!content || content.length === 0) return '';
    
    // Normalize content more efficiently
    const normalizedContent = this.normalizeContent(content);
    
    // Truncate very long content to prevent memory issues
    const truncatedContent = normalizedContent.length > this.MAX_PATTERN_LENGTH 
      ? normalizedContent.substring(0, this.MAX_PATTERN_LENGTH) + '...'
      : normalizedContent;
    
    return createHash(this.HASH_ALGORITHM)
      .update(truncatedContent)
      .digest('hex');
  }

  /**
   * Optimized content normalization
   */
  private static normalizeContent(content: string): string {
    return content
      // Remove comments (single line and multi-line)
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Remove trailing/leading whitespace
      .trim();
  }

  /**
   * Extract code patterns with improved performance
   */
  static extractPatterns(content: string, filePath: string): CodePattern[] {
    if (!content || content.length === 0) return [];
    
    const patterns: CodePattern[] = [];
    const lines = content.split('\n');
    const contentLength = content.length;
    
    // Skip very large files to prevent performance issues
    if (contentLength > 500000) { // 500KB limit
      console.warn(`Skipping large file: ${filePath} (${contentLength} characters)`);
      return [];
    }

    try {
      // Extract different pattern types efficiently
      this.extractFunctionPatterns(content, patterns, filePath);
      this.extractComponentPatterns(content, patterns, filePath);
      this.extractImportPatterns(content, patterns, filePath);
      this.extractHookPatterns(content, patterns, filePath);
      this.extractClassPatterns(content, patterns, filePath);
      this.extractMethodPatterns(content, patterns, filePath);

      // Add structural patterns
      this.extractStructuralPatterns(content, patterns, filePath, lines.length);

      return patterns;
    } catch (error) {
      console.error(`Error extracting patterns from ${filePath}:`, error);
      return [];
    }
  }

  private static extractFunctionPatterns(content: string, patterns: CodePattern[], filePath: string): void {
    const matches = this.getMatches(content, this.REGEX_CACHE.function);
    
    for (const match of matches) {
      if (match.match && match.match[1]) {
        const signature = match.match[0];
        patterns.push({
          type: 'function',
          name: match.match[1],
          signature: this.truncateSignature(signature),
          hash: this.generatePatternHash(signature),
          complexity: this.calculateComplexity(signature),
          lines: signature.split('\n').length,
          filePath,
          startLine: this.getLineNumber(content, match.index)
        });
      }
    }
  }

  private static extractComponentPatterns(content: string, patterns: CodePattern[], filePath: string): void {
    const matches = this.getMatches(content, this.REGEX_CACHE.component);
    
    for (const match of matches) {
      if (match.match && match.match[1]) {
        const signature = match.match[0];
        patterns.push({
          type: 'component',
          name: match.match[1],
          signature: this.truncateSignature(signature),
          hash: this.generatePatternHash(signature),
          complexity: this.calculateComplexity(signature),
          lines: signature.split('\n').length,
          filePath,
          startLine: this.getLineNumber(content, match.index)
        });
      }
    }
  }

  private static extractImportPatterns(content: string, patterns: CodePattern[], filePath: string): void {
    const matches = this.getMatches(content, this.REGEX_CACHE.import);
    
    for (const match of matches) {
      if (match.match && match.match[1]) {
        const signature = match.match[0];
        patterns.push({
          type: 'import',
          name: match.match[1],
          signature: this.truncateSignature(signature),
          hash: this.generatePatternHash(signature),
          complexity: 1,
          lines: 1,
          filePath,
          startLine: this.getLineNumber(content, match.index)
        });
      }
    }
  }

  private static extractHookPatterns(content: string, patterns: CodePattern[], filePath: string): void {
    const matches = this.getMatches(content, this.REGEX_CACHE.hook);
    
    for (const match of matches) {
      if (match.match && match.match[2]) {
        const signature = match.match[0];
        patterns.push({
          type: 'hook',
          name: `use${match.match[2]}`,
          signature: this.truncateSignature(signature),
          hash: this.generatePatternHash(signature),
          complexity: 2,
          lines: 1,
          filePath,
          startLine: this.getLineNumber(content, match.index)
        });
      }
    }
  }

  private static extractClassPatterns(content: string, patterns: CodePattern[], filePath: string): void {
    const matches = this.getMatches(content, this.REGEX_CACHE.class);
    
    for (const match of matches) {
      if (match.match && match.match[1]) {
        const signature = match.match[0];
        patterns.push({
          type: 'class',
          name: match.match[1],
          signature: this.truncateSignature(signature),
          hash: this.generatePatternHash(signature),
          complexity: this.calculateComplexity(signature),
          lines: signature.split('\n').length,
          filePath,
          startLine: this.getLineNumber(content, match.index)
        });
      }
    }
  }

  private static extractMethodPatterns(content: string, patterns: CodePattern[], filePath: string): void {
    const matches = this.getMatches(content, this.REGEX_CACHE.method);
    
    for (const match of matches) {
      if (match.match && match.match[1]) {
        const signature = match.match[0];
        patterns.push({
          type: 'method',
          name: match.match[1],
          signature: this.truncateSignature(signature),
          hash: this.generatePatternHash(signature),
          complexity: this.calculateComplexity(signature),
          lines: signature.split('\n').length,
          filePath,
          startLine: this.getLineNumber(content, match.index)
        });
      }
    }
  }

  private static extractStructuralPatterns(content: string, patterns: CodePattern[], filePath: string, lineCount: number): void {
    // Extract file-level structural information
    const fileExtension = filePath.split('.').pop()?.toLowerCase() || '';
    const structuralHash = this.generatePatternHash(`structure_${fileExtension}_${lineCount}`);
    
    patterns.push({
      type: 'structure',
      name: `${fileExtension}_structure`,
      signature: `File structure: ${lineCount} lines, ${content.length} chars`,
      hash: structuralHash,
      complexity: Math.ceil(lineCount / 100), // Complexity based on file size
      lines: lineCount,
      filePath
    });
  }

  private static getMatches(content: string, regex: RegExp): Array<{ match: RegExpExecArray; index: number }> {
    const matches: Array<{ match: RegExpExecArray; index: number }> = [];
    let match: RegExpExecArray | null;
    
    // Reset regex lastIndex to ensure proper matching
    regex.lastIndex = 0;
    
    while ((match = regex.exec(content)) !== null) {
      matches.push({ match, index: match.index });
      
      // Prevent infinite loops with zero-width matches
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      
      // Limit number of matches to prevent performance issues
      if (matches.length > 1000) {
        console.warn('Too many pattern matches, truncating results');
        break;
      }
    }
    
    return matches;
  }

  private static getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  private static truncateSignature(signature: string): string {
    const maxLength = 500; // Reasonable limit for signatures
    return signature.length > maxLength 
      ? signature.substring(0, maxLength) + '...'
      : signature;
  }

  /**
   * Optimized similarity calculation with early termination
   */
  static calculateSimilarity(content1: string, content2: string): SimilarityResult {
    if (!content1 || !content2) {
      return { score: 0, patterns: [], type: 'structural' };
    }

    // Quick length-based filter
    const lengthRatio = Math.min(content1.length, content2.length) / Math.max(content1.length, content2.length);
    if (lengthRatio < 0.3) {
      return { score: 0, patterns: [], type: 'structural' };
    }

    // Structural similarity (hash-based) - fastest check
    const hash1 = this.generatePatternHash(content1);
    const hash2 = this.generatePatternHash(content2);
    const structuralScore = hash1 === hash2 ? 1.0 : 0.0;

    if (structuralScore === 1.0) {
      return {
        score: 1.0,
        patterns: ['identical_hash'],
        type: 'structural',
        hash: hash1
      };
    }

    // Semantic similarity (optimized line-based diff)
    const semanticScore = this.calculateSemanticSimilarity(content1, content2);
    
    // Early termination if semantic similarity is too low
    if (semanticScore < 0.3) {
      return { score: semanticScore, patterns: [], type: 'semantic' };
    }

    // Syntactic similarity (token-based) - most expensive, do last
    const syntacticScore = this.calculateSyntacticSimilarity(content1, content2);

    // Weight and combine scores with optimized weights
    const finalScore = (structuralScore * 0.5) + (semanticScore * 0.3) + (syntacticScore * 0.2);
    
    const patterns = this.findCommonPatterns(content1, content2);
    const type = structuralScore > 0.8 ? 'structural' : 
                 semanticScore > 0.8 ? 'semantic' : 'syntactic';

    return {
      score: Math.round(finalScore * 1000) / 1000, // 3 decimal precision
      patterns,
      type
    };
  }

  private static calculateSemanticSimilarity(content1: string, content2: string): number {
    try {
      // Use smaller chunks for large files to improve performance
      const maxChunkSize = 5000;
      const chunk1 = content1.length > maxChunkSize ? content1.substring(0, maxChunkSize) : content1;
      const chunk2 = content2.length > maxChunkSize ? content2.substring(0, maxChunkSize) : content2;
      
      const diff = diffLines(chunk1, chunk2);
      const totalLines = Math.max(
        chunk1.split('\n').length,
        chunk2.split('\n').length
      );
      
      if (totalLines === 0) return 0;
      
      const changedLines = diff.filter(part => part.added || part.removed).length;
      return Math.max(0, 1 - (changedLines / totalLines));
    } catch (error) {
      console.error('Error in semantic similarity calculation:', error);
      return 0;
    }
  }

  private static calculateSyntacticSimilarity(content1: string, content2: string): number {
    try {
      const tokens1 = this.tokenizeEfficiently(content1);
      const tokens2 = this.tokenizeEfficiently(content2);
      return this.calculateJaccardSimilarity(tokens1, tokens2);
    } catch (error) {
      console.error('Error in syntactic similarity calculation:', error);
      return 0;
    }
  }

  private static calculateComplexity(code: string): number {
    let complexity = 1;
    
    // Use more comprehensive complexity keywords
    const complexityKeywords = [
      'if', 'else', 'for', 'while', 'switch', 'case', 
      'try', 'catch', 'finally', 'async', 'await',
      '&&', '||', '?', ':'
    ];
    
    for (const keyword of complexityKeywords) {
      const regex = keyword.length <= 2 
        ? new RegExp(`\\${keyword}`, 'g') // For operators like &&, ||
        : new RegExp(`\\b${keyword}\\b`, 'g'); // For keywords
        
      const matches = code.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    }
    
    return Math.min(complexity, 50); // Cap complexity to prevent extreme values
  }

  private static tokenizeEfficiently(content: string): Set<string> {
    // Optimized tokenization with size limits
    const maxTokens = 1000;
    const tokens = new Set<string>();
    
    // Split more efficiently and filter in one pass
    const words = content
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2 && token.length < 50)
      .map(token => token.toLowerCase());
    
    // Limit token count to prevent memory issues
    for (let i = 0; i < Math.min(words.length, maxTokens); i++) {
      tokens.add(words[i]);
    }
    
    return tokens;
  }

  private static calculateJaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
    if (set1.size === 0 && set2.size === 0) return 1.0;
    if (set1.size === 0 || set2.size === 0) return 0.0;
    
    const intersection = new Set(Array.from(set1).filter(x => set2.has(x)));
    const unionSize = set1.size + set2.size - intersection.size;
    
    return unionSize === 0 ? 0 : intersection.size / unionSize;
  }

  private static findCommonPatterns(content1: string, content2: string): string[] {
    const patterns: string[] = [];
    const maxPatterns = 10; // Limit to prevent performance issues
    
    try {
      // Common function patterns (optimized)
      const func1 = this.extractQuickPatterns(content1, /function\s+\w+/g);
      const func2 = this.extractQuickPatterns(content2, /function\s+\w+/g);
      const commonFunctions = func1.filter(f => func2.includes(f)).slice(0, maxPatterns);
      patterns.push(...commonFunctions);

      // Common imports (optimized)
      const imports1 = this.extractQuickPatterns(content1, /from\s+['"][^'"]+['"]/g);
      const imports2 = this.extractQuickPatterns(content2, /from\s+['"][^'"]+['"]/g);
      const commonImports = imports1.filter(i => imports2.includes(i)).slice(0, maxPatterns);
      patterns.push(...commonImports);

      return Array.from(new Set(patterns)).slice(0, maxPatterns);
    } catch (error) {
      console.error('Error finding common patterns:', error);
      return [];
    }
  }

  private static extractQuickPatterns(content: string, regex: RegExp): string[] {
    const matches = content.match(regex) || [];
    return matches.slice(0, 20); // Limit matches for performance
  }
}

export default PatternDetector;
