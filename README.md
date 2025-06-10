# Replit Code Analysis Platform

A powerful platform for analyzing code quality, detecting duplicates, and providing refactoring suggestions across Replit projects using AI-powered insights.

## 🚀 Features

- **Code Pattern Analysis**: Automatically detect and analyze code patterns across multiple projects
- **Duplicate Detection**: Find duplicate code blocks with semantic analysis
- **AI-Powered Refactoring**: Get intelligent suggestions for code improvements
- **Quality Metrics**: Comprehensive code quality scoring and complexity analysis
- **Security Scanning**: Detect potential security vulnerabilities
- **Real-time Analytics**: Interactive dashboards with quality trends
- **GitHub Integration**: Automated CI/CD pipeline with quality gates

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional, for enhanced AI analysis)
- Replit account for API access

## 🛠 Installation

### On Replit
1. Fork this Repl or import from GitHub
2. The environment will auto-configure dependencies
3. Set up environment variables in the Secrets tab
4. Click the Run button to start the development server

### Local Development
```bash
# Clone the repository
git clone <your-repo-url>
cd replit-code-analysis

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables
Set these in Replit's Secrets tab or your `.env` file:

```bash
# Required
REPLIT_CLIENT_ID=your_replit_client_id
REPLIT_CLIENT_SECRET=your_replit_client_secret

# Optional (for enhanced AI features)
OPENAI_API_KEY=your_openai_api_key

# Database (auto-configured on Replit)
DATABASE_URL=your_database_url

# Security
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

## 🏃‍♂️ Running the Application

### Development
```bash
npm run dev          # Start development server
npm run dev:client   # Start client only
npm run dev:server   # Start server only
```

### Production
```bash
npm run build        # Build for production
npm start           # Start production server
```

### Quality Checks
```bash
npm run quality:check    # Run all quality checks
npm run lint            # ESLint analysis
npm run format          # Prettier formatting
npm run check           # TypeScript type checking
npm test               # Run tests
```

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── replitApi.ts       # Replit API integration
│   ├── aiAnalysis.ts      # AI-powered analysis
│   └── db.ts              # Database operations
├── shared/                # Shared types and schemas
├── scripts/               # Build and utility scripts
└── .github/workflows/     # CI/CD pipelines
```

## 🔍 API Documentation

### Authentication Endpoints
- `GET /auth/login` - Initiate Replit OAuth
- `GET /auth/callback` - Handle OAuth callback
- `POST /auth/logout` - Logout user

### Analysis Endpoints
- `GET /api/projects` - Get user's projects
- `POST /api/analyze` - Analyze projects for duplicates
- `GET /api/analytics` - Get analytics dashboard data
- `GET /api/patterns/:id` - Get specific pattern details

### Quality Endpoints
- `POST /api/quality/analyze` - Run quality analysis
- `GET /api/quality/metrics` - Get quality metrics
- `POST /api/refactor/suggestions` - Get refactoring suggestions

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:e2e      # End-to-end tests
npm run test:coverage # Test coverage report
```

## 📊 Quality Assurance

This project maintains high code quality standards:

- **ESLint**: Enforces coding standards and catches errors
- **Prettier**: Maintains consistent code formatting
- **TypeScript**: Provides type safety
- **Husky**: Pre-commit hooks for quality checks
- **GitHub Actions**: Automated CI/CD pipeline

### Quality Metrics
- Zero ESLint errors required
- 90%+ test coverage target
- Complexity score < 10 per function
- Security vulnerabilities: None allowed

## 🚀 Deployment

### Replit Deployment
1. Click the "Deploy" button in your Repl
2. Choose your deployment tier
3. Configure environment variables
4. Deploy!

Your app will be available at `https://<your-app-name>.replit.app`

### Custom Domain
Configure custom domains in the Replit deployment settings.

## 🔒 Security

- OAuth 2.0 authentication with Replit
- JWT-based session management
- Rate limiting on API endpoints
- Input validation and sanitization
- Security headers with Helmet.js
- Automated security audits in CI/CD

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run quality checks (`npm run quality:check`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all CI checks pass

## 📈 Monitoring

- Application metrics via built-in analytics
- Error tracking and logging
- Performance monitoring
- Security audit reports

## 🆘 Troubleshooting

### Common Issues

**Application won't start**
- Check environment variables are set
- Verify Node.js version (18+)
- Run `npm install` to ensure dependencies

**Authentication issues**
- Verify Replit OAuth credentials
- Check callback URL configuration
- Ensure secrets are properly set

**Database connection errors**
- Verify DATABASE_URL is set
- Check database service status
- Review connection logs

## 🤖 AI Provider Support

This platform supports multiple AI providers for enhanced code analysis:

- **OpenAI GPT-4**: Advanced code analysis and refactoring suggestions
- **Claude (Anthropic)**: Detailed code quality insights
- **CodePal.ai**: Specialized coding assistant optimizations
- **Cohere**: Command model for code understanding
- **Google AI (Gemini)**: Multi-modal code analysis
- **Groq**: High-speed inference for real-time analysis

Configure multiple providers for redundancy and optimal performance.

## 📚 Additional Resources

- [Authentication Guide](./docs/auth.md)
- [Analysis Examples](./docs/examples.md)
- [SDK Documentation](./docs/sdks.md)
- [AI Provider Setup](./docs/ai-providers.md)
- [Webhook Integration](./docs/webhooks.md)

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

**Version**: 1.0.0  
**Last Updated**: January 2025

For support, please contact `api-