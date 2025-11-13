/**
 * Simple logger utility with different log levels
 * In production, consider using a library like winston or pino
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

const shouldLog = (level: LogLevel): boolean => {
  const env = process.env.NODE_ENV || 'development';
  if (env === 'test') return false;
  if (level === 'debug' && env === 'production') return false;
  return true;
};

const formatMessage = (level: LogLevel, message: string, context?: LogContext): string => {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
};

export const logger = {
  info: (message: string, context?: LogContext) => {
    if (shouldLog('info')) {
      console.log(formatMessage('info', message, context));
    }
  },

  warn: (message: string, context?: LogContext) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, context));
    }
  },

  error: (message: string, context?: LogContext) => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, context));
    }
  },

  debug: (message: string, context?: LogContext) => {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message, context));
    }
  },
};
