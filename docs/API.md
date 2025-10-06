# API Documentation

## Overview

ReplitCodeMiner provides a RESTful API for code duplicate detection and analysis. All endpoints require authentication via Replit OAuth2 unless otherwise specified.

## Base URL

```
Development: http://localhost:5000
Production: https://your-domain.replit.app
```

## Authentication

All authenticated endpoints require a valid session cookie obtained through Replit OAuth2 flow.

### Login Flow

1. Redirect user to `/api/login`
2. User authenticates with Replit
3. Callback redirects to application with session cookie
4. Session cookie used for subsequent API requests

### Endpoints

#### `GET /api/auth/user`

Get current authenticated user information.

**Authentication**: Required

**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profileImageUrl": "https://...",
  "createdAt": "2025-01-05T00:00:00Z"
}
```

**Status Codes**:
- `200 OK`: User found
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: User not found in database

---

#### `GET /api/profile`

Get detailed user profile with computed fields.

**Authentication**: Required

**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profileImageUrl": "https://...",
  "createdAt": "2025-01-05T00:00:00Z",
  "fullName": "John Doe",
  "initials": "JD"
}
```

---

## Project Management

#### `GET /api/projects`

List all projects for the authenticated user.

**Authentication**: Required

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `perPage` (optional): Results per page (default: 20, max: 100)

**Response**:
```json
{
  "projects": [
    {
      "id": "uuid",
      "userId": "uuid",
      "name": "My Project",
      "description": "Project description",
      "language": "JavaScript",
      "fileCount": 42,
      "lastAnalyzedAt": "2025-01-05T00:00:00Z",
      "createdAt": "2025-01-04T00:00:00Z",
      "updatedAt": "2025-01-05T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

---

#### `POST /api/projects`

Create a new project.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Project Name",
  "description": "Optional description",
  "language": "JavaScript",
  "repositoryUrl": "https://github.com/user/repo",
  "replitUrl": "https://replit.com/@user/project"
}
```

**Validation**:
- `name`: Required, 1-255 characters
- `description`: Optional, max 1000 characters
- `language`: Optional, max 50 characters
- `repositoryUrl`: Optional, valid URL
- `replitUrl`: Optional, valid URL

**Response**:
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Project Name",
  "description": "Optional description",
  "language": "JavaScript",
  "fileCount": 0,
  "createdAt": "2025-01-05T00:00:00Z"
}
```

**Status Codes**:
- `201 Created`: Project created successfully
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Not authenticated
- `429 Too Many Requests`: Rate limit exceeded

---

#### `GET /api/projects/:id`

Get details of a specific project.

**Authentication**: Required

**Parameters**:
- `id`: Project UUID

**Response**: Same as individual project in list endpoint

**Status Codes**:
- `200 OK`: Project found
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Project belongs to another user
- `404 Not Found`: Project not found

---

#### `POST /api/projects/:id/analyze`

Trigger analysis of a project.

**Authentication**: Required

**Parameters**:
- `id`: Project UUID

**Request Body** (optional):
```json
{
  "options": {
    "similarityThreshold": 0.75,
    "includeTests": false,
    "languages": ["JavaScript", "TypeScript"]
  }
}
```

**Response**:
```json
{
  "analysisId": "uuid",
  "status": "queued",
  "message": "Analysis started"
}
```

**Status Codes**:
- `200 OK`: Analysis started
- `400 Bad Request`: Invalid options
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Project belongs to another user
- `404 Not Found`: Project not found
- `429 Too Many Requests`: Rate limit exceeded

---

## Analysis Results

#### `GET /api/projects/:id/results`

Get analysis results for a project.

**Authentication**: Required

**Parameters**:
- `id`: Project UUID

**Query Parameters**:
- `latest` (optional): Get only latest analysis (default: true)

**Response**:
```json
{
  "analysis": {
    "id": "uuid",
    "projectId": "uuid",
    "status": "completed",
    "duplicateGroups": [
      {
        "id": "uuid",
        "patterns": [
          {
            "type": "function",
            "name": "calculateTotal",
            "signature": "function calculateTotal(items) { ... }",
            "hash": "abc123...",
            "complexity": 5,
            "lines": 10,
            "filePath": "src/utils.js",
            "startLine": 42,
            "endLine": 52
          }
        ],
        "similarityScore": 0.95,
        "type": "structural"
      }
    ],
    "totalPatterns": 150,
    "processingTime": 1234,
    "metrics": {
      "filesAnalyzed": 42,
      "patternsFound": 150,
      "duplicatesDetected": 12,
      "languages": {
        "JavaScript": 30,
        "TypeScript": 12
      }
    },
    "completedAt": "2025-01-05T00:00:00Z"
  }
}
```

**Status Codes**:
- `200 OK`: Results found
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Project belongs to another user
- `404 Not Found`: No analysis results found

---

## Duplicate Detection

#### `GET /api/duplicates`

Get all duplicate groups across user's projects.

**Authentication**: Required

**Query Parameters**:
- `minSimilarity` (optional): Minimum similarity score (0-1, default: 0.75)
- `limit` (optional): Max results (default: 50, max: 500)
- `offset` (optional): Pagination offset (default: 0)

**Response**:
```json
{
  "duplicates": [
    {
      "id": "uuid",
      "patterns": [...],
      "similarityScore": 0.95,
      "type": "structural",
      "projects": ["project-uuid-1", "project-uuid-2"]
    }
  ],
  "total": 42
}
```

---

## Settings

#### `GET /api/settings`

Get user settings.

**Authentication**: Required

**Response**:
```json
{
  "userId": "uuid",
  "similarityThreshold": 0.75,
  "excludeTests": true,
  "excludePatterns": ["node_modules", "dist", "*.min.js"],
  "notifications": {
    "email": true,
    "duplicatesFound": true
  }
}
```

---

#### `PUT /api/settings`

Update user settings.

**Authentication**: Required

**Request Body**:
```json
{
  "similarityThreshold": 0.80,
  "excludeTests": false,
  "excludePatterns": ["build/", "*.generated.js"],
  "notifications": {
    "email": false
  }
}
```

**Validation**:
- `similarityThreshold`: Optional, 0.0-1.0
- `excludeTests`: Optional, boolean
- `excludePatterns`: Optional, array of strings
- `notifications`: Optional, object

**Response**: Updated settings object

---

## Performance & Monitoring

#### `GET /api/performance`

Get system performance metrics (admin/monitoring).

**Authentication**: Required

**Response**:
```json
{
  "totalRequests": 1000,
  "averageResponseTime": 245,
  "minResponseTime": 10,
  "maxResponseTime": 5000,
  "p95ResponseTime": 800,
  "p99ResponseTime": 1200,
  "slowRequests": 42,
  "errorRate": 2,
  "endpointBreakdown": [
    {
      "endpoint": "/api/projects",
      "averageTime": 150,
      "requestCount": 500,
      "errorRate": 1,
      "lastAccess": 1704412800000
    }
  ],
  "memoryUsage": {
    "rss": 123456789,
    "heapTotal": 98765432,
    "heapUsed": 87654321
  },
  "uptime": 86400
}
```

---

#### `GET /api/health`

Health check endpoint (no authentication required).

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-05T00:00:00Z",
  "version": "1.0.0",
  "uptime": 86400,
  "checks": {
    "database": "healthy",
    "memory": "healthy",
    "performance": "healthy"
  }
}
```

**Status Codes**:
- `200 OK`: System healthy
- `503 Service Unavailable`: System degraded or unhealthy

---

## Rate Limiting

All authenticated endpoints are rate limited:

**Default Limits**:
- 100 requests per minute per IP
- Configurable per endpoint

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704412860
```

**Rate Limit Exceeded Response**:
```json
{
  "message": "Too many requests",
  "retryAfter": 42
}
```

**Status Code**: `429 Too Many Requests`

---

## Error Responses

All errors follow a consistent format:

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### Common Status Codes

- `400 Bad Request`: Invalid input or request
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

---

## WebSocket API (Future)

Real-time analysis progress updates will be available via WebSocket:

```javascript
const ws = new WebSocket('wss://your-domain/api/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // { type: 'progress', analysisId: 'uuid', progress: 0.5 }
};
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-domain/api',
  withCredentials: true // Include session cookie
});

// Get projects
const { data } = await api.get('/projects');

// Analyze project
await api.post(`/projects/${projectId}/analyze`, {
  options: {
    similarityThreshold: 0.75
  }
});

// Get results
const results = await api.get(`/projects/${projectId}/results`);
```

### Python

```python
import requests

session = requests.Session()
session.headers.update({'Content-Type': 'application/json'})

# Get projects
response = session.get('https://your-domain/api/projects')
projects = response.json()

# Analyze project
session.post(
    f'https://your-domain/api/projects/{project_id}/analyze',
    json={'options': {'similarityThreshold': 0.75}}
)
```

---

## Changelog

### Version 1.0.0 (2025-01-05)
- Initial API documentation
- Core endpoints for project management
- Analysis and duplicate detection
- Settings management
- Performance monitoring

---

## Support

For API issues or questions:
- GitHub Issues: https://github.com/your-username/replit-code-miner/issues
- Email: support@your-domain.com
- Documentation: https://your-domain.com/docs
