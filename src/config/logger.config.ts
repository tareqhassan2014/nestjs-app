import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

/**
 * Development format for human-readable logs
 */
const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    let logMessage = `${timestamp} [${level}]`;

    if (context) {
      logMessage += ` [${context}]`;
    }

    logMessage += ` ${message}`;

    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }

    return logMessage;
  }),
);

/**
 * Production format for structured logs
 */
const productionFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.metadata({
    fillExcept: ['message', 'level', 'timestamp', 'context'],
  }),
);

/**
 * Pretty format for Pino compatibility (when PINO_PRETTY is enabled)
 */
const prettyFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    let logMessage = `[${timestamp}] ${level}`;

    if (context) {
      logMessage += ` (${context})`;
    }

    logMessage += `: ${message}`;

    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return logMessage;
  }),
);

/**
 * Get the appropriate log format based on environment configuration
 */
function getLogFormat(): winston.Logform.Format {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const pinoPretty = process.env.PINO_PRETTY === 'true';

  if (pinoPretty) {
    return prettyFormat;
  }

  return nodeEnv === 'production' ? productionFormat : developmentFormat;
}

/**
 * Get file transports for production environment
 */
function getFileTransports(): winston.transport[] {
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (nodeEnv !== 'production') {
    return [];
  }

  return [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ];
}

/**
 * Get exception handlers for production environment
 */
function getExceptionHandlers(): winston.transport[] {
  const nodeEnv = process.env.NODE_ENV || 'development';

  const baseHandlers: winston.transport[] = [new winston.transports.Console()];

  if (nodeEnv === 'production') {
    baseHandlers.push(
      new winston.transports.File({
        filename: 'logs/exceptions.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    );
  }

  return baseHandlers;
}

/**
 * Get rejection handlers for production environment
 */
function getRejectionHandlers(): winston.transport[] {
  const nodeEnv = process.env.NODE_ENV || 'development';

  const baseHandlers: winston.transport[] = [new winston.transports.Console()];

  if (nodeEnv === 'production') {
    baseHandlers.push(
      new winston.transports.File({
        filename: 'logs/rejections.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    );
  }

  return baseHandlers;
}

/**
 * Winston configuration for the application
 * Supports different formats for development and production
 * Integrates with the configuration service for log levels and settings
 */
export const winstonConfig: WinstonModuleOptions = {
  level: process.env.LOG_LEVEL || 'info',
  format: getLogFormat(),
  transports: [
    new winston.transports.Console({
      silent: process.env.NODE_ENV === 'test',
      format: getLogFormat(),
    }),
    ...getFileTransports(),
  ],
  exceptionHandlers: getExceptionHandlers(),
  rejectionHandlers: getRejectionHandlers(),
  exitOnError: false,
  handleExceptions: true,
  handleRejections: true,
};

/**
 * Create a logger configuration factory that can be used with ConfigService
 */
export const createLoggerConfig = (config: {
  level?: string;
  requestLogging?: boolean;
  prettyPrint?: boolean;
  environment?: string;
}): WinstonModuleOptions => {
  const {
    level = 'info',
    environment = 'development',
    prettyPrint = false,
  } = config;

  // Override format if prettyPrint is explicitly set
  let format: winston.Logform.Format;
  if (prettyPrint) {
    format = prettyFormat;
  } else {
    format =
      environment === 'production' ? productionFormat : developmentFormat;
  }

  return {
    level,
    format,
    transports: [
      new winston.transports.Console({
        silent: environment === 'test',
        format,
      }),
      ...(environment === 'production' ? getFileTransports() : []),
    ],
    exceptionHandlers: getExceptionHandlers(),
    rejectionHandlers: getRejectionHandlers(),
    exitOnError: false,
    handleExceptions: true,
    handleRejections: true,
  };
};
