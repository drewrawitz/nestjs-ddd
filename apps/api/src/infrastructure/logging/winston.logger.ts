import * as winston from 'winston';
import { ILogger } from './logger.interface';

const { combine, json, colorize, errors, timestamp, printf } = winston.format;

const myFormat = printf((info) => {
  const { timestamp: tmsmp, level, message, context, ...rest } = info;
  let log = `${tmsmp} - ${level}:\t${message}`;

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
});

export class WinstonLogger implements ILogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'debug',
      format: combine(
        json(),
        timestamp(),
        errors({ stack: true }),
        colorize({ all: true }),
        myFormat,
      ),
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
