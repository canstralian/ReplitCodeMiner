
# Integration Setup Guide

This guide explains how to set up GitHub Actions CI/CD, Replit Workflows, and Taskade integration.

## GitHub Actions Setup

1. **Repository Secrets**: Add these secrets to your GitHub repository:
   - `REPLIT_TOKEN`: Your Replit API token
   - `TASKADE_WEBHOOK`: Webhook URL for Taskade notifications

2. **Workflows**: The CI/CD workflows are automatically triggered on:
   - **CI**: Push to main/develop branches and pull requests
   - **Deploy**: Push to main branch or manual trigger

## Replit Workflows

Available workflows in your Replit workspace:

- **Development Server**: Install dependencies and start dev server
- **Production Build**: Type check, build, and start production server
- **Database Setup**: Run database migrations
- **Full Test Suite**: Complete testing and build pipeline

## Taskade Integration

### Setup Steps

1. **Get Taskade API Key**:
   - Go to Taskade Settings → API
   - Generate a new API key

2. **Create Webhook** (optional):
   - In your Taskade project, go to Integrations
   - Create a new webhook for notifications

3. **Configure Environment Variables**:
   ```bash
   TASKADE_WEBHOOK_URL=https://www.taskade.com/api/webhooks/your_webhook_id
   TASKADE_PROJECT_ID=your_project_id
   TASKADE_API_KEY=your_api_key
   ```

### Features

- **Automatic Notifications**: Get notified when analysis completes
- **Error Reporting**: Automatic error notifications to Taskade
- **Task Creation**: Create tasks from the application
- **Deployment Notifications**: Get notified of successful deployments

### API Endpoints

- `POST /api/taskade/notify`: Send custom notifications
- `POST /api/taskade/task`: Create new tasks

## Testing the Integration

1. **GitHub Actions**: Push code to trigger CI/CD
2. **Replit Workflows**: Use the workflow dropdown in Replit
3. **Taskade**: Run project analysis to test notifications

## Troubleshooting

- **GitHub Actions**: Check repository secrets and workflow permissions
- **Replit Workflows**: Ensure all dependencies are installed
- **Taskade**: Verify API key and webhook URL are correct
