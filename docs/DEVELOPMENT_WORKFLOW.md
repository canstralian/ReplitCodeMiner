
# Development Workflow Guide

## 🌊 Branching Strategy

We use a **GitFlow-inspired** workflow optimized for continuous integration:

### Branch Types

| Branch Type | Purpose | Naming Convention | Lifetime |
|-------------|---------|-------------------|----------|
| `main` | Production-ready code | `main` | Permanent |
| `develop` | Integration branch | `develop` | Permanent |
| `feature` | New features | `feature/description` | Temporary |
| `bugfix` | Bug fixes | `bugfix/issue-number` | Temporary |
| `hotfix` | Critical production fixes | `hotfix/description` | Temporary |
| `release` | Release preparation | `release/v1.2.0` | Temporary |

### Workflow Steps

#### 1. Feature Development
```bash
# Create and switch to feature branch
git checkout develop
git pull origin develop
git checkout -b feature/duplicate-detection-improvements

# Work on your feature
git add .
git commit -m "feat: improve duplicate detection algorithm"

# Push to remote
git push origin feature/duplicate-detection-improvements

# Create pull request to develop branch
```

#### 2. Bug Fixes
```bash
# Create bugfix branch
git checkout develop
git pull origin develop
git checkout -b bugfix/fix-analysis-timeout

# Fix the bug
git add .
git commit -m "fix: resolve analysis timeout issue #123"

# Push and create PR
git push origin bugfix/fix-analysis-timeout
```

#### 3. Hotfixes
```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# Apply fix
git add .
git commit -m "fix: patch critical security vulnerability"

# Push and create PR to main
git push origin hotfix/critical-security-fix

# After merge, also merge to develop
git checkout develop
git merge main
```

## 📝 Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples
```bash
feat(auth): add OAuth2 integration with Replit
fix(analysis): resolve memory leak in pattern detection
docs: update API documentation for v2.0
test(storage): add unit tests for database operations
```

## 🔄 Pull Request Process

### 1. Pre-PR Checklist
- [ ] Branch is up-to-date with target branch
- [ ] All tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated if needed
- [ ] Self-review completed

### 2. Creating a PR
- Use descriptive title following commit convention
- Fill out the PR template completely
- Add appropriate labels
- Request reviews from relevant team members
- Link related issues

### 3. Review Process
- **Required Reviews**: At least 1 approval for feature branches
- **Auto-merge**: Enabled for approved PRs
- **CI Checks**: All automated checks must pass
- **Conflicts**: Must be resolved before merge

### 4. Merge Strategy
- **Squash and merge** for feature branches
- **Create merge commit** for release branches
- **Rebase and merge** for hotfixes

## 🚀 Release Process

### 1. Prepare Release
```bash
# Create release branch
git checkout develop
git pull origin develop
git checkout -b release/v1.3.0

# Update version numbers and changelog
npm version minor
git add .
git commit -m "chore: bump version to 1.3.0"

# Push release branch
git push origin release/v1.3.0
```

### 2. Finalize Release
```bash
# Merge to main
git checkout main
git merge release/v1.3.0
git tag v1.3.0
git push origin main --tags

# Merge back to develop
git checkout develop
git merge main
git push origin develop

# Delete release branch
git branch -d release/v1.3.0
git push origin --delete release/v1.3.0
```

## 🛠️ Local Development Setup

### Git Configuration
```bash
# Set up user information
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Enable helpful settings
git config pull.rebase true
git config push.default current
git config core.autocrlf input
git config init.defaultBranch main

# Set up aliases
git config alias.co checkout
git config alias.br branch
git config alias.ci commit
git config alias.st status
git config alias.unstage 'reset HEAD --'
git config alias.last 'log -1 HEAD'
git config alias.visual '!gitk'
```

### Recommended Git Hooks
Our project includes pre-commit hooks via Husky that automatically:
- Run ESLint and fix issues
- Format code with Prettier
- Run TypeScript type checking
- Validate commit messages

## 🔍 Code Review Guidelines

### For Authors
- Keep PRs focused and small (< 400 lines when possible)
- Write clear descriptions and context
- Add comments for complex logic
- Ensure all tests pass
- Respond promptly to feedback

### For Reviewers
- Be constructive and respectful
- Focus on code quality, not personal preferences
- Check for security vulnerabilities
- Verify test coverage
- Approve quickly for minor changes

## 📊 Metrics and Monitoring

### Key Metrics
- **PR Cycle Time**: Time from creation to merge
- **Review Response Time**: Time to first review
- **Build Success Rate**: Percentage of successful CI builds
- **Hotfix Frequency**: Number of hotfixes per release

### Tools
- GitHub Insights for PR analytics
- CodeClimate for code quality metrics
- Dependabot for dependency management
- GitHub Security for vulnerability scanning

## 🚨 Emergency Procedures

### Reverting Changes
```bash
# Revert a commit
git revert <commit-hash>

# Revert a merge
git revert -m 1 <merge-commit-hash>

# Force push to main (emergency only)
git push --force-with-lease origin main
```

### Rolling Back Deployments
1. Identify the last known good commit
2. Create hotfix branch from that commit
3. Follow hotfix workflow to deploy
4. Investigate and fix the root cause

## 📚 Additional Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
