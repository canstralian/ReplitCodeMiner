# Security Best Practices

## Development Server Security

### CORS Configuration

This application implements strict Cross-Origin Resource Sharing (CORS) policies to protect against unauthorized cross-origin access to development resources.

#### Protection Against CORS Abuse

**Risk:** Development servers with permissive CORS policies (e.g., `Access-Control-Allow-Origin: *`) can expose sensitive information to malicious websites. An attacker could:

- Host a malicious page that makes requests to your local dev server
- Steal compiled JS/CSS files, source maps, and HTML assets
- Reverse-engineer original source code
- Access file change events via SSE endpoints

**Mitigation:** This project restricts CORS to specific origins:

- **Development:** Only `http://localhost:5000` and `http://127.0.0.1:5000`
- **Production:** Only whitelisted Replit domains

#### Configuration

CORS is configured in two places:

1. **Express Server** (`server/index.ts`):

```typescript
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://*.replit.app', 'https://*.replit.dev']
        : ['http://localhost:5000', 'http://127.0.0.1:5000'],
    credentials: true,
  })
);
```

2. **Vite Development Server** (`vite.config.ts` and `server/vite.ts`):

```typescript
server: {
  cors: {
    origin: ['http://localhost:5000', 'http://127.0.0.1:5000'],
    credentials: true,
  },
}
```

### Developer Safety Guidelines

When running the development server:

1. **Avoid browsing untrusted websites** while the dev server is running
2. **Use a separate browser profile** for development to isolate sessions
3. **Stop the dev server** when not actively developing
4. **Never commit secrets** or sensitive credentials to the repository
5. **Keep dependencies updated** to patch security vulnerabilities

### Reporting Security Issues

If you discover a security vulnerability, please report it by:

1. **Do not** open a public GitHub issue
2. Email the maintainers directly with details
3. Allow reasonable time for a fix before public disclosure

## Additional Security Measures

### Helmet.js

This application uses Helmet.js to set security-related HTTP headers:

- Content Security Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy

### Rate Limiting

API endpoints implement rate limiting to prevent abuse:

- Default: 100 requests per minute per IP
- Configurable via middleware settings

### Input Validation

All API inputs are validated using Zod schemas to prevent injection attacks.

### Session Security

- Sessions use secure, HTTP-only cookies
- CSRF protection is enabled
- Session data is stored securely

## References

- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [Vite Security Best Practices](https://vitejs.dev/guide/best-practices.html)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
