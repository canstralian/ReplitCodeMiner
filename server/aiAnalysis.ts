
import { logger, AppError } from './logger';
import config from './config';

export interface SemanticAnalysisResult {
  similarity: number;
  explanation: string;
  refactoringSuggestions: RefactoringSuggestion[];
  codeQuality: CodeQualityMetrics;
}

export interface RefactoringSuggestion {
  type: 'extract_function' | 'create_module' | 'template' | 'optimize';
  title: string;
  description: string;
  beforeCode: string;
  afterCode: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  potentialSavings: number; // minutes
  priority: number; // 1-5
}

export interface CodeQualityMetrics {
  complexity: number;
  maintainabilityIndex: number;
  technicalDebt: number; // minutes
  codeSmells: CodeSmell[];
  securityIssues: SecurityIssue[];
  performance: PerformanceMetric[];
}

export interface CodeSmell {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  location: { line: number; column: number };
  suggestion: string;
}

export interface SecurityIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: { line: number; column: number };
  recommendation: string;
}

export interface PerformanceMetric {
  type: string;
  impact: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
}

export interface AIProvider {
  name: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
}

export class AIAnalysisService {
  private readonly providers: Map<string, AIProvider>;
  private readonly defaultProvider: string;

  constructor() {
    this.providers = new Map();
    this.defaultProvider = config.ai.defaultProvider;
    
    // Initialize providers
    Object.entries(config.ai.providers).forEach(([name, config]) => {
      if (config.apiKey) {
        this.providers.set(name, {
          name,
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          model: config.model,
          maxTokens: config.maxTokens
        });
      }
    });
    
    if (this.providers.size === 0) {
      logger.warn('No AI providers configured. AI analysis features will be limited.');
    } else {
      logger.info(`Initialized ${this.providers.size} AI provider(s): ${Array.from(this.providers.keys()).join(', ')}`);
    }
  }

  async analyzeSemanticSimilarity(
    code1: string, 
    code2: string, 
    context?: { language: string; patternType: string; provider?: string }
  ): Promise<SemanticAnalysisResult> {
    const provider = this.getProvider(context?.provider);
    
    if (!provider) {
      return this.getFallbackAnalysis(code1, code2);
    }

    const prompt = this.buildSemanticAnalysisPrompt(code1, code2, context);
    
    try {
      const response = await this.callAIProvider(provider, prompt, 'code analysis');
      return this.parseAIResponse(response);
    } catch (error) {
      logger.error('AI analysis failed', { 
        error: (error as Error).message, 
        provider: provider.name 
      });
      
      // Try fallback provider if current one fails
      const fallbackProvider = this.getFallbackProvider(provider.name);
      if (fallbackProvider) {
        try {
          const response = await this.callAIProvider(fallbackProvider, prompt, 'code analysis');
          return this.parseAIResponse(response);
        } catch (fallbackError) {
          logger.error('Fallback AI analysis also failed', { 
            error: (fallbackError as Error).message,
            fallbackProvider: fallbackProvider.name
          });
        }
      }
      
      return this.getFallbackAnalysis(code1, code2);
    }
  }

  async generateRefactoringSuggestions(
    duplicatePatterns: Array<{ code: string; filePath: string; projectName: string }>,
    options?: { provider?: string }
  ): Promise<RefactoringSuggestion[]> {
    const provider = this.getProvider(options?.provider);
    
    if (!provider) {
      return this.getFallbackRefactoringSuggestions(duplicatePatterns);
    }

    const prompt = this.buildRefactoringPrompt(duplicatePatterns);
    
    try {
      const response = await this.callAIProvider(provider, prompt, 'refactoring analysis');
      return this.parseRefactoringSuggestions(response);
    } catch (error) {
      logger.error('Refactoring suggestion generation failed', { 
        error: (error as Error).message,
        provider: provider.name
      });
      
      // Try fallback provider
      const fallbackProvider = this.getFallbackProvider(provider.name);
      if (fallbackProvider) {
        try {
          const response = await this.callAIProvider(fallbackProvider, prompt, 'refactoring analysis');
          return this.parseRefactoringSuggestions(response);
        } catch (fallbackError) {
          logger.error('Fallback refactoring analysis also failed', { 
            error: (fallbackError as Error).message,
            fallbackProvider: fallbackProvider.name
          });
        }
      }
      
      return this.getFallbackRefactoringSuggestions(duplicatePatterns);
    }
  }

  async analyzeCodeQuality(code: string, language: string): Promise<CodeQualityMetrics> {
    // Use local analysis for code quality metrics
    return this.analyzeCodeQualityLocal(code, language);
  }

  private buildSemanticAnalysisPrompt(
    code1: string, 
    code2: string, 
    context?: { language: string; patternType: string }
  ): string {
    return `
Analyze the semantic similarity between these two code snippets:

Language: ${context?.language || 'Unknown'}
Pattern Type: ${context?.patternType || 'Unknown'}

Code Snippet 1:
\`\`\`
${code1}
\`\`\`

Code Snippet 2:
\`\`\`
${code2}
\`\`\`

Please provide a JSON response with the following structure:
{
  "similarity": <number between 0-100>,
  "explanation": "<detailed explanation of similarities and differences>",
  "refactoringSuggestions": [
    {
      "type": "extract_function|create_module|template|optimize",
      "title": "<brief title>",
      "description": "<detailed description>",
      "beforeCode": "<original code>",
      "afterCode": "<refactored code>",
      "estimatedEffort": "low|medium|high",
      "potentialSavings": <minutes as number>,
      "priority": <1-5>
    }
  ],
  "codeQuality": {
    "complexity": <1-10>,
    "maintainabilityIndex": <0-100>,
    "technicalDebt": <minutes as number>,
    "codeSmells": [],
    "securityIssues": [],
    "performance": []
  }
}`;
  }

  private buildRefactoringPrompt(
    duplicatePatterns: Array<{ code: string; filePath: string; projectName: string }>
  ): string {
    const patternsText = duplicatePatterns.map((pattern, index) => 
      `Pattern ${index + 1} (${pattern.filePath} in ${pattern.projectName}):\n\`\`\`\n${pattern.code}\n\`\`\``
    ).join('\n\n');

    return `
Analyze these duplicate code patterns and suggest refactoring improvements:

${patternsText}

Please provide specific refactoring suggestions in JSON format:
{
  "suggestions": [
    {
      "type": "extract_function|create_module|template|optimize",
      "title": "<brief title>",
      "description": "<detailed description>",
      "beforeCode": "<example of current code>",
      "afterCode": "<example of refactored code>",
      "estimatedEffort": "low|medium|high",
      "potentialSavings": <estimated time saved in minutes>,
      "priority": <1-5 priority level>
    }
  ]
}`;
  }

  private parseAIResponse(response: string): SemanticAnalysisResult {
    try {
      const parsed = JSON.parse(response);
      return {
        similarity: parsed.similarity || 0,
        explanation: parsed.explanation || 'No explanation provided',
        refactoringSuggestions: parsed.refactoringSuggestions || [],
        codeQuality: parsed.codeQuality || this.getDefaultCodeQuality()
      };
    } catch (error) {
      logger.error('Failed to parse AI response', { error: (error as Error).message, response });
      return this.getFallbackAnalysis('', '');
    }
  }

  private parseRefactoringSuggestions(response: string): RefactoringSuggestion[] {
    try {
      const parsed = JSON.parse(response);
      return parsed.suggestions || [];
    } catch (error) {
      logger.error('Failed to parse refactoring suggestions', { error: (error as Error).message });
      return [];
    }
  }

  private getFallbackAnalysis(code1: string, code2: string): SemanticAnalysisResult {
    // Simple lexical similarity as fallback
    const similarity = this.calculateLexicalSimilarity(code1, code2);
    
    return {
      similarity,
      explanation: `Lexical similarity analysis (${similarity}% match). AI analysis unavailable.`,
      refactoringSuggestions: this.getFallbackRefactoringSuggestions([
        { code: code1, filePath: 'file1', projectName: 'project1' },
        { code: code2, filePath: 'file2', projectName: 'project2' }
      ]),
      codeQuality: this.getDefaultCodeQuality()
    };
  }

  private getFallbackRefactoringSuggestions(
    patterns: Array<{ code: string; filePath: string; projectName: string }>
  ): RefactoringSuggestion[] {
    // Basic rule-based suggestions
    const suggestions: RefactoringSuggestion[] = [];

    if (patterns.length >= 2) {
      suggestions.push({
        type: 'extract_function',
        title: 'Extract Common Function',
        description: 'Consider extracting this repeated code into a reusable function.',
        beforeCode: patterns[0].code,
        afterCode: `// Extract to utility function\nfunction extractedFunction() {\n  ${patterns[0].code.split('\n').map(line => `  ${line}`).join('\n')}\n}`,
        estimatedEffort: 'medium',
        potentialSavings: 30,
        priority: 3
      });
    }

    if (patterns.length >= 3) {
      suggestions.push({
        type: 'create_module',
        title: 'Create Shared Module',
        description: 'This pattern appears frequently and could be moved to a shared module.',
        beforeCode: patterns[0].code,
        afterCode: '// Move to shared/utils.js\nexport { extractedFunction }',
        estimatedEffort: 'high',
        potentialSavings: 60,
        priority: 4
      });
    }

    return suggestions;
  }

  private calculateLexicalSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 100;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return Math.round(((longer.length - distance) / longer.length) * 100);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
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

  private analyzeCodeQualityLocal(code: string, language: string): CodeQualityMetrics {
    // Basic local analysis - can be enhanced with AST parsing
    const lines = code.split('\n');
    const complexity = this.calculateCyclomaticComplexity(code);
    const maintainabilityIndex = this.calculateMaintainabilityIndex(code, complexity);
    
    return {
      complexity,
      maintainabilityIndex,
      technicalDebt: Math.max(0, (complexity - 5) * 10), // rough estimate
      codeSmells: this.detectCodeSmells(code, lines),
      securityIssues: this.detectSecurityIssues(code, language),
      performance: this.detectPerformanceIssues(code, language)
    };
  }

  private calculateCyclomaticComplexity(code: string): number {
    // Simple approximation of cyclomatic complexity
    let complexity = 1; // Base complexity
    
    const complexityKeywords = [
      /\bif\b/g, /\belse\b/g, /\bwhile\b/g, /\bfor\b/g, 
      /\bswitch\b/g, /\bcase\b/g, /\bcatch\b/g, /\b\?\b/g,
      /\b&&\b/g, /\b\|\|\b/g
    ];
    
    complexityKeywords.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return Math.min(complexity, 10); // Cap at 10
  }

  private calculateMaintainabilityIndex(code: string, complexity: number): number {
    const linesOfCode = code.split('\n').filter(line => line.trim().length > 0).length;
    const commentLines = code.split('\n').filter(line => 
      line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')
    ).length;
    
    const commentRatio = linesOfCode > 0 ? commentLines / linesOfCode : 0;
    const baseScore = Math.max(0, 100 - complexity * 5 - Math.max(0, linesOfCode - 50));
    const commentBonus = commentRatio * 10;
    
    return Math.min(100, Math.max(0, baseScore + commentBonus));
  }

  private detectCodeSmells(code: string, lines: string[]): CodeSmell[] {
    const smells: CodeSmell[] = [];
    
    // Long function detection
    if (lines.length > 50) {
      smells.push({
        type: 'long_function',
        severity: 'medium',
        description: 'This function is very long and might be doing too much',
        location: { line: 1, column: 1 },
        suggestion: 'Consider breaking this function into smaller, more focused functions'
      });
    }
    
    // Deep nesting detection
    lines.forEach((line, index) => {
      const indentLevel = (line.match(/^[\s]*/)?.[0]?.length || 0) / 2;
      if (indentLevel > 6) {
        smells.push({
          type: 'deep_nesting',
          severity: 'high',
          description: 'Deep nesting makes code hard to read and understand',
          location: { line: index + 1, column: 1 },
          suggestion: 'Consider extracting nested logic into separate functions or using early returns'
        });
      }
    });
    
    return smells;
  }

  private detectSecurityIssues(code: string, language: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    
    // Basic security pattern detection
    const securityPatterns = [
      { pattern: /eval\(/g, type: 'code_injection', severity: 'critical' as const },
      { pattern: /innerHTML\s*=/g, type: 'xss', severity: 'high' as const },
      { pattern: /document\.write\(/g, type: 'xss', severity: 'medium' as const },
      { pattern: /localStorage\.setItem.*password/gi, type: 'sensitive_data', severity: 'high' as const }
    ];
    
    securityPatterns.forEach(({ pattern, type, severity }) => {
      const matches = Array.from(code.matchAll(pattern));
      matches.forEach(match => {
        const lineNumber = code.substring(0, match.index).split('\n').length;
        issues.push({
          type,
          severity,
          description: `Potential ${type.replace('_', ' ')} vulnerability detected`,
          location: { line: lineNumber, column: match.index || 0 },
          recommendation: `Review and secure this ${type.replace('_', ' ')} usage`
        });
      });
    });
    
    return issues;
  }

  private detectPerformanceIssues(code: string, language: string): PerformanceMetric[] {
    const issues: PerformanceMetric[] = [];
    
    // Basic performance pattern detection
    if (code.includes('for') && code.includes('for')) {
      const nestedLoops = (code.match(/for.*for/gs) || []).length;
      if (nestedLoops > 0) {
        issues.push({
          type: 'nested_loops',
          impact: 'high',
          description: 'Nested loops can cause performance issues with large datasets',
          recommendation: 'Consider optimizing algorithm complexity or using more efficient data structures'
        });
      }
    }
    
    if (language === 'javascript' && code.includes('document.querySelector')) {
      const domQueries = (code.match(/document\.querySelector/g) || []).length;
      if (domQueries > 5) {
        issues.push({
          type: 'excessive_dom_queries',
          impact: 'medium',
          description: 'Multiple DOM queries can impact performance',
          recommendation: 'Cache DOM elements or use more efficient selection methods'
        });
      }
    }
    
    return issues;
  }

  private getDefaultCodeQuality(): CodeQualityMetrics {
    return {
      complexity: 1,
      maintainabilityIndex: 85,
      technicalDebt: 0,
      codeSmells: [],
      securityIssues: [],
      performance: []
    };
  }

  private getProvider(providerName?: string): AIProvider | null {
    const name = providerName || this.defaultProvider;
    return this.providers.get(name) || this.providers.values().next().value || null;
  }

  private getFallbackProvider(currentProvider: string): AIProvider | null {
    const available = Array.from(this.providers.values()).filter(p => p.name !== currentProvider);
    return available[0] || null;
  }

  private async callAIProvider(provider: AIProvider, prompt: string, systemMessage: string): Promise<string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    let requestBody: any;
    let url: string;

    switch (provider.name) {
      case 'openai':
      case 'groq':
        headers['Authorization'] = `Bearer ${provider.apiKey}`;
        url = `${provider.baseUrl}/chat/completions`;
        requestBody = {
          model: provider.model,
          messages: [
            { role: 'system', content: `You are an expert code analyst. ${systemMessage}` },
            { role: 'user', content: prompt }
          ],
          max_tokens: provider.maxTokens,
          temperature: 0.3,
        };
        break;

      case 'claude':
        headers['x-api-key'] = provider.apiKey;
        headers['anthropic-version'] = '2023-06-01';
        url = `${provider.baseUrl}/v1/messages`;
        requestBody = {
          model: provider.model,
          max_tokens: provider.maxTokens,
          messages: [
            { role: 'user', content: `${systemMessage}\n\n${prompt}` }
          ],
          temperature: 0.3,
        };
        break;

      case 'cohere':
        headers['Authorization'] = `Bearer ${provider.apiKey}`;
        url = `${provider.baseUrl}/generate`;
        requestBody = {
          model: provider.model,
          prompt: `${systemMessage}\n\n${prompt}`,
          max_tokens: provider.maxTokens,
          temperature: 0.3,
        };
        break;

      case 'google':
        url = `${provider.baseUrl}/models/${provider.model}:generateContent?key=${provider.apiKey}`;
        requestBody = {
          contents: [{
            parts: [{
              text: `${systemMessage}\n\n${prompt}`
            }]
          }],
          generationConfig: {
            maxOutputTokens: provider.maxTokens,
            temperature: 0.3,
          }
        };
        break;

      case 'codepal':
        headers['Authorization'] = `Bearer ${provider.apiKey}`;
        url = `${provider.baseUrl}/analyze`;
        requestBody = {
          model: provider.model,
          prompt,
          system_message: systemMessage,
          max_tokens: provider.maxTokens,
          temperature: 0.3,
        };
        break;

      default:
        throw new Error(`Unsupported AI provider: ${provider.name}`);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`${provider.name} API error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.extractResponse(data, provider.name);
  }

  private extractResponse(data: any, providerName: string): string {
    switch (providerName) {
      case 'openai':
      case 'groq':
        return data.choices[0]?.message?.content || '';

      case 'claude':
        return data.content[0]?.text || '';

      case 'cohere':
        return data.generations[0]?.text || '';

      case 'google':
        return data.candidates[0]?.content?.parts[0]?.text || '';

      case 'codepal':
        return data.response || data.analysis || '';

      default:
        throw new Error(`Unknown response format for provider: ${providerName}`);
    }
  }

  // Public method to get available providers
  public getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  // Public method to test provider connectivity
  public async testProvider(providerName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const provider = this.getProvider(providerName);
      if (!provider) {
        return { success: false, error: 'Provider not configured' };
      }

      await this.callAIProvider(provider, 'Test prompt', 'Respond with "OK"');
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

export const aiAnalysisService = new AIAnalysisService();
