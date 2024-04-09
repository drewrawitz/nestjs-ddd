import { ILogger } from './logger.interface';
import * as winston from 'winston';
const { combine, json, colorize, timestamp, prettyPrint } = winston.format;

export class WinstonLogger implements ILogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: combine(
        json(),
        timestamp(),
        prettyPrint(),
        colorize({ all: true }),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  log(message: string, context?: Record<string, any>): void {
    this.logger.info(message, { context });
  }

  error(message: string, trace = '', context?: Record<string, any>): void {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: Record<string, any>): void {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: Record<string, any>): void {
    this.logger.debug(message, { context });
  }
}
