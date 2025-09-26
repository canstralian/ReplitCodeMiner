
# Repository Settings Configuration

This document outlines the recommended repository settings for maintaining code quality and security.

## Branch Protection Rules

### Main Branch (`main`)
```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Lint and Format Check",
      "Test Suite",
      "Security Audit",
      "Build Check"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "require_last_push_approval": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true
}
```

### Develop Branch (`develop`)
```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Lint and Format Check",
      "Test Suite"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true
}
```

## Repository Settings

### General Settings
- **Default branch**: `main`
- **Features**:
  - ✅ Wiki: Enabled
  - ✅ Issues: Enabled
  - ✅ Sponsorships: Disabled
  - ✅ Preserve this repository: Enabled
  - ✅ Discussions: Enabled

### Pull Request Settings
- ✅ Allow merge commits
- ✅ Allow squash merging (default)
- ❌ Allow rebase merging
- ✅ Always suggest updating pull request branches
- ✅ Allow auto-merge
- ✅ Automatically delete head branches

### Security Settings
- ✅ Dependency graph: Enabled
- ✅ Dependabot alerts: Enabled
- ✅ Dependabot security updates: Enabled
- ✅ Dependabot version updates: Enabled
- ✅ Code scanning: Enabled
- ✅ Secret scanning: Enabled

## Team Permissions

### Maintainers Team
- **Permission**: Admin
- **Members**: Core maintainers
- **Responsibilities**:
  - Repository settings management
  - Release management
  - Security oversight

### Contributors Team
- **Permission**: Write
- **Members**: Regular contributors
- **Responsibilities**:
  - Feature development
  - Bug fixes
  - Code reviews

### Reviewers Team
- **Permission**: Triage
- **Members**: Experienced developers
- **Responsibilities**:
  - Code reviews
  - Issue triage
  - PR feedback

## Webhooks Configuration

### Required Webhooks
1. **CI/CD Pipeline**
   - URL: Managed by GitHub Actions
   - Events: `push`, `pull_request`

2. **Dependabot**
   - URL: Managed by Dependabot
   - Events: `pull_request`, `push`

3. **Security Scanning**
   - URL: Managed by GitHub Security
   - Events: `push`, `pull_request`

## Environment Variables and Secrets

### Repository Secrets
- `REPLIT_TOKEN`: Replit API token for deployment
- `SNYK_TOKEN`: Snyk security scanning token
- `CODECOV_TOKEN`: Code coverage reporting token

### Environment Secrets (per environment)
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPLIT_CLIENT_ID`: OAuth client ID
- `REPLIT_CLIENT_SECRET`: OAuth client secret

## Deployment Environments

### Production
- **Protection rules**: Require review from maintainers
- **Deployment branches**: `main` only
- **Environment secrets**: Production credentials

### Staging
- **Protection rules**: No restrictions
- **Deployment branches**: `develop`, `main`
- **Environment secrets**: Staging credentials

## Setup Instructions

### 1. Configure Branch Protection
```bash
# Install GitHub CLI
# https://cli.github.com/

# Apply branch protection to main
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Lint and Format Check","Test Suite","Security Audit","Build Check"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_last_push_approval":true}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false \
  --field required_conversation_resolution=true
```

### 2. Set Up Teams
1. Go to repository Settings → Manage access
2. Create teams with appropriate permissions
3. Add team members based on their roles

### 3. Configure Security Settings
1. Navigate to Settings → Security & analysis
2. Enable all recommended security features
3. Configure Dependabot alerts and updates

### 4. Set Up Environments
1. Go to Settings → Environments
2. Create `production` and `staging` environments
3. Configure protection rules and secrets

## Monitoring and Maintenance

### Weekly Tasks
- Review Dependabot PRs
- Check security alerts
- Review CI/CD performance
- Update team permissions as needed

### Monthly Tasks
- Audit repository settings
- Review branch protection effectiveness
- Update security configurations
- Clean up stale branches

### Quarterly Tasks
- Full security audit
- Team permission review
- Workflow optimization
- Documentation updates
