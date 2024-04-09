import * as winston from 'winston';
import { ILogger } from './logger.interface';

const format = winston.format.combine(
  winston.format.label({
    label: '[LOGGER]',
  }),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.printf((info) => {
    const { timestamp, label, level, message, context, ...rest } = info;
    let log = `${label}  ${timestamp}  ${level}: ${message}\n`;

    if (context) {
      if (context.error?.stack) log = `${log}\n${context.error.stack}`;
      if (process.env.NODE_ENV !== 'production')
        log = `${log}\n${JSON.stringify(context, null, 2)}`;
    }
    // Check if rest is object
    if (!(Object.keys(rest).length === 0 && rest.constructor === Object)) {
      log = `${log}\n${JSON.stringify(rest, null, 2)}`;
    }
    return log;
  }),
  winston.format.colorize({
    all: true,
  }),
);

export class WinstonLogger implements ILogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'debug',
      format,
      transports: [
        new winston.transports.Console({
          handleExceptions: true,
        }),
      ],
    });
  }

  log(message: string, context?: Record<string, any>): void {
    this.logger.info(message, { context });
  }

  error(message: string, context?: Record<string, any>): void {
    this.logger.error(message, { context });
  }

  warn(message: string, context?: Record<string, any>): void {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: Record<string, any>): void {
    this.logger.debug(message, { context });
  }
}
