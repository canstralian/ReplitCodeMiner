# Pattern Detection Algorithm Documentation

## Overview

The pattern detection system is the core of ReplitCodeMiner's duplicate code detection. This document explains the algorithms, design decisions, and security considerations.

## Architecture

### Pattern Types

1. **Function Patterns**
   - Regex: `/(?:function|const|let|var)\s+(\w+)\s*[=:]?\s*(?:\([^)]*\)|=>)/g`
   - Detects: Traditional functions, arrow functions, function expressions
   - Example matches: `function foo()`, `const bar = () =>`, `let baz = function()`

2. **Component Patterns** (React/Vue)
   - Regex: `/(?:export\s+)?(?:default\s+)?(?:function|const)\s+(\w+)\s*.*?(?:return\s*\(|=>)/g`
   - Detects: React components, functional components
   - Example matches: `export default function MyComponent`, `const Button = () =>`

3. **Import Patterns**
   - Regex: `/import\s+.*?from\s+['"]([^'"]+)['"]/g`
   - Detects: ES6 imports
   - Example matches: `import React from 'react'`, `import { useState } from 'react'`

4. **Hook Patterns** (React)
   - Regex: `/const\s+\[([^\]]+)\]\s*=\s*use(\w+)/g`
   - Detects: React hooks usage
   - Example matches: `const [state, setState] = useState()`, `const data = useQuery()`

5. **Class Patterns**
   - Regex: `/class\s+(\w+)(?:\s+extends\s+\w+)?\s*\{/g`
   - Detects: Class declarations
   - Example matches: `class Foo {`, `class Bar extends Baz {`

6. **Method Patterns**
   - Regex: `/(?:public|private|protected)?\s*(\w+)\s*\([^)]*\)\s*(?::\s*\w+)?\s*\{/g`
   - Detects: Class methods, TypeScript methods with access modifiers
   - Example matches: `public foo()`, `private bar(): string {`

## Security Considerations

### 1. ReDoS Prevention

**Risk**: Regular Expression Denial of Service through catastrophic backtracking

**Mitigations**:

- All regexes pre-compiled and cached (REGEX_CACHE)
- Match limit: 1,000 patterns per file
- Zero-width match detection and prevention
- Non-greedy quantifiers used where possible
- File size limit: 500KB

**Example safe pattern**:

```typescript
// SAFE: Non-greedy, bounded
/import\s+.*?from\s+['"]([^'"]+)['"]/g

// UNSAFE: Greedy, unbounded (NOT USED)
/import\s+.*from\s+['"].*['"]/g
```

### 2. Memory Management

**Constraints**:

- `MAX_PATTERN_LENGTH`: 10,000 characters per pattern
- `MAX_FILE_SIZE`: 500KB per file
- Signature truncation: 500 characters
- LRU cache: 1,000 patterns maximum

**Implementation**:

```typescript
if (contentLength > 500000) {
  console.warn(`Skipping large file: ${filePath}`);
  return [];
}
```

### 3. Hash Collision Resistance

**Algorithm**: SHA-256
**Normalization**: Whitespace and comment removal
**Purpose**: Detect semantic duplicates, not just exact copies

**Process**:

1. Remove single-line comments (`//`)
2. Remove multi-line comments (`/* */`)
3. Normalize whitespace to single spaces
4. Trim leading/trailing whitespace
5. Truncate to MAX_PATTERN_LENGTH if needed
6. Generate SHA-256 hash

### 4. Input Validation

All pattern extraction functions validate:

- Content is non-empty
- Content length within limits
- File path is provided
- Regex match results are non-null

## Similarity Detection

### Structural Similarity

Compares code structure using:

- Line count comparison
- Pattern type distribution
- Complexity metrics
- Hash-based deduplication

**Formula**:

```
similarity = (common_patterns / total_patterns) * structure_weight
```

### Semantic Similarity

Uses diff-based comparison:

- Line-by-line diff (using `diff` library)
- Change percentage calculation
- Adjusts for whitespace differences

**Formula**:

```
similarity = 1 - (changes / total_lines)
```

### Syntactic Similarity

Pattern-based matching:

- Extract common function signatures
- Extract common imports
- Extract common variable patterns
- Weight by pattern frequency

## Complexity Calculation

**Cyclomatic Complexity Approximation**:

```typescript
complexity =
  if_statements * 1 +
  loops * 2 +
  switch_cases * 1 +
  try_catch * 1 +
  logical_operators * 0.5;
```

**Base complexity**: 1 (entry point)
**Maximum tracked**: No hard limit, but used for sorting

## Performance Optimization

### 1. Caching Strategy

**Pattern Cache** (LRU):

- Max entries: 1,000
- TTL: 1 hour
- Key: File path + content hash

**Analysis Cache** (LRU):

- Max entries: 100
- TTL: 30 minutes
- Key: User ID + project hashes

### 2. Regex Optimization

All regexes are:

- Pre-compiled at class initialization
- Stored in `REGEX_CACHE` constant
- Reused across all pattern extraction calls
- Reset `lastIndex` before use to prevent state leaks

### 3. Early Termination

Pattern extraction stops when:

- File size exceeds 500KB
- Match count exceeds 1,000
- Processing time exceeds reasonable bounds (future enhancement)

## Boundary Cases

### 1. Minified Code

**Issue**: Minified code produces very long lines
**Solution**: Line count approximation, character-based hashing

### 2. Generated Code

**Issue**: Code generators create similar patterns
**Solution**: File path patterns can exclude generated files

### 3. Empty Files

**Issue**: Empty or whitespace-only files
**Solution**: Early return with empty pattern array

### 4. Binary Files

**Issue**: Binary content passed as text
**Solution**: File size limit catches most cases, regex fails gracefully

## Testing Recommendations

### Unit Tests

1. **Regex Pattern Tests**

   ```typescript
   it('should match function declarations', () => {
     const result = PatternDetector.extractPatterns(
       'function foo() {}',
       'test.js'
     );
     expect(result).toHaveLength(1);
     expect(result[0].type).toBe('function');
   });
   ```

2. **Boundary Tests**

   ```typescript
   it('should reject files over size limit', () => {
     const largeContent = 'x'.repeat(600000);
     const result = PatternDetector.extractPatterns(largeContent, 'large.js');
     expect(result).toEqual([]);
   });
   ```

3. **ReDoS Prevention Tests**
   ```typescript
   it('should complete within timeout', () => {
     const maliciousInput = 'import '.repeat(10000);
     const start = Date.now();
     PatternDetector.extractPatterns(maliciousInput, 'test.js');
     const duration = Date.now() - start;
     expect(duration).toBeLessThan(1000);
   });
   ```

### Integration Tests

1. **Full Project Analysis**
2. **Cross-Project Pattern Detection**
3. **Cache Effectiveness**
4. **Memory Usage Under Load**

## Future Enhancements

### 1. AST-Based Detection

- More accurate pattern extraction
- Language-specific analysis
- Better semantic understanding

### 2. Machine Learning

- Learn common duplication patterns
- Reduce false positives
- Adaptive thresholds

### 3. Streaming Processing

- Handle very large files
- Progressive result updates
- WebSocket progress reporting

### 4. Language-Specific Analyzers

- Python: ast module integration
- Java: JavaParser integration
- Go: AST parsing
- Rust: syn crate integration

## References

- [Regular Expression Best Practices](https://www.regular-expressions.info/catastrophic.html)
- [Code Clone Detection Survey](https://doi.org/10.1007/s10664-006-9005-2)
- [Cyclomatic Complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity)
- [SHA-256 Specification](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf)

## Version History

- v1.0.0 (2025-01-05): Initial algorithm documentation
