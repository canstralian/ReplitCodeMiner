# ReplitCodeMiner

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Node](https://img.shields.io/badge/node-20+-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)

A powerful tool for detecting duplicate code patterns across your Replit projects with advanced analysis capabilities and intuitive visualizations.

## 🌟 Features

- **🔍 Smart Code Analysis**: Advanced duplicate detection using AST parsing and pattern matching
- **🚀 Multi-Project Scanning**: Analyze all your Replit projects simultaneously
- **📊 Visual Comparisons**: Side-by-side code comparison with syntax highlighting
- **🔗 Cross-Project Patterns**: Detect shared patterns across different repositories
- **📈 Analytics Dashboard**: Comprehensive insights into code duplication metrics
- **🔐 Secure Authentication**: Replit OAuth2 integration with secure session management
- **🌐 Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, Node.js 20+
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OAuth2
- **Testing**: Vitest, React Testing Library
- **Deployment**: Replit Deployments

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher
- Replit account
- Git

### Development Setup

1. **Fork this Repl** or **Clone the repository**
   ```bash
   # If cloning from GitHub (replace with actual repo URL)
   git clone https://github.com/your-username/replit-duplicate-detector.git
   cd replit-duplicate-detector
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

### Production Deployment

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm run start
   ```

3. **Deploy to Replit**
   - Connect your GitHub repository to Replit
   - Configure environment variables in Replit Secrets
   - Use the provided Replit configuration

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend
│   ├── routes.ts           # API routes
│   ├── db.ts              # Database configuration
│   ├── auth.ts            # Authentication logic
│   └── services/          # Business logic
├── shared/                 # Shared types and schemas
├── tests/                  # Test files
└── docs/                   # Documentation
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REPLIT_CLIENT_ID` | Replit OAuth2 client ID | Yes |
| `REPLIT_CLIENT_SECRET` | Replit OAuth2 client secret | Yes |
| `SESSION_SECRET` | Session encryption secret | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 5000) | No |

See `.env.example` for complete configuration options.

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage
We maintain >80% code coverage across all modules. Coverage reports are generated in `coverage/` directory.

## 📊 API Documentation

### Authentication Endpoints
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate OAuth login
- `POST /api/logout` - Logout user

### Project Analysis
- `GET /api/projects` - List user projects
- `POST /api/projects/:id/analyze` - Analyze project for duplicates
- `GET /api/projects/:id/results` - Get analysis results

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

For detailed API documentation, see [API Documentation](docs/API.md).

## 🔒 Security

This application implements multiple security layers:

- **Authentication**: Secure OAuth2 integration with Replit
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive input sanitization using Zod schemas
- **Rate Limiting**: Configurable API rate limiting (100 req/min default)
- **Security Headers**: CSRF, XSS, and clickjacking protection
- **ReDoS Prevention**: Protected regex patterns with match limits
- **File Size Limits**: 500KB max per file, 5MB for uploads
- **HTTPS**: Enforced in production with secure cookies
- **Audit Logging**: Comprehensive logging for security events

For detailed security information, see [Security Documentation](docs/SECURITY.md).

### Pattern Detection Security

- **Algorithm Documentation**: [Pattern Detection](docs/PATTERN_DETECTION.md)
- **Complexity Limits**: Capped at reasonable values to prevent DoS
- **Memory Constraints**: LRU caching with size limits
- **Timeout Protection**: Analysis timeouts to prevent hanging
- **Input Sanitization**: File path validation to prevent traversal attacks

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure tests pass: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to your branch: `git push origin feature/amazing-feature`
7. Submit a pull request

## 🐛 Issues and Support

- **Bug Reports**: [GitHub Issues](https://github.com/your-username/replit-duplicate-detector/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/your-username/replit-duplicate-detector/discussions)
- **Documentation**: [Wiki](https://github.com/your-username/replit-duplicate-detector/wiki)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the Replit community
- Thanks to all contributors and testers
- Special thanks to the open-source community

## 📈 Roadmap

- [ ] Advanced pattern recognition algorithms
- [ ] Integration with more version control systems
- [ ] Machine learning-based duplicate detection
- [ ] Team collaboration features
- [ ] API rate limiting improvements
- [ ] Performance optimizations

---

**Made with ❤️ by the Replit Community**