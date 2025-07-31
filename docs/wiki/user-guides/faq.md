
# Frequently Asked Questions (FAQ)

Find answers to the most commonly asked questions about the Replit Duplicate Detector Extension.

## 🔍 General Questions

### What is the Replit Duplicate Detector Extension?
The Replit Duplicate Detector Extension is a powerful tool that analyzes your Replit projects to identify duplicate code patterns, helping you improve code quality and reduce redundancy across your projects.

### Is it free to use?
Yes, the basic version is completely free to use. We may introduce premium features in the future, but core duplicate detection will always remain free.

### Which programming languages are supported?
Currently supported languages include:
- JavaScript/TypeScript
- Python
- HTML/CSS
- JSON configuration files
- Markdown documentation

More languages are planned for future releases.

## 🚀 Getting Started

### How do I start using the extension?
1. **Sign in** with your Replit account
2. **Authorize** the extension to access your projects
3. **Click "Analyze Projects"** to start scanning
4. **Review results** in the dashboard

See our [Getting Started Guide](getting-started.md) for detailed instructions.

### Why can't I see all my projects?
Projects may not appear if they are:
- **Private repositories** without proper access
- **Empty projects** with no supported file types
- **Recently created** and not yet synced
- **Archived or deleted** projects

Try refreshing the project list or check project visibility settings.

### How long does analysis take?
Analysis time depends on:
- **Number of projects** (more projects = longer time)
- **Project sizes** (larger codebases take more time)
- **Server load** (peak times may be slower)

Typically, analysis takes 1-5 minutes for most users.

## 🔧 Technical Questions

### How does duplicate detection work?
The extension uses multiple techniques:
- **Hash-based comparison** for identical code blocks
- **AST (Abstract Syntax Tree) analysis** for structural similarities
- **Pattern matching** for similar algorithms with different variables
- **Semantic analysis** for functionally equivalent code

### What counts as a "duplicate"?
Duplicates are categorized as:
- **Exact duplicates**: Identical code with same functionality
- **Similar patterns**: Code with similar structure but different details
- **Structural duplicates**: Similar file organization or project patterns

### Can I adjust sensitivity settings?
Yes, you can customize:
- **Similarity threshold**: How similar code needs to be
- **File types**: Which files to include/exclude
- **Pattern types**: Focus on functions, classes, or modules
- **Project filters**: Include/exclude specific projects

## 🔒 Privacy & Security

### What data do you collect?
We collect:
- **Code patterns and hashes** for duplicate detection
- **Project metadata** (names, languages, file counts)
- **Analysis results** for your dashboard
- **Usage analytics** (anonymized performance data)

We **DO NOT** collect:
- **Your actual source code** content
- **Personal information** beyond what's needed for authentication
- **Sensitive project data** or secrets

### Is my code secure?
Yes, we implement multiple security layers:
- **OAuth2 authentication** with Replit
- **Encrypted data transmission** (HTTPS)
- **Secure session management**
- **No code storage** - we only store patterns and hashes
- **Regular security audits** and updates

### Can others see my analysis results?
No, your analysis results are private and only visible to your authenticated account. We don't share individual results with other users.

## 🎯 Using the Extension

### How do I interpret the results?
Results show:
- **Duplicate groups**: Sets of similar code patterns
- **Similarity scores**: How closely patterns match (0-100%)
- **File locations**: Where duplicates are found
- **Pattern types**: Functions, classes, or modules

See [Understanding Results](understanding-results.md) for detailed explanations.

### What should I do with duplicates?
Common actions include:
- **Extract to utilities**: Create shared functions/libraries
- **Refactor patterns**: Generalize similar code
- **Create templates**: Standardize project structures
- **Document intentional duplication**: Note when duplicates are purposeful

### Can I export my results?
Yes, you can export analysis results in various formats for further processing or sharing with team members.

## 🛠️ Troubleshooting

### The analysis is stuck or very slow
Try these solutions:
- **Refresh the page** and restart analysis
- **Analyze fewer projects** at once
- **Check internet connection** stability
- **Wait for server load** to decrease during peak times

### I'm getting authentication errors
Common fixes:
- **Ensure you're signed into Replit** in the same browser
- **Clear browser cache** and cookies
- **Disable popup blockers** that may interfere
- **Try incognito mode** to rule out extensions

### The interface looks broken
This usually indicates:
- **Outdated browser** - update to latest version
- **JavaScript disabled** - enable in browser settings
- **Browser extensions** interfering - try disabling them
- **Network issues** - check connection stability

### My results disappeared
Possible causes:
- **Session expired** - sign in again
- **Database maintenance** - results may be temporarily unavailable
- **Account changes** - verify you're using the same account
- **Browser data cleared** - cached results may be gone

## 📈 Features & Limitations

### What are the current limitations?
- **Project size limits**: Very large projects may timeout
- **Language support**: Limited to supported languages
- **Analysis depth**: Some complex patterns may not be detected
- **Performance**: Analysis speed depends on server capacity

### What features are planned?
Upcoming features include:
- **More language support** (Java, C++, Go, etc.)
- **Team collaboration** features
- **Advanced pattern recognition** with ML
- **Real-time analysis** as you code
- **Integration APIs** for external tools

### Can I suggest new features?
Absolutely! We welcome feature suggestions through:
- **GitHub Discussions** for community feedback
- **Feature request issues** with detailed descriptions
- **Community polls** for prioritizing features

## 🤝 Community & Support

### How can I get help?
Support options include:
- **This FAQ** for common questions
- **[Troubleshooting Guide](troubleshooting.md)** for technical issues
- **GitHub Issues** for bug reports
- **GitHub Discussions** for community help
- **Email support** for urgent issues

### How can I contribute?
Ways to contribute:
- **Report bugs** with detailed reproduction steps
- **Suggest features** based on your needs
- **Improve documentation** with pull requests
- **Help other users** in community discussions
- **Share feedback** about your experience

### Is there a community?
Yes! Join our community:
- **GitHub Discussions** for general conversation
- **Issue tracker** for bug reports and features
- **Documentation wiki** for collaborative knowledge
- **Social media** for updates and announcements

## 📊 Performance & Limits

### Are there usage limits?
Current limits:
- **No hard limits** on number of projects
- **Analysis frequency**: Reasonable use expected
- **API rate limits**: Prevent abuse and ensure performance
- **Storage limits**: Analysis history may be cleaned periodically

### How can I improve analysis performance?
Tips for better performance:
- **Organize projects** to reduce unnecessary analysis
- **Use filters** to focus on relevant projects
- **Analyze incrementally** rather than all at once
- **Keep projects updated** to reduce processing time

### What about very large projects?
For large projects:
- **Analysis may take longer** but should complete
- **Consider breaking down** monolithic projects
- **Use file type filters** to focus analysis
- **Contact support** if consistent timeouts occur

---

**Have a question not covered here?** Feel free to ask in our [GitHub Discussions](https://github.com/your-repo/discussions) or create an issue for specific problems.

*Last updated: January 2025*
