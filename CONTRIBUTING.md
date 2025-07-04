
# Contributing to Replit Duplicate Detector Extension

Thank you for your interest in contributing to the Replit Duplicate Detector Extension! This document provides guidelines and information for contributors.

## 🌟 Ways to Contribute

### Code Contributions
- **Bug fixes**: Help us squash bugs and improve stability
- **Feature development**: Implement new features from our roadmap
- **Performance improvements**: Optimize algorithms and database queries
- **Documentation**: Improve code comments, documentation, and examples

### Non-Code Contributions
- **Issue reporting**: Help us identify bugs and improvement opportunities
- **Testing**: Test new features and provide feedback
- **Documentation**: Write tutorials, guides, and improve existing docs
- **Community support**: Help other users in discussions and forums

## 🚀 Getting Started

### Prerequisites
- Node.js 20 or higher
- Basic understanding of TypeScript, React, and Express.js
- Familiarity with PostgreSQL and database concepts
- Replit account for testing

### Development Setup
1. **Fork the repository** to your GitHub account
2. **Clone your fork** to your local development environment
3. **Install dependencies**: `npm install`
4. **Set up environment variables** (see `.env.example`)
5. **Run database migrations**: `npm run db:push`
6. **Start development server**: `npm run dev`

### Development Workflow
1. **Create a branch** for your feature/fix: `git checkout -b feature/your-feature-name`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Commit your changes** with descriptive messages
5. **Push to your fork** and create a pull request

## 🏗️ Development Guidelines

### Code Style
- **TypeScript**: Use strict TypeScript with proper type definitions
- **Formatting**: Code is automatically formatted with Prettier
- **Linting**: Follow ESLint rules for consistent code quality
- **Naming**: Use descriptive names for variables, functions, and files

### File Organization
```
server/                 # Backend API and services
├── routes.ts          # API endpoint definitions
├── analysisService.ts # Core business logic
├── storage.ts         # Database operations
└── middleware.ts      # Express middleware

client/                # Frontend React application
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Application pages/routes
│   ├── hooks/         # Custom React hooks
│   └── lib/           # Utility functions

shared/                # Shared types and schemas
└── schema.ts          # Database schema and types
```

### Coding Standards

#### TypeScript Best Practices
```typescript
// ✅ Good: Explicit types and interfaces
interface AnalysisResult {
  projectId: string;
  duplicates: DuplicateGroup[];
  processingTime: number;
}

// ✅ Good: Proper error handling
try {
  const result = await analyzeProject(projectId);
  return result;
} catch (error) {
  console.error('Analysis failed:', error);
  throw new Error('Project analysis failed');
}

// ❌ Bad: Any types and missing error handling
const analyzeStuff = async (id: any) => {
  return await someApiCall(id);
};
```

#### React Component Guidelines
```typescript
// ✅ Good: Typed props and proper component structure
interface ProjectCardProps {
  project: Project;
  onAnalyze: (projectId: string) => void;
}

export default function ProjectCard({ project, onAnalyze }: ProjectCardProps) {
  const handleClick = () => onAnalyze(project.id);
  
  return (
    <Card className="project-card">
      <CardContent>
        <h3>{project.title}</h3>
        <Button onClick={handleClick}>Analyze</Button>
      </CardContent>
    </Card>
  );
}
```

#### Database Operations
```typescript
// ✅ Good: Proper transaction handling and error management
async createDuplicateGroup(userId: string, patterns: CodePattern[]): Promise<DuplicateGroup> {
  return await this.db.transaction(async (tx) => {
    const group = await tx.insert(duplicateGroups).values({
      userId,
      patternHash: generateHash(patterns),
      createdAt: new Date()
    }).returning();
    
    await tx.insert(patternGroups).values(
      patterns.map(pattern => ({
        duplicateGroupId: group[0].id,
        codePatternId: pattern.id
      }))
    );
    
    return group[0];
  });
}
```

### Testing Guidelines

#### Unit Tests
- Write tests for all new functions and methods
- Test both success and error cases
- Use descriptive test names that explain the scenario

```typescript
describe('PatternDetector', () => {
  it('should detect identical code blocks with same hash', () => {
    const code1 = 'function hello() { return "world"; }';
    const code2 = 'function hello() { return "world"; }';
    
    const hash1 = PatternDetector.generatePatternHash(code1);
    const hash2 = PatternDetector.generatePatternHash(code2);
    
    expect(hash1).toBe(hash2);
  });
  
  it('should handle empty code gracefully', () => {
    expect(() => PatternDetector.generatePatternHash('')).not.toThrow();
  });
});
```

#### Integration Tests
- Test API endpoints with realistic data
- Verify database operations work correctly
- Test authentication and authorization flows

### Documentation Standards
- **Functions**: Document all public functions with JSDoc
- **Components**: Include prop types and usage examples
- **APIs**: Maintain up-to-date API documentation
- **README**: Update README for any new features or setup changes

```typescript
/**
 * Analyzes a project for duplicate code patterns
 * @param projectId - The unique identifier for the project
 * @param options - Configuration options for analysis
 * @returns Promise resolving to analysis results
 * @throws {Error} When project cannot be accessed or analyzed
 */
async analyzeProject(
  projectId: string, 
  options: AnalysisOptions = {}
): Promise<AnalysisResult> {
  // Implementation
}
```

## 🐛 Bug Reports

### Before Reporting
1. **Search existing issues** to avoid duplicates
2. **Reproduce the bug** consistently
3. **Test on latest version** to ensure it's not already fixed

### Bug Report Template
```markdown
**Bug Description**
A clear description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Environment**
- Browser: [e.g. Chrome, Firefox]
- Node.js version: [e.g. 20.1.0]
- Operating System: [e.g. macOS, Windows, Linux]

**Additional Context**
Console errors, screenshots, or other relevant information.
```

## 💡 Feature Requests

### Feature Request Guidelines
- **Check existing requests** to avoid duplicates
- **Provide clear use cases** and benefits
- **Consider implementation complexity** and maintenance
- **Include mockups or examples** when helpful

### Feature Request Template
```markdown
**Feature Summary**
Brief description of the feature.

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this feature work?

**Alternative Solutions**
Other ways to solve this problem.

**Implementation Notes**
Technical considerations or suggestions.
```

## 🔍 Pull Request Process

### Before Submitting
1. **Fork the repository** and create a feature branch
2. **Make your changes** following our guidelines
3. **Add tests** for new functionality
4. **Update documentation** as needed
5. **Ensure all tests pass**: `npm test`
6. **Check code formatting**: `npm run lint`

### Pull Request Template
```markdown
**Description**
Brief description of changes.

**Type of Change**
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

**Testing**
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

**Checklist**
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)
```

### Review Process
1. **Automated checks** must pass (tests, linting, formatting)
2. **Maintainer review** for code quality and architecture
3. **Testing** on development environment
4. **Merge** after approval and passing checks

## 📋 Development Tasks

### Good First Issues
Perfect for new contributors:
- Documentation improvements
- Adding unit tests
- UI/UX enhancements
- Bug fixes with clear reproduction steps

### Advanced Tasks
For experienced contributors:
- Performance optimizations
- New analysis algorithms
- Database schema improvements
- Complex feature implementations

## 🏆 Recognition

### Contributors
All contributors will be recognized in:
- **Contributors section** of the README
- **Release notes** for significant contributions
- **Special mentions** for outstanding contributions

### Becoming a Maintainer
Regular contributors may be invited to become maintainers based on:
- **Quality of contributions**: Well-tested, documented code
- **Community involvement**: Helping other contributors and users
- **Consistency**: Regular, reliable contributions over time
- **Technical expertise**: Deep understanding of the codebase

## 📞 Getting Help

### Development Questions
- **GitHub Discussions**: For general development questions
- **Issues**: For specific bugs or feature requests
- **Code Review**: Request review on pull requests

### Communication Guidelines
- **Be respectful** and inclusive in all interactions
- **Provide context** when asking questions
- **Use clear, descriptive titles** for issues and PRs
- **Follow up** on conversations and requests

## 📚 Additional Resources

### Learning Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Tools and Setup
- [VS Code Extensions](docs/development-setup.md#vs-code-extensions)
- [Database GUI Tools](docs/development-setup.md#database-tools)
- [Testing Best Practices](docs/testing-guide.md)

---

Thank you for contributing to the Replit Duplicate Detector Extension! Your efforts help make this tool better for the entire community. 🎉
