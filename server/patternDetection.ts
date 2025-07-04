
import crypto from 'crypto';
import { diffLines } from 'diff';

interface CodePattern {
  type: 'function' | 'class' | 'import' | 'component' | 'hook' | 'api_call';
  name: string;
  signature: string;
  hash: string;
  complexity: number;
  lines: number;
}

interface SimilarityResult {
  score: number;
  patterns: string[];
  type: 'structural' | 'semantic' | 'syntactic';
}

export class PatternDetector {
  private static readonly SIMILARITY_THRESHOLD = 0.75;
  private static readonly HASH_ALGORITHM = 'sha256';

  /**
   * Generate hash for code pattern - similar to Freqtrade's hash-based matching
   */
  static generatePatternHash(content: string): string {
    const normalizedContent = content
      .replace(/\s+/g, ' ')
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();
    
    return crypto.createHash(this.HASH_ALGORITHM)
      .update(normalizedContent)
      .digest('hex');
  }

  /**
   * Extract code patterns using AST-like analysis
   */
  static extractPatterns(content: string, filePath: string): CodePattern[] {
    const patterns: CodePattern[] = [];
    const lines = content.split('\n');

    // Function patterns
    const functionRegex = /(?:function|const|let|var)\s+(\w+)\s*[=:]?\s*(?:\([^)]*\)|=>)/g;
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      const signature = match[0];
      patterns.push({
        type: 'function',
        name: match[1],
        signature,
        hash: this.generatePatternHash(signature),
        complexity: this.calculateComplexity(signature),
        lines: signature.split('\n').length
      });
    }

    // React component patterns
    const componentRegex = /(?:export\s+)?(?:default\s+)?(?:function|const)\s+(\w+)\s*.*?(?:return\s*\(|=>)/g;
    while ((match = componentRegex.exec(content)) !== null) {
      const signature = match[0];
      patterns.push({
        type: 'component',
        name: match[1],
        signature,
        hash: this.generatePatternHash(signature),
        complexity: this.calculateComplexity(signature),
        lines: signature.split('\n').length
      });
    }

    // Import patterns
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    while ((match = importRegex.exec(content)) !== null) {
      const signature = match[0];
      patterns.push({
        type: 'import',
        name: match[1],
        signature,
        hash: this.generatePatternHash(signature),
        complexity: 1,
        lines: 1
      });
    }

    // Hook patterns
    const hookRegex = /const\s+\[([^\]]+)\]\s*=\s*use(\w+)/g;
    while ((match = hookRegex.exec(content)) !== null) {
      const signature = match[0];
      patterns.push({
        type: 'hook',
        name: `use${match[2]}`,
        signature,
        hash: this.generatePatternHash(signature),
        complexity: 2,
        lines: 1
      });
    }

    return patterns;
  }

  /**
   * Calculate similarity between two code blocks using multiple algorithms
   */
  static calculateSimilarity(content1: string, content2: string): SimilarityResult {
    // Structural similarity (hash-based)
    const hash1 = this.generatePatternHash(content1);
    const hash2 = this.generatePatternHash(content2);
    const structuralScore = hash1 === hash2 ? 1.0 : 0.0;

    // Semantic similarity (line-based diff)
    const diff = diffLines(content1, content2);
    const totalLines = Math.max(content1.split('\n').length, content2.split('\n').length);
    const changedLines = diff.filter(part => part.added || part.removed).length;
    const semanticScore = Math.max(0, 1 - (changedLines / totalLines));

    // Syntactic similarity (token-based)
    const tokens1 = this.tokenize(content1);
    const tokens2 = this.tokenize(content2);
    const syntacticScore = this.calculateJaccardSimilarity(tokens1, tokens2);

    // Weight and combine scores
    const finalScore = (structuralScore * 0.4) + (semanticScore * 0.4) + (syntacticScore * 0.2);
    
    const patterns = this.findCommonPatterns(content1, content2);
    const type = structuralScore > 0.8 ? 'structural' : 
                 semanticScore > 0.8 ? 'semantic' : 'syntactic';

    return {
      score: Math.round(finalScore * 100) / 100,
      patterns,
      type
    };
  }

  private static calculateComplexity(code: string): number {
    let complexity = 1;
    const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'try', 'catch'];
    
    for (const keyword of complexityKeywords) {
      const matches = code.match(new RegExp(`\\b${keyword}\\b`, 'g'));
      if (matches) {
        complexity += matches.length;
      }
    }
    
    return complexity;
  }

  private static tokenize(content: string): Set<string> {
    const tokens = content
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2)
      .map(token => token.toLowerCase());
    
    return new Set(tokens);
  }

  private static calculateJaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  private static findCommonPatterns(content1: string, content2: string): string[] {
    const patterns: string[] = [];
    
    // Common function patterns
    const func1 = content1.match(/function\s+\w+/g) || [];
    const func2 = content2.match(/function\s+\w+/g) || [];
    const commonFunctions = func1.filter(f => func2.includes(f));
    patterns.push(...commonFunctions);

    // Common imports
    const imports1 = content1.match(/import\s+.*?from\s+['"][^'"]+['"]/g) || [];
    const imports2 = content2.match(/import\s+.*?from\s+['"][^'"]+['"]/g) || [];
    const commonImports = imports1.filter(i => imports2.includes(i));
    patterns.push(...commonImports.map(i => i.replace(/import\s+.*?from\s+['"]([^'"]+)['"]/, '$1')));

    return [...new Set(patterns)];
  }
}

export default PatternDetector;
