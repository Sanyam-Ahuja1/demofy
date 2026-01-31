import { env } from '../config/env';

/**
 * Structured logger for development and production
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogData {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

class Logger {
  private log(level: LogLevel, message: string, data?: any) {
    const logData: LogData = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };

    if (env.NODE_ENV === 'production') {
      // JSON logging for production (easily parseable by log aggregators)
      console.log(JSON.stringify(logData));
    } else {
      // Human-readable logging for development
      const emoji = {
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
        debug: '🐛',
      }[level];

      console.log(`${emoji} [${level.toUpperCase()}] ${message}`);
      if (data) {
        console.log(data);
      }
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  debug(message: string, data?: any) {
    if (env.NODE_ENV === 'development') {
      this.log('debug', message, data);
    }
  }
}

export const logger = new Logger();
