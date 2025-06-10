
#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class CodeQualityChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.metrics = {
      totalFiles: 0,
      lintErrors: 0,
      lintWarnings: 0,
      formatIssues: 0,
      typeErrors: 0,
      testCoverage: 0
    };
  }

  async run() {
    console.log('🔍 Starting comprehensive code quality analysis...\n');
    
    try {
      await this.checkLinting();
      await this.checkFormatting();
      await this.checkTypes();
      await this.analyzeComplexity();
      await this.checkSecurity();
      await this.checkDependencies();
      await this.checkComplexity();
      
      this.generateReport();
    } catch (error) {
      console.error('❌ Code quality check failed:', error.message);
      process.exit(1);
    }
  }

  async checkLinting() {
    console.log('📋 Running ESLint...');
    try {
      execSync('npx eslint . --ext .js,.jsx,.ts,.tsx --format json --output-file eslint-report.json', { stdio: 'pipe' });
      console.log('✅ No linting errors found');
    } catch (error) {
      const report = JSON.parse(fs.readFileSync('eslint-report.json', 'utf8'));
      report.forEach(file => {
        this.metrics.lintErrors += file.errorCount;
        this.metrics.lintWarnings += file.warningCount;
        file.messages.forEach(msg => {
          if (msg.severity === 2) {
            this.errors.push(`${file.filePath}:${msg.line}:${msg.column} - ${msg.message}`);
          } else {
            this.warnings.push(`${file.filePath}:${msg.line}:${msg.column} - ${msg.message}`);
          }
        });
      });
      console.log(`⚠️  Found ${this.metrics.lintErrors} errors and ${this.metrics.lintWarnings} warnings`);
    }
  }

  async checkFormatting() {
    console.log('💅 Checking code formatting...');
    try {
      execSync('npx prettier --check .', { stdio: 'pipe' });
      console.log('✅ All files are properly formatted');
    } catch (error) {
      this.metrics.formatIssues++;
      this.warnings.push('Code formatting issues found. Run "npm run format" to fix.');
      console.log('⚠️  Code formatting issues found');
    }
  }

  async checkTypes() {
    console.log('🔍 Type checking...');
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      console.log('✅ No type errors found');
    } catch (error) {
      this.metrics.typeErrors++;
      this.errors.push('TypeScript compilation errors found');
      console.log('❌ TypeScript errors found');
    }
  }

  async analyzeComplexity() {
    console.log('📊 Analyzing code complexity...');
    // Simple complexity analysis
    const files = this.getSourceFiles();
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const complexity = this.calculateComplexity(content);
      if (complexity > 10) {
        this.warnings.push(`High complexity in ${file}: ${complexity}`);
      }
    });
    console.log('✅ Complexity analysis complete');
  }

  async checkSecurity() {
    console.log('🔒 Running security audit...');
    try {
      execSync('npm audit --audit-level=moderate --json > security-report.json', { stdio: 'pipe' });
      const report = JSON.parse(fs.readFileSync('security-report.json', 'utf8'));
      if (report.metadata.vulnerabilities.total > 0) {
        this.warnings.push(`${report.metadata.vulnerabilities.total} security vulnerabilities found`);
        console.log(`⚠️  ${report.metadata.vulnerabilities.total} vulnerabilities found`);
      } else {
        console.log('✅ No security vulnerabilities found');
      }
    } catch (error) {
      console.log('⚠️  Security audit completed with warnings');
    }
  }

  async checkDependencies() {
    console.log('📦 Checking dependencies...');
    try {
      execSync('npx depcheck --json > dependency-report.json', { stdio: 'pipe' });
      const report = JSON.parse(fs.readFileSync('dependency-report.json', 'utf8'));
      const unusedCount = Object.keys(report.dependencies || {}).length;
      if (unusedCount > 0) {
        this.warnings.push(`${unusedCount} unused dependencies found`);
        console.log(`⚠️  ${unusedCount} unused dependencies`);
      } else {
        console.log('✅ No unused dependencies');
      }
    } catch (error) {
      console.log('⚠️  Dependency check completed with warnings');
    }
  }

  async checkComplexity() {
    console.log('🔄 Analyzing complexity...');
    try {
      execSync('npx madge --circular --json --extensions ts,tsx,js,jsx ./client/src ./server > complexity-report.json', { stdio: 'pipe' });
      const report = JSON.parse(fs.readFileSync('complexity-report.json', 'utf8'));
      if (report.length > 0) {
        this.warnings.push(`${report.length} circular dependencies found`);
        console.log(`⚠️  ${report.length} circular dependencies detected`);
      } else {
        console.log('✅ No circular dependencies');
      }
    } catch (error) {
      console.log('⚠️  Complexity analysis completed with warnings');
    }
  }

  getSourceFiles() {
    const files = [];
    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory() && !['node_modules', 'dist', 'build'].includes(item)) {
          walkDir(fullPath);
        } else if (item.match(/\.(ts|tsx|js|jsx)$/)) {
          files.push(fullPath);
        }
      });
    };
    walkDir('.');
    return files;
  }

  calculateComplexity(code) {
    // Basic cyclomatic complexity calculation
    const patterns = [
      /\bif\b/g, /\belse\b/g, /\bwhile\b/g, /\bfor\b/g,
      /\bswitch\b/g, /\bcase\b/g, /\bcatch\b/g, /\?\s*.*:/g,
      /&&/g, /\|\|/g
    ];
    
    let complexity = 1;
    patterns.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) complexity += matches.length;
    });
    
    return complexity;
  }

  generateReport() {
    console.log('\n📊 Code Quality Report');
    console.log('=======================');
    console.log(`Total Files Analyzed: ${this.getSourceFiles().length}`);
    console.log(`Lint Errors: ${this.metrics.lintErrors}`);
    console.log(`Lint Warnings: ${this.metrics.lintWarnings}`);
    console.log(`Format Issues: ${this.metrics.formatIssues}`);
    console.log(`Type Errors: ${this.metrics.typeErrors}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => console.log(`  ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  ${warning}`));
    }
    
    const score = this.calculateQualityScore();
    console.log(`\n🎯 Quality Score: ${score}/100`);
    
    if (this.errors.length > 0) {
      process.exit(1);
    }
  }

  calculateQualityScore() {
    let score = 100;
    score -= this.metrics.lintErrors * 5;
    score -= this.metrics.lintWarnings * 2;
    score -= this.metrics.formatIssues * 3;
    score -= this.metrics.typeErrors * 10;
    return Math.max(0, score);
  }
}

const checker = new CodeQualityChecker();
checker.run();
