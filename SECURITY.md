# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions of the Replit Duplicate Detector Extension:

| Version | Supported          |
| ------- | ------------------ |
| 1.2.x   | :white_check_mark: |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

All versions 1.0.0 and above receive security updates. We recommend always using the latest version to ensure you have the most recent security patches and features.

## Reporting a Vulnerability

We take security vulnerabilities seriously and appreciate your efforts to responsibly disclose any issues you find.

### How to Report

If you discover a security vulnerability, please report it by:

1. **Email**: Send details to [security@replitextension.com](mailto:security@replitextension.com)
2. **GitHub Security Advisories**: Use the [GitHub Security Advisory](https://github.com/canstralian/ReplitCodeMiner/security/advisories/new) feature for private disclosure

### What to Include

When reporting a vulnerability, please provide:

- A clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact and severity assessment
- Any suggested fixes or mitigations (if applicable)
- Your contact information for follow-up questions

### Response Timeline

- **Initial Response**: Within 48 hours of submission
- **Status Updates**: Every 7 days until resolution
- **Fix Timeline**: Critical vulnerabilities will be addressed within 7-14 days, others within 30-60 days depending on severity

### What to Expect

**If Accepted:**

- We will acknowledge your report and work with you to understand and resolve the issue
- You will be credited for the discovery (unless you prefer to remain anonymous)
- We will coordinate a disclosure timeline with you
- A security advisory will be published after the fix is deployed
- Your contribution will be recognized in our release notes

**If Declined:**

- We will explain why the report does not constitute a security vulnerability
- We may suggest alternative channels (e.g., bug report) if appropriate
- You are free to disclose the issue publicly if you disagree with our assessment

## Security Best Practices

When using the Replit Duplicate Detector Extension:

- Keep your installation up to date with the latest version
- Use strong, unique credentials for your Replit account
- Enable two-factor authentication on your Replit account
- Review and understand the OAuth permissions requested
- Keep your `SESSION_SECRET` and other environment variables secure
- Regularly review access logs and authentication events
- Report any suspicious activity immediately

## Security Features

Our application includes:

- **OAuth2 Authentication**: Secure integration with Replit accounts
- **Session Management**: Encrypted sessions with secure cookies
- **Input Validation**: Comprehensive input sanitization using Zod schemas
- **Security Headers**: Helmet.js for secure HTTP headers
- **CORS Protection**: Properly configured cross-origin resource sharing
- **Rate Limiting**: Protection against API abuse and DDoS attacks
- **Error Handling**: Structured error handling to prevent information leakage
- **Dependency Scanning**: Automated security audits of dependencies

## Security Updates

For information about security updates in each version, see:

- [CHANGELOG.md](CHANGELOG.md) - All version changes including security updates
- [GitHub Security Advisories](https://github.com/canstralian/ReplitCodeMiner/security/advisories) - Published security advisories
- [GitHub Releases](https://github.com/canstralian/ReplitCodeMiner/releases) - Release notes with security information

## Contact

For general security questions or concerns:

- **Email**: [security@replitextension.com](mailto:security@replitextension.com)
- **General Support**: [support@replitextension.com](mailto:support@replitextension.com)
- **GitHub Issues**: For non-security bugs and feature requests

Thank you for helping keep the Replit Duplicate Detector Extension secure!
