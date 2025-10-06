# Security Documentation

## Overview

This document outlines the security architecture, threat model, and best practices for the ReplitCodeMiner application.

## Security Architecture

### Authentication & Authorization

- **OAuth2 Integration**: Replit OAuth2 for secure user authentication
- **Session Management**: Secure session handling with encrypted cookies
- **Role-Based Access Control**: User-level isolation for all data operations

### Input Validation & Sanitization

- **Zod Schema Validation**: All API inputs validated using Zod schemas
- **Size Limits**:
  - File uploads: 500KB per file (configured in patternDetection.ts)
  - Request body: Limited by Express body-parser
  - Pattern length: 10,000 characters maximum

### Rate Limiting

- **API Endpoints**: 100 requests per minute per IP
- **Configurable**: Can be adjusted per endpoint
- **Headers**: Standard rate limit headers (X-RateLimit-\*)

### Security Headers

The application sets the following security headers:

- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - Enables XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information

### Data Protection

- **Database**: PostgreSQL with connection pooling
- **Encryption**: Sensitive data encrypted at rest
- **Access Control**: User-based data isolation
- **Audit Trail**: Comprehensive logging for all operations

## Threat Model

### Threats Addressed

1. **Denial of Service (DoS)**
   - Mitigation: Rate limiting, file size limits, timeout enforcement
   - Pattern detection skips files > 500KB
   - Request timeouts configured

2. **Code Injection**
   - Mitigation: Input validation, parameterized queries, no eval/exec
   - All inputs validated with Zod schemas
   - Database queries use Drizzle ORM (parameterized)

3. **Authentication Bypass**
   - Mitigation: OAuth2, secure session management
   - All sensitive endpoints protected by `isAuthenticated` middleware

4. **Information Disclosure**
   - Mitigation: Error message sanitization, logging controls
   - Stack traces not exposed in production
   - Sensitive data filtered from logs

5. **Cross-Site Scripting (XSS)**
   - Mitigation: Security headers, React auto-escaping
   - Content Security Policy (CSP) headers
   - React's built-in XSS protection

6. **Cross-Site Request Forgery (CSRF)**
   - Mitigation: Same-site cookies, CSRF tokens (via session)
   - Origin validation

### Residual Risks

1. **Large File Processing**
   - Risk: Memory exhaustion from analyzing very large projects
   - Mitigation: Size limits in place, but batch processing could be improved
   - Recommendation: Implement streaming analysis for large codebases

2. **Regex Complexity**
   - Risk: ReDoS (Regular Expression Denial of Service)
   - Mitigation: Pre-compiled regexes, but patterns could be further optimized
   - Recommendation: Add timeout enforcement for regex operations

3. **Cache Poisoning**
   - Risk: Malicious input cached and served to other users
   - Mitigation: User-scoped caching, but cross-project analysis shares cache
   - Recommendation: Implement cache key signing

## Security Best Practices

### For Developers

1. **Input Validation**

   ```typescript
   // Always use Zod schemas for validation
   const schema = z.object({
     projectId: z.string().uuid(),
     options: z.object({
       depth: z.number().min(1).max(10),
     }),
   });

   app.post('/api/endpoint', validateInput(schema), handler);
   ```

2. **Error Handling**

   ```typescript
   // Don't expose sensitive details
   try {
     // ... operation
   } catch (error) {
     logger.error('Operation failed:', error);
     res.status(500).json({ message: 'Operation failed' });
     // NOT: res.status(500).json({ error: error.stack })
   }
   ```

3. **Database Queries**

   ```typescript
   // Always use parameterized queries via Drizzle
   const result = await db
     .select()
     .from(projects)
     .where(eq(projects.userId, userId));

   // NOT: db.execute(`SELECT * FROM projects WHERE userId = '${userId}'`)
   ```

4. **File Operations**
   ```typescript
   // Always validate file size before processing
   if (content.length > MAX_FILE_SIZE) {
     throw new Error('File too large');
   }
   ```

### For Users

1. **API Keys**: Never commit API keys or secrets to repositories
2. **Access Control**: Regularly review project access permissions
3. **Data Sensitivity**: Avoid analyzing repositories with sensitive information
4. **Rate Limits**: Be mindful of rate limits to ensure service availability

## Incident Response

### Security Issue Reporting

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email security@[domain] with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested fix (if applicable)
3. Allow 90 days for patching before public disclosure

### Response Process

1. **Triage**: Within 48 hours
2. **Fix Development**: Within 7 days for critical issues
3. **Deployment**: Coordinated with reporter
4. **Disclosure**: Public disclosure after patch deployment

## Security Checklist

### Pre-Deployment

- [ ] Environment variables configured (DATABASE_URL, secrets)
- [ ] Rate limiting enabled and tested
- [ ] Security headers verified
- [ ] Input validation schemas reviewed
- [ ] Error messages sanitized
- [ ] Logging configured (no sensitive data)
- [ ] HTTPS enforced in production

### Regular Maintenance

- [ ] Dependencies updated monthly
- [ ] Security audit quarterly
- [ ] Access logs reviewed weekly
- [ ] Incident response plan tested annually

## Compliance

### Data Protection

- User data stored with encryption at rest
- Data retention policies enforced
- Right to deletion supported (GDPR compliance)
- Data export available on request

### Audit Trail

- All data modifications logged
- User actions tracked
- Access attempts logged
- Failed authentication attempts recorded

## Security Monitoring

### Metrics Tracked

- Failed authentication attempts
- Rate limit violations
- Input validation failures
- Slow request patterns
- Error rates by endpoint
- Memory and CPU usage

### Alerting

- Automated alerts for:
  - Sustained rate limit violations
  - High error rates (>5%)
  - Memory usage >90%
  - Authentication failures spike

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

## Version History

- v1.0.0 (2025-01-05): Initial security documentation
