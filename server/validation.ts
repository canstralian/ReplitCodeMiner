import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { logger, AppError } from "./logger";

export const projectAnalysisSchema = z.object({
  body: z.object({
    projectIds: z.array(z.string()).min(1).max(50)
  })
});

export const searchSchema = z.object({
  body: z.object({
    query: z.string().min(1).max(200),
    language: z.string().optional(),
    patternType: z.enum(['function', 'component', 'import', 'all']).optional()
  })
});

export const refreshProjectsSchema = z.object({
  query: z.object({
    refresh: z.enum(['true', 'false']).optional()
  })
});

export const duplicateGroupSchema = z.object({
  params: z.object({
    groupId: z.string().regex(/^\d+$/)
  })
});

export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Validation error', { 
          errors: error.errors,
          path: req.path,
          method: req.method 
        });
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors
        });
      }
      next(error);
    }
  };
}