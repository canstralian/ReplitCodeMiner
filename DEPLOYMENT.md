
# Deployment Guide

## 🚀 Deployment Options

This application is designed to be deployed on Replit, but can also be deployed to other platforms. This guide covers deployment to Replit and general deployment considerations.

## 📦 Replit Deployment (Recommended)

### Prerequisites
- Replit account
- GitHub repository (for importing code)
- Environment variables configured

### Step 1: Import Project
1. Go to [Replit](https://replit.com)
2. Click "Create Repl"
3. Select "Import from GitHub"
4. Enter your repository URL
5. Choose a name for your Repl

### Step 2: Configure Environment Variables
In your Repl, go to the "Secrets" tab and add:

```bash
# Required
REPLIT_CLIENT_ID=your_replit_client_id
REPLIT_CLIENT_SECRET=your_replit_client_secret
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# Optional
OPENAI_API_KEY=your_actual_openai_api_key
NODE_ENV=production
PORT=5000

# Database (auto-configured by Replit)
DATABASE_URL=postgresql://user:pass@host:port/db
```

### Step 3: Configure Run Command
The project includes a `.replit` file with the correct configuration:

```toml
run = "npm run dev"
hidden = [".config", "tsconfig.json", "tsconfig.node.json"]

[packager]
language = "nodejs"

[packager.features]
packageSearch = true
guessImports = true
enabledForHosting = false

[languages.javascript]
pattern = "**/{*.js,*.jsx,*.ts,*.tsx,*.json}"

[languages.javascript.languageServer]
start = "typescript-language-server --stdio"

[deployment]
run = ["sh", "-c", "npm run build && npm start"]
deploymentTarget = "cloudrun"
ignorePorts = false
```

### Step 4: Install Dependencies
Dependencies will be automatically installed when you first run the project.

### Step 5: Test Locally
1. Click the "Run" button
2. Wait for the server to start
3. Test the application in the preview pane
4. Verify all features work correctly

### Step 6: Deploy to Production
1. Click the "Deploy" button in the top navigation
2. Select "Autoscale" deployment (recommended for web apps)
3. Configure deployment settings:
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`
   - **Environment Variables**: Copy from Secrets tab
4. Choose your deployment tier based on expected traffic
5. Click "Deploy your project"

### Step 7: Configure Custom Domain (Optional)
1. In the deployment dashboard, click "Custom Domain"
2. Add your domain name
3. Update DNS records as instructed
4. Enable SSL certificate

## 🔧 Environment Configuration

### Development Environment
```bash
NODE_ENV=development
PORT=5000
DEBUG=true
LOG_LEVEL=debug
```

### Production Environment
```bash
NODE_ENV=production
PORT=5000
DEBUG=false
LOG_LEVEL=info
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

### Security Environment Variables
```bash
# Strong, random strings
JWT_SECRET=your-256-bit-secret-key
SESSION_SECRET=your-session-secret-key

# API Keys
REPLIT_CLIENT_ID=your_replit_oauth_client_id
REPLIT_CLIENT_SECRET=your_replit_oauth_client_secret
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# CORS
CORS_ORIGIN=https://your-frontend-domain.com
```

## 📊 Monitoring and Health Checks

### Health Check Endpoint
The application includes a health check endpoint at `/health`:

```bash
curl https://your-app.replit.app/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "database": "connected",
  "services": {
    "replitApi": "operational",
    "openai": "operational"
  }
}
```

### Monitoring Setup
Replit provides built-in monitoring:
- CPU usage
- Memory usage
- Request logs
- Error tracking
- Performance metrics

## 🔒 Security Considerations

### Production Security Checklist
- [ ] All secrets stored in environment variables
- [ ] HTTPS enabled (automatic on Replit)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection protection
- [ ] XSS protection headers
- [ ] Authentication properly secured

### Security Headers
The application automatically sets security headers:
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
```

## 📈 Performance Optimization

### Build Optimization
```bash
# Build with optimizations
npm run build

# Bundle analysis
npm run bundle:analyze
```

### Runtime Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies
- Optimize database queries
- Use connection pooling

### Replit-Specific Optimizations
- Use Replit's built-in database for better performance
- Enable "Always On" for production apps
- Use appropriate deployment tier for your traffic
- Implement proper error handling

## 🚨 Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Check build logs
npm run build

# Common fixes
npm install
npm run lint:fix
npm run format
```

#### Runtime Errors
```bash
# Check logs in Replit console
# Verify environment variables
# Check database connection
```

#### Database Issues
```bash
# Verify DATABASE_URL
# Check database permissions
# Run migrations if needed
npm run db:migrate
```

#### Authentication Issues
```bash
# Verify OAuth credentials
# Check callback URLs
# Ensure secrets are set
```

### Performance Issues
- Monitor CPU and memory usage
- Check for memory leaks
- Optimize database queries
- Review rate limiting settings

### Debug Mode
Enable debug mode for troubleshooting:
```bash
DEBUG=true
LOG_LEVEL=debug
```

## 📊 Scaling Considerations

### Autoscale Deployment (Recommended)
- Automatically scales based on traffic
- Pay-per-use pricing model
- Handles traffic spikes
- 99.95% uptime SLA

### Reserved VM Deployment
- Fixed capacity and pricing
- Better for predictable workloads
- 99.9% uptime SLA
- Full control over resources

### Performance Monitoring
- Set up alerts for high CPU/memory usage
- Monitor response times
- Track error rates
- Review user feedback

## 🔄 CI/CD Integration

### GitHub Actions Deployment
The project includes automated deployment workflows:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Replit
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Replit
        # Deployment steps here
```

### Automatic Deployments
- Push to main branch triggers deployment
- Quality checks must pass before deployment
- Rollback capability available
- Blue-green deployment support

## 📚 Additional Resources

### Replit Documentation
- [Replit Deployments](https://docs.replit.com/hosting/deployments)
- [Environment Variables](https://docs.replit.com/programming-ide/workspace-features/storing-sensitive-information-environment-variables)
- [Custom Domains](https://docs.replit.com/hosting/deployments/custom-domains)

### Monitoring Tools
- Replit built-in analytics
- Application performance monitoring
- Error tracking and logging
- User analytics

### Support
- Replit Community Forums
- GitHub Issues
- Direct support for paid plans

---

## 🆘 Support

If you encounter issues during deployment:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review Replit deployment logs
3. Contact support through appropriate channels
4. Create an issue in the GitHub repository

**Last Updated**: January 2025
