
import { createLogger, format, transports } from 'winston';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: isDevelopment 
    ? format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.colorize(),
        format.simple()
      )
    : format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.json()
      ),
  defaultMeta: { service: 'replit-code-analyzer' },
  transports: [
    new transports.Console()
  ]
});

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const logRequest = (req: any, res: any, responseData?: any) => {
  const duration = Date.now() - (req.startTime || Date.now());
  
  logger.info('API Request', {
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    userId: req.user?.claims?.sub,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    ...(responseData && { responseData: JSON.stringify(responseData).slice(0, 200) })
  });
};
