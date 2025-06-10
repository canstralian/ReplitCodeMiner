
import { z } from 'zod';

export const projectAnalysisSchema = z.object({
  projectIds: z.array(z.string().min(1, 'Project ID cannot be empty'))
    .min(1, 'At least one project ID is required')
    .max(50, 'Cannot analyze more than 50 projects at once')
});

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty').max(500, 'Query too long'),
  language: z.string().optional(),
  patternType: z.enum(['function', 'import', 'component', 'all']).optional()
});

export const refreshProjectsSchema = z.object({
  refresh: z.enum(['true', 'false']).optional()
});

export const duplicateGroupSchema = z.object({
  groupId: z.string().regex(/^\d+$/, 'Group ID must be a number')
});

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const data = req.method === 'GET' ? req.query : req.body;
      schema.parse(data);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};
