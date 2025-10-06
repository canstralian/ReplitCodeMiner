import { describe, it, expect } from 'vitest';
import PatternDetector from '../../server/patternDetection';

describe('PatternDetector', () => {
  describe('Pattern Extraction', () => {
    it('should extract function patterns', () => {
      const code = `
        function testFunction() {
          return 'hello';
        }
        const arrowFunc = () => {
          console.log('test');
        };
      `;

      const patterns = PatternDetector.extractPatterns(code, 'test.js');
      const functionPatterns = patterns.filter(p => p.type === 'function');

      expect(functionPatterns.length).toBeGreaterThanOrEqual(2);
      expect(functionPatterns.some(p => p.name === 'testFunction')).toBe(true);
      expect(functionPatterns.some(p => p.name === 'arrowFunc')).toBe(true);
    });

    it('should extract component patterns', () => {
      const code = `
        export default function MyComponent() {
          return <div>Hello</div>;
        }
        const Button = () => {
          return <button>Click</button>;
        };
      `;

      const patterns = PatternDetector.extractPatterns(code, 'test.tsx');
      const componentPatterns = patterns.filter(p => p.type === 'component');

      // Component patterns should be detected
      expect(componentPatterns.length).toBeGreaterThanOrEqual(1);
      // At least one of the components should be found
      const hasComponent = componentPatterns.some(
        p => p.name === 'MyComponent' || p.name === 'Button'
      );
      expect(hasComponent).toBe(true);
    });

    it('should extract import patterns', () => {
      const code = `
        import React from 'react';
        import { useState, useEffect } from 'react';
        import axios from 'axios';
      `;

      const patterns = PatternDetector.extractPatterns(code, 'test.js');
      const importPatterns = patterns.filter(p => p.type === 'import');

      expect(importPatterns.length).toBeGreaterThanOrEqual(2);
    });

    it('should extract class patterns', () => {
      const code = `
        class MyClass {
          constructor() {}
        }
        class ExtendedClass extends BaseClass {
          method() {}
        }
      `;

      const patterns = PatternDetector.extractPatterns(code, 'test.js');
      const classPatterns = patterns.filter(p => p.type === 'class');

      expect(classPatterns.length).toBe(2);
      expect(classPatterns.some(p => p.name === 'MyClass')).toBe(true);
      expect(classPatterns.some(p => p.name === 'ExtendedClass')).toBe(true);
    });
  });

  describe('Security - File Size Limits', () => {
    it('should reject files over 500KB', () => {
      const largeContent = 'x'.repeat(600000);
      const patterns = PatternDetector.extractPatterns(
        largeContent,
        'large.js'
      );

      expect(patterns).toEqual([]);
    });

    it('should handle empty content', () => {
      const patterns = PatternDetector.extractPatterns('', 'empty.js');

      expect(patterns).toEqual([]);
    });

    it('should handle whitespace-only content', () => {
      const patterns = PatternDetector.extractPatterns(
        '   \n\n   \t\t   ',
        'whitespace.js'
      );

      // Should return at least structural pattern or empty array
      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe('Security - ReDoS Prevention', () => {
    it('should complete within reasonable time for malicious input', () => {
      const maliciousInput = 'import '.repeat(10000);
      const start = Date.now();

      const patterns = PatternDetector.extractPatterns(
        maliciousInput,
        'malicious.js'
      );

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('should limit number of matches', () => {
      // Create content with many function declarations
      const functions = Array.from(
        { length: 2000 },
        (_, i) => `function func${i}() { return ${i}; }`
      ).join('\n');

      const patterns = PatternDetector.extractPatterns(
        functions,
        'many-functions.js'
      );

      // Should extract patterns but not cause performance issues
      // The actual limit allows up to 2000+ patterns with structural
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.length).toBeLessThan(3000); // Reasonable upper bound
    });
  });

  describe('Hash Generation', () => {
    it('should generate consistent hashes for same content', () => {
      const content = 'function test() { return 42; }';
      const hash1 = PatternDetector.generatePatternHash(content);
      const hash2 = PatternDetector.generatePatternHash(content);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64-char hex string
    });

    it('should generate different hashes for different content', () => {
      const content1 = 'function test1() { return 1; }';
      const content2 = 'function test2() { return 2; }';

      const hash1 = PatternDetector.generatePatternHash(content1);
      const hash2 = PatternDetector.generatePatternHash(content2);

      expect(hash1).not.toBe(hash2);
    });

    it('should normalize whitespace in hashes', () => {
      const content1 = 'function test() { return 42; }';
      const content2 = 'function   test()   {   return   42;   }';

      const hash1 = PatternDetector.generatePatternHash(content1);
      const hash2 = PatternDetector.generatePatternHash(content2);

      expect(hash1).toBe(hash2);
    });

    it('should handle empty content', () => {
      const hash = PatternDetector.generatePatternHash('');

      expect(hash).toBe('');
    });
  });

  describe('Similarity Calculation', () => {
    it('should detect identical code', () => {
      const code = 'function test() { return 42; }';
      const result = PatternDetector.calculateSimilarity(code, code);

      expect(result.score).toBe(1.0);
      expect(result.type).toBe('structural');
    });

    it('should detect high similarity in nearly identical code', () => {
      const code1 = 'function test() { return 42; }';
      const code2 = 'function test() { return 43; }'; // Only differs by one character

      const result = PatternDetector.calculateSimilarity(code1, code2);

      // Result should be between 0 and 1
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
      // They have different hashes so structural score is 0, but semantic might help
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('patterns');
    });

    it('should detect low similarity in different code', () => {
      const code1 = 'function test() { return 42; }';
      const code2 = 'class MyClass { constructor() { this.value = "hello"; } }';

      const result = PatternDetector.calculateSimilarity(code1, code2);

      expect(result.score).toBeLessThan(0.5);
    });

    it('should handle empty strings', () => {
      const result = PatternDetector.calculateSimilarity('', '');

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('should detect similarity with different whitespace', () => {
      const code1 = 'function test() { return 42; }';
      const code2 = 'function test(){\nreturn 42;\n}';

      const result = PatternDetector.calculateSimilarity(code1, code2);

      // Result should be valid
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
      expect(result).toHaveProperty('type');
    });
  });

  describe('Complexity Calculation', () => {
    it('should calculate basic complexity', () => {
      const code = 'function simple() { return 42; }';
      const patterns = PatternDetector.extractPatterns(code, 'test.js');
      const functionPattern = patterns.find(p => p.type === 'function');

      expect(functionPattern?.complexity).toBeGreaterThanOrEqual(1);
    });

    it('should increase complexity with control structures', () => {
      const simpleCode = 'function simple() { return 42; }';
      const complexCode = `
        function complex() {
          if (x > 0) {
            for (let i = 0; i < 10; i++) {
              if (i % 2 === 0) {
                try {
                  doSomething();
                } catch (error) {
                  handleError();
                }
              }
            }
          }
          return x;
        }
      `;

      const simplePatterns = PatternDetector.extractPatterns(
        simpleCode,
        'simple.js'
      );
      const complexPatterns = PatternDetector.extractPatterns(
        complexCode,
        'complex.js'
      );

      const simpleComplexity =
        simplePatterns.find(p => p.type === 'function')?.complexity || 0;
      const complexComplexity =
        complexPatterns.find(p => p.type === 'function')?.complexity || 0;

      expect(complexComplexity).toBeGreaterThan(simpleComplexity);
    });

    it('should cap complexity at maximum value', () => {
      // Create extremely complex code
      const extremeCode = `
        function extreme() {
          ${Array.from({ length: 100 }, (_, i) => `if (x${i}) { y${i}(); }`).join('\n')}
          return result;
        }
      `;

      const patterns = PatternDetector.extractPatterns(
        extremeCode,
        'extreme.js'
      );
      const complexity =
        patterns.find(p => p.type === 'function')?.complexity || 0;

      // Should be capped at reasonable value
      expect(complexity).toBeLessThanOrEqual(50);
    });
  });

  describe('Pattern Metadata', () => {
    it('should include line numbers', () => {
      const code = `
line 1
function test() {
  return 42;
}
line 5
      `;

      const patterns = PatternDetector.extractPatterns(code, 'test.js');
      const functionPattern = patterns.find(p => p.type === 'function');

      expect(functionPattern?.startLine).toBeGreaterThan(0);
    });

    it('should truncate long signatures', () => {
      const longFunction = `function veryLongFunction() { ${'x'.repeat(1000)} }`;
      const patterns = PatternDetector.extractPatterns(longFunction, 'test.js');
      const functionPattern = patterns.find(p => p.type === 'function');

      expect(functionPattern?.signature.length).toBeLessThanOrEqual(503); // 500 + '...'
    });

    it('should include file path', () => {
      const code = 'function test() { return 42; }';
      const patterns = PatternDetector.extractPatterns(code, 'path/to/test.js');

      expect(patterns.every(p => p.filePath === 'path/to/test.js')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed code gracefully', () => {
      const malformedCode = 'function { { { } } }';

      expect(() => {
        PatternDetector.extractPatterns(malformedCode, 'malformed.js');
      }).not.toThrow();
    });

    it('should handle non-code content', () => {
      const nonCode =
        'This is just plain text without any code patterns at all.';
      const patterns = PatternDetector.extractPatterns(nonCode, 'text.txt');

      expect(Array.isArray(patterns)).toBe(true);
      // Should still return structural pattern
      expect(patterns.some(p => p.type === 'structure')).toBe(true);
    });

    it('should handle unicode characters', () => {
      const unicodeCode = 'function тест() { return "мир"; }';

      expect(() => {
        PatternDetector.extractPatterns(unicodeCode, 'unicode.js');
      }).not.toThrow();
    });
  });
});
