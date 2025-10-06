import { z } from 'zod';

/**
 * Validation schemas for API endpoints
 * All schemas include security constraints to prevent abuse
 */

// Project schemas
export const createProjectSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  description: z.string().max(1000).optional(),
  language: z.string().max(50).optional(),
  repositoryUrl: z.string().url().optional(),
  replitUrl: z.string().url().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).trim().optional(),
  description: z.string().max(1000).optional(),
  language: z.string().max(50).optional(),
  repositoryUrl: z.string().url().optional(),
  replitUrl: z.string().url().optional(),
});

// Analysis schemas
export const analyzeProjectsSchema = z.object({
  projectIds: z.array(z.string().uuid()).min(1).max(50),
  options: z.object({
    similarityThreshold: z.number().min(0).max(1).optional(),
    includeTests: z.boolean().optional(),
    languages: z.array(z.string()).max(20).optional(),
    maxFileSize: z.number().min(0).max(5000000).optional(), // Max 5MB per file
  }).optional(),
});

export const analyzeOptionsSchema = z.object({
  similarityThreshold: z.number().min(0).max(1).default(0.75),
  includeTests: z.boolean().default(false),
  languages: z.array(z.string().max(50)).max(20).default([]),
  maxFileSize: z.number().min(0).max(5000000).default(500000), // Default 500KB
  timeout: z.number().min(1000).max(300000).default(60000), // Max 5 minutes
});

// Search schemas
export const searchSchema = z.object({
  query: z.string().min(1).max(500).trim(),
  language: z.string().max(50).optional(),
  patternType: z.enum(['function', 'component', 'class', 'method', 'import', 'hook']).optional(),
  page: z.number().int().min(1).max(1000).default(1),
  perPage: z.number().int().min(1).max(100).default(20),
});

// Settings schemas
export const updateSettingsSchema = z.object({
  similarityThreshold: z.number().min(0).max(1).optional(),
  excludeTests: z.boolean().optional(),
  excludePatterns: z.array(z.string().max(200)).max(50).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    duplicatesFound: z.boolean().optional(),
    analysisComplete: z.boolean().optional(),
  }).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    language: z.string().max(10).optional(),
  }).optional(),
});

// Taskade notification schemas
export const taskadeNotificationSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().min(1).max(1000).trim(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']).optional(),
  metadata: z.record(z.any()).optional(),
});

export const taskadeTaskSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).optional(),
  assignee: z.string().email().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).max(1000).default(1),
  perPage: z.number().int().min(1).max(100).default(20),
});

// Duplicate query schemas
export const duplicatesQuerySchema = z.object({
  minSimilarity: z.number().min(0).max(1).default(0.75),
  limit: z.number().int().min(1).max(500).default(50),
  offset: z.number().int().min(0).default(0),
  projectId: z.string().uuid().optional(),
  type: z.enum(['structural', 'semantic', 'syntactic']).optional(),
});

// File upload schemas (for future implementation)
export const fileUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().min(1).max(5000000), // Max 5MB
  mimeType: z.string().regex(/^[a-z]+\/[a-z0-9-+.]+$/i),
  content: z.string().max(5000000), // Base64 encoded content
});

// Comparison schema
export const compareFilesSchema = z.object({
  file1: z.object({
    projectId: z.string().uuid(),
    filePath: z.string().min(1).max(500),
  }),
  file2: z.object({
    projectId: z.string().uuid(),
    filePath: z.string().min(1).max(500),
  }),
  options: z.object({
    ignoreWhitespace: z.boolean().default(true),
    contextLines: z.number().int().min(0).max(100).default(3),
  }).optional(),
});

// Webhook schemas (for future implementation)
export const webhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum(['analysis_complete', 'duplicate_found', 'error'])).min(1).max(10),
  secret: z.string().min(16).max(128).optional(),
  enabled: z.boolean().default(true),
});

/**
 * Validation helper that sanitizes and validates UUID parameters
 */
export const uuidParamSchema = z.string().uuid();

/**
 * Validation helper for file paths to prevent path traversal attacks
 */
export const filePathSchema = z.string()
  .min(1)
  .max(500)
  .regex(/^[a-zA-Z0-9/_.-]+$/, 'Invalid file path characters')
  .refine(
    (path) => !path.includes('..') && !path.startsWith('/'),
    { message: 'Path traversal not allowed' }
  );

/**
 * Validation helper for safe string input (prevents XSS)
 */
export const safeStringSchema = (maxLength: number = 1000) => 
  z.string()
    .max(maxLength)
    .trim()
    .transform((str) => {
      // Remove potentially dangerous characters
      return str.replace(/[<>]/g, '');
    });

/**
 * Rate limit bypass token schema (for admin/service accounts)
 */
export const rateLimitBypassSchema = z.object({
  token: z.string().length(64), // SHA-256 hex string
  reason: z.string().max(200).optional(),
});

/**
 * Export all schemas as a namespace for easy importing
 */
export const schemas = {
  createProject: createProjectSchema,
  updateProject: updateProjectSchema,
  analyzeProjects: analyzeProjectsSchema,
  analyzeOptions: analyzeOptionsSchema,
  search: searchSchema,
  updateSettings: updateSettingsSchema,
  taskadeNotification: taskadeNotificationSchema,
  taskadeTask: taskadeTaskSchema,
  pagination: paginationSchema,
  duplicatesQuery: duplicatesQuerySchema,
  fileUpload: fileUploadSchema,
  compareFiles: compareFilesSchema,
  webhook: webhookSchema,
  uuidParam: uuidParamSchema,
  filePath: filePathSchema,
  safeString: safeStringSchema,
  rateLimitBypass: rateLimitBypassSchema,
};

export default schemas;
