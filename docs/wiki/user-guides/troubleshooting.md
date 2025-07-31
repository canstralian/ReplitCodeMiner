
# Troubleshooting Guide

This guide helps you resolve common issues when using the Replit Duplicate Detector Extension.

## 🚨 Common Issues

### Performance Issues

#### Slow Loading Times
**Symptoms**: Application takes a long time to load, requests timeout
**Solutions**:
- **Refresh the page** and try again
- **Clear browser cache** and reload
- **Check internet connection** stability
- **Try a different browser** or incognito mode
- **Close other browser tabs** to free up memory

#### Analysis Timeouts
**Symptoms**: Project analysis fails or stops unexpectedly
**Solutions**:
- **Analyze smaller batches** of projects at a time
- **Check project sizes** - very large projects may timeout
- **Wait and retry** - temporary server overload may resolve
- **Contact support** if issue persists

### Authentication Problems

#### Cannot Sign In
**Symptoms**: OAuth flow fails, stuck on login page
**Solutions**:
- **Ensure you're signed into Replit** in the same browser
- **Disable popup blockers** that may block OAuth window
- **Try incognito/private browsing** mode
- **Clear cookies and cache** for both sites
- **Check browser console** for error messages

#### Session Expires Frequently
**Symptoms**: Keep getting logged out, need to re-authenticate
**Solutions**:
- **Check browser settings** for cookie restrictions
- **Ensure stable internet connection**
- **Contact support** if problem persists across sessions

### Project Detection Issues

#### Missing Projects
**Symptoms**: Some of your Replit projects don't appear
**Solutions**:
- **Verify project visibility** - private projects may not be accessible
- **Check project activity** - inactive projects may not sync
- **Refresh project list** using the refresh button
- **Ensure projects contain supported file types**

#### Empty Analysis Results
**Symptoms**: Analysis completes but shows no duplicates
**Solutions**:
- **Check similarity threshold** settings
- **Verify file types** are supported (JS, TS, Python, etc.)
- **Review project contents** - very small projects may have no duplicates
- **Try different pattern detection settings**

### Database and Storage Issues

#### Analysis History Missing
**Symptoms**: Previous analysis results are gone
**Solutions**:
- **Check if logged into same account**
- **Database may have been reset** during updates
- **Re-run analysis** to regenerate results
- **Contact support** if data loss is unexpected

### Browser Compatibility

#### UI Elements Not Working
**Symptoms**: Buttons don't respond, layout appears broken
**Solutions**:
- **Update to latest browser version**
- **Enable JavaScript** in browser settings
- **Disable browser extensions** that may interfere
- **Try different browser** (Chrome, Firefox, Safari, Edge)

#### Mobile Device Issues
**Symptoms**: Poor experience on mobile/tablet
**Solutions**:
- **Use landscape mode** for better layout
- **Zoom out** if content appears too large
- **Switch to desktop** for complex analysis tasks
- **Report mobile-specific issues** for future improvements

## 🔧 Advanced Troubleshooting

### Console Debugging

#### Checking Browser Console
1. **Open Developer Tools** (F12 or right-click → Inspect)
2. **Go to Console tab**
3. **Look for error messages** (red text)
4. **Copy error details** for support requests

#### Common Console Errors
- **Network errors**: Check internet connection
- **CORS errors**: Usually temporary, try refreshing
- **JavaScript errors**: May indicate browser compatibility issues

### Network Issues

#### Connection Problems
**Check these items**:
- Stable internet connection
- Firewall not blocking requests
- VPN not interfering with OAuth
- Corporate network restrictions

### Performance Monitoring

#### Identifying Slow Requests
The application monitors request performance and logs warnings for requests taking >2 seconds. If you see frequent slow request warnings:

1. **Check server status** at `/health` endpoint
2. **Monitor memory usage** in browser dev tools
3. **Reduce concurrent operations**
4. **Contact support** with timing details

## 📞 Getting Additional Help

### Self-Service Resources
1. **Check this troubleshooting guide** first
2. **Review the [FAQ](faq.md)** for common questions
3. **Search [GitHub Issues](https://github.com/your-repo/issues)** for similar problems
4. **Read the [Getting Started Guide](getting-started.md)** for setup help

### Community Support
- **GitHub Discussions**: Get help from other users
- **Issue Reports**: Submit detailed bug reports
- **Feature Requests**: Suggest improvements

### Contacting Support

#### Before Contacting Support
Gather this information:
- **Browser and version** (e.g., Chrome 120.0)
- **Operating system** (e.g., Windows 11, macOS 14)
- **Error messages** from browser console
- **Steps to reproduce** the issue
- **Screenshots** if relevant

#### Support Channels
- **GitHub Issues**: For bug reports with reproduction steps
- **Email**: security@replitextension.com for security concerns
- **Community**: GitHub Discussions for general help

### Issue Report Template
```markdown
**Issue Description**
Brief summary of the problem

**Steps to Reproduce**
1. Go to...
2. Click on...
3. See error...

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happened

**Environment**
- Browser: Chrome 120.0
- OS: Windows 11
- Date/Time: 2024-01-15 14:30 EST

**Console Errors**
```
[Paste any console errors here]
```

**Additional Context**
Any other relevant information
```

## 🛠️ Preventive Measures

### Best Practices
- **Keep browser updated** to latest version
- **Clear cache regularly** to prevent stale data issues
- **Use supported browsers** (Chrome, Firefox, Safari, Edge)
- **Maintain stable internet** connection during analysis
- **Close unnecessary tabs** to free memory
- **Monitor application status** page for service updates

### Regular Maintenance
- **Review analysis results** periodically and clean up
- **Update browser bookmarks** if URLs change
- **Check for application updates** and new features
- **Backup important analysis data** if available

---

**Still having issues?** Don't hesitate to reach out through our support channels. We're here to help! 🚀

*Last updated: January 2025*
