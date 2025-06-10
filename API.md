
# API Documentation

## 🚀 Overview

The Replit Code Analysis Platform provides a comprehensive REST API for analyzing code patterns, detecting duplicates, and generating quality metrics across Replit projects.

**Base URL**: `https://your-app.replit.app/api`

## 🔐 Authentication

All API endpoints require authentication via OAuth 2.0 with Replit.

### Authentication Flow
1. Redirect to `/auth/login` to initiate OAuth
2. User authorizes the application
3. Receive JWT token upon successful callback
4. Include token in Authorization header for API calls

### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 📊 Endpoints

### Authentication

#### `GET /auth/login`
Initiates Replit OAuth flow.

**Response**: Redirects to Replit OAuth page

---

#### `GET /auth/callback`
Handles OAuth callback and generates JWT token.

**Query Parameters**:
- `code` (string): OAuth authorization code
- `state` (string): CSRF protection state

**Response**:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user123",
    "username": "developer",
    "displayName": "Developer Name"
  }
}
```

---

#### `POST /auth/logout`
Invalidates the current session.

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Projects

#### `GET /api/projects`
Retrieves the authenticated user's Replit projects.

**Query Parameters**:
- `limit` (number, optional): Maximum number of projects (default: 50)
- `offset` (number, optional): Pagination offset (default: 0)

**Response**:
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "project123",
        "title": "My Web App",
        "language": "javascript",
        "isPrivate": false,
        "url": "https://replit.com/@user/project",
        "lastModified": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 25,
    "hasMore": false
  }
}
```

---

#### `GET /api/projects/:id`
Retrieves detailed information about a specific project.

**Parameters**:
- `id` (string): Project ID

**Response**:
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "project123",
      "title": "My Web App",
      "language": "javascript",
      "isPrivate": false,
      "url": "https://replit.com/@user/project",
      "lastModified": "2024-01-15T10:30:00Z",
      "fileCount": 25,
      "totalLines": 1250
    }
  }
}
```

### Analysis

#### `POST /api/analyze`
Analyzes selected projects for code patterns and duplicates.

**Request Body**:
```json
{
  "projectIds": ["project123", "project456"],
  "options": {
    "includeComments": false,
    "minSimilarity": 0.8,
    "excludePatterns": ["node_modules", "*.test.*"]
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "analysisId": "analysis789",
    "status": "processing",
    "estimatedTime": 30,
    "projectsAnalyzed": 2
  }
}
```

---

#### `GET /api/analyze/:id`
Retrieves analysis results.

**Parameters**:
- `id` (string): Analysis ID

**Response**:
```json
{
  "success": true,
  "data": {
    "analysisId": "analysis789",
    "status": "completed",
    "results": {
      "totalPatterns": 45,
      "duplicateGroups": 8,
      "qualityScore": 85,
      "patterns": [
        {
          "id": "pattern1",
          "type": "function",
          "code": "function validateEmail(email) { ... }",
          "occurrences": 3,
          "projects": ["project123", "project456"],
          "similarity": 0.95,
          "suggestions": ["Extract to shared utility"]
        }
      ]
    },
    "completedAt": "2024-01-15T10:35:00Z"
  }
}
```

### Quality Metrics

#### `POST /api/quality/analyze`
Performs comprehensive quality analysis on code.

**Request Body**:
```json
{
  "code": "function example() { return true; }",
  "language": "javascript",
  "options": {
    "checkSecurity": true,
    "checkComplexity": true,
    "checkStyle": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "quality": {
      "overall": 85,
      "maintainability": 90,
      "complexity": 3,
      "security": 95,
      "style": 88
    },
    "issues": [
      {
        "type": "warning",
        "category": "style",
        "message": "Consider using const instead of let",
        "line": 5,
        "severity": "low"
      }
    ],
    "metrics": {
      "linesOfCode": 125,
      "cyclomaticComplexity": 8,
      "commentRatio": 0.15
    }
  }
}
```

---

#### `GET /api/quality/metrics`
Retrieves quality metrics for analyzed projects.

**Query Parameters**:
- `projectId` (string, optional): Specific project ID
- `timeRange` (string, optional): Time range (7d, 30d, 90d)

**Response**:
```json
{
  "success": true,
  "data": {
    "metrics": {
      "averageQuality": 82,
      "totalProjects": 15,
      "issuesFound": 23,
      "issuesFixed": 18
    },
    "trends": [
      {
        "date": "2024-01-15",
        "quality": 85,
        "issues": 2
      }
    ]
  }
}
```

### Refactoring

#### `POST /api/refactor/suggestions`
Generates AI-powered refactoring suggestions.

**Request Body**:
```json
{
  "patterns": [
    {
      "code": "function validateEmail(email) { ... }",
      "occurrences": 3,
      "projects": ["project123", "project456"]
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "type": "extract_function",
        "title": "Extract Email Validation Utility",
        "description": "Create a shared utility function for email validation",
        "beforeCode": "function validateEmail(email) { ... }",
        "afterCode": "import { validateEmail } from './utils'; ...",
        "estimatedEffort": "low",
        "potentialSavings": 15,
        "priority": 3
      }
    ]
  }
}
```

### Analytics

#### `GET /api/analytics`
Retrieves analytics dashboard data.

**Query Parameters**:
- `timeRange` (string, optional): Time range (7d, 30d, 90d)
- `projectIds` (string[], optional): Filter by specific projects

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalProjects": 25,
      "duplicatesFound": 48,
      "qualityImprovement": 12,
      "timesSaved": 120
    },
    "charts": {
      "qualityTrend": [
        { "date": "2024-01-01", "score": 78 },
        { "date": "2024-01-15", "score": 85 }
      ],
      "duplicatesByType": [
        { "type": "functions", "count": 15 },
        { "type": "components", "count": 8 }
      ]
    }
  }
}
```

## 🚫 Error Handling

All endpoints return consistent error responses:

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid project ID provided",
    "details": {
      "field": "projectId",
      "expected": "string"
    }
  }
}
```

### Common Error Codes
- `UNAUTHORIZED` (401): Missing or invalid authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request data
- `RATE_LIMITED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## 📏 Rate Limiting

API endpoints are rate-limited to ensure fair usage:

- **General APIs**: 100 requests per 15 minutes
- **Analysis APIs**: 10 requests per 15 minutes
- **Authentication**: 20 requests per 15 minutes

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## 📋 Request/Response Examples

### Complete Analysis Workflow

1. **Authenticate**:
```bash
curl -X GET "https://your-app.replit.app/auth/login"
```

2. **Get Projects**:
```bash
curl -X GET "https://your-app.replit.app/api/projects" \
  -H "Authorization: Bearer your_jwt_token"
```

3. **Start Analysis**:
```bash
curl -X POST "https://your-app.replit.app/api/analyze" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "projectIds": ["project123", "project456"],
    "options": {
      "minSimilarity": 0.8
    }
  }'
```

4. **Check Results**:
```bash
curl -X GET "https://your-app.replit.app/api/analyze/analysis789" \
  -H "Authorization: Bearer your_jwt_token"
```

## 🔧 SDKs and Libraries

### JavaScript/TypeScript
```javascript
import { ReplitAnalysisClient } from 'replit-analysis-sdk';

const client = new ReplitAnalysisClient({
  token: 'your_jwt_token',
  baseUrl: 'https://your-app.replit.app'
});

// Analyze projects
const analysis = await client.analyze(['project123', 'project456']);
```

### Python
```python
from replit_analysis import Client

client = Client(token='your_jwt_token')
analysis = client.analyze(['project123', 'project456'])
```

## 📚 Additional Resources

- [Authentication Guide](./docs/auth.md)
- [Analysis Examples](./docs/examples.md)
- [SDK Documentation](./docs/sdks.md)
- [Webhook Integration](./docs/webhooks.md)

---

**Version**: 1.0.0  
**Last Updated**: January 2025

For support, please contact `api-support@your-domain.com`
