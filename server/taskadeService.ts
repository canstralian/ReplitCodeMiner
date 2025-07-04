
interface TaskadeConfig {
  webhookUrl?: string;
  projectId?: string;
  apiKey?: string;
}

interface TaskadeNotification {
  title: string;
  description?: string;
  status: 'info' | 'success' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

export class TaskadeService {
  private config: TaskadeConfig;

  constructor() {
    this.config = {
      webhookUrl: process.env.TASKADE_WEBHOOK_URL,
      projectId: process.env.TASKADE_PROJECT_ID,
      apiKey: process.env.TASKADE_API_KEY,
    };
  }

  async sendNotification(notification: TaskadeNotification): Promise<boolean> {
    if (!this.config.webhookUrl) {
      console.warn('Taskade webhook URL not configured');
      return false;
    }

    try {
      const payload = {
        text: notification.title,
        description: notification.description,
        status: notification.status,
        timestamp: new Date().toISOString(),
        project: 'Replit Duplicate Detector',
        ...notification.metadata,
      };

      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Taskade notification sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send Taskade notification:', error);
      return false;
    }
  }

  async notifyAnalysisComplete(userId: string, stats: any): Promise<void> {
    await this.sendNotification({
      title: '🔍 Code Analysis Completed',
      description: `Found ${stats.duplicatesFound} duplicates across ${stats.totalProjects} projects`,
      status: 'success',
      metadata: {
        userId,
        duplicatesFound: stats.duplicatesFound,
        totalProjects: stats.totalProjects,
        languages: Object.keys(stats.languages).join(', '),
      },
    });
  }

  async notifyError(error: string, context?: Record<string, any>): Promise<void> {
    await this.sendNotification({
      title: '❌ Application Error',
      description: error,
      status: 'error',
      metadata: context,
    });
  }

  async notifyDeployment(version?: string): Promise<void> {
    await this.sendNotification({
      title: '🚀 New Deployment',
      description: version ? `Version ${version} deployed successfully` : 'Application deployed successfully',
      status: 'success',
      metadata: { version, environment: process.env.NODE_ENV },
    });
  }

  async createTask(title: string, description?: string, assignee?: string): Promise<boolean> {
    if (!this.config.apiKey || !this.config.projectId) {
      console.warn('Taskade API key or project ID not configured');
      return false;
    }

    try {
      const response = await fetch(`https://www.taskade.com/api/v1/projects/${this.config.projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          content: title,
          notes: description,
          ...(assignee && { assignee }),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Taskade task created successfully');
      return true;
    } catch (error) {
      console.error('Failed to create Taskade task:', error);
      return false;
    }
  }
}

export const taskadeService = new TaskadeService();
