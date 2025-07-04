
# Replit Duplicate Detector Extension

An intelligent extension for Replit that automatically scans your projects to detect code duplicates, similar patterns, and potential refactoring opportunities. Built with TypeScript, React, and PostgreSQL.

## 🚀 Features

### Core Functionality
- **Project Scanning**: Automatically indexes all your Replit projects via the Replit API
- **Duplicate Detection**: Identifies identical or similar code blocks across projects
- **Pattern Recognition**: Detects recurring patterns in functions, classes, and modules
- **Smart Analysis**: Uses hash-based matching, AST diffing, and fuzzy comparison
- **Real-time UI**: Interactive dashboard with filtering and sorting capabilities

### Advanced Capabilities
- **Multi-language Support**: Python, JavaScript, TypeScript, HTML, CSS, and more
- **Similarity Metrics**: Configurable thresholds for duplicate detection
- **Performance Optimization**: Intelligent caching and batch processing
- **Secure Authentication**: OAuth2 integration with Replit's authentication system
- **Database Persistence**: PostgreSQL storage for analysis results and user data

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 20 with TypeScript
- **Framework**: Express.js with middleware support
- **Database**: PostgreSQL 16 with Drizzle ORM
- **Authentication**: Replit OAuth2 integration
- **Caching**: LRU Cache for performance optimization

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React icon library

### Development & Deployment
- **Platform**: Replit with autoscale deployment
- **Database Migrations**: Drizzle Kit for schema management
- **Type Safety**: Full TypeScript coverage
- **Code Quality**: ESLint and Prettier configuration

## 📦 Installation & Setup

### Prerequisites
- Replit account with developer access
- Node.js 20+ environment
- PostgreSQL 16+ database

### Quick Start
1. **Clone or Fork** this repository to your Replit workspace
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Database Setup**:
   ```bash
   npm run db:push
   ```
4. **Start Development Server**:
   ```bash
   npm run dev
   ```
5. **Access Application**: Open the preview URL provided by Replit

### Environment Variables
The application requires the following environment variables (managed through Replit Secrets):
- `DATABASE_URL`: PostgreSQL connection string
- `REPLIT_CLIENT_ID`: Your Replit OAuth app client ID
- `REPLIT_CLIENT_SECRET`: Your Replit OAuth app client secret
- `SESSION_SECRET`: Secret key for session management

## 🔧 Usage

### Getting Started
1. **Authentication**: Sign in with your Replit account
2. **Project Scanning**: Click "Scan Projects" to analyze your Replit projects
3. **View Results**: Browse detected duplicates and patterns in the dashboard
4. **Analyze Patterns**: Click on any duplicate group to see detailed comparisons
5. **Search & Filter**: Use the search functionality to find specific patterns

### Features Overview

#### Dashboard
- Overview of all scanned projects
- Summary statistics (total projects, duplicates found, languages used)
- Quick access to recent analysis results

#### Duplicate Detection
- Side-by-side code comparison
- Similarity scoring with configurable thresholds
- Pattern type categorization (functions, classes, modules)
- File path and line number references

#### Search & Analytics
- Full-text search across code patterns
- Language-specific filtering
- Pattern type filtering
- Export capabilities for analysis results

## 🏗️ Architecture

### Project Structure
```
replit-extension/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express.js backend
│   ├── analysisService.ts  # Core analysis logic
│   ├── patternDetection.ts # Pattern detection algorithms
│   ├── replitApi.ts        # Replit API integration
│   ├── storage.ts          # Database operations
│   └── routes.ts           # API endpoints
├── shared/                 # Shared TypeScript types
├── drizzle/               # Database migrations and schema
└── docs/                  # Additional documentation
```

### Core Components

#### Analysis Engine
- **Pattern Detection**: Advanced algorithms for identifying code similarities
- **Caching System**: Multi-level caching for optimal performance
- **Batch Processing**: Efficient handling of large project sets
- **Error Handling**: Robust error recovery and logging

#### API Integration
- **Replit GraphQL**: Seamless integration with Replit's project API
- **Authentication Flow**: Secure OAuth2 implementation
- **Rate Limiting**: Respectful API usage with built-in throttling
- **Error Recovery**: Automatic retry logic for failed requests

## 🚦 API Reference

### Authentication Endpoints
- `GET /api/auth/user` - Get current user information
- `POST /api/auth/login` - Initiate OAuth login flow
- `POST /api/auth/logout` - Clear user session

### Project Endpoints
- `GET /api/projects` - List user's projects
- `GET /api/projects/stats` - Get project statistics
- `POST /api/projects/analyze` - Analyze projects for duplicates

### Analysis Endpoints
- `GET /api/duplicates` - Get detected duplicate groups
- `GET /api/duplicates/:groupId` - Get specific duplicate group details
- `POST /api/search` - Search code patterns

## 🔒 Security

### Data Protection
- **API Key Security**: Secure storage and transmission of Replit API credentials
- **Session Management**: Encrypted session tokens with configurable expiration
- **Input Validation**: Comprehensive sanitization of all user inputs
- **SQL Injection Prevention**: Parameterized queries and ORM protection

### Best Practices
- Regular security audits and dependency updates
- Minimal privilege access principles
- Secure deployment configuration
- Comprehensive error logging without sensitive data exposure

## 🚀 Deployment

### Replit Deployment
The application is configured for seamless deployment on Replit:

1. **Automatic Builds**: Production builds are generated automatically
2. **Environment Management**: Secrets are managed through Replit's secure system
3. **Scaling**: Autoscale configuration handles traffic variations
4. **Database**: Integrated PostgreSQL instance with automatic backups

### Production Configuration
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Health Checks**: Automatic monitoring and restart capabilities
- **SSL/HTTPS**: Automatic SSL certificate management

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage
- Unit tests for core algorithms
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Performance benchmarks for analysis operations

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:
- Code style and standards
- Development workflow
- Pull request process
- Issue reporting guidelines

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check our [Wiki](docs/wiki) for detailed guides
- **Issues**: Report bugs or request features through GitHub Issues
- **Community**: Join our discussions in the Replit community forums

### Common Issues
- **Authentication Problems**: Ensure your Replit OAuth credentials are correctly configured
- **Database Errors**: Verify your PostgreSQL connection and run migrations
- **Performance Issues**: Check cache configuration and database indexing

## 🗺️ Roadmap

### Upcoming Features
- **Advanced Refactoring Suggestions**: AI-powered code improvement recommendations
- **Team Collaboration**: Multi-user workspaces and shared analysis
- **Integration APIs**: Webhooks and external tool integrations
- **Mobile Optimization**: Responsive design improvements

### Version History
- **v1.0.0**: Initial release with core duplicate detection
- **v1.1.0**: Enhanced pattern recognition and caching
- **v1.2.0**: Advanced search and filtering capabilities

## 🏆 Acknowledgments

- Replit team for the excellent platform and API
- Open source community for inspiration and tools
- Contributors who have helped improve this project

---

**Built with ❤️ for the Replit community**
