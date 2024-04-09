import { ILogger } from './logger.interface';

export class ConsoleLogger implements ILogger {
  log(message: string, context?: Record<string, any>): void {
    console.log(message, context);
  }

  error(message: string, context?: Record<string, any>): void {
    console.error(message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    console.warn(message, context);
  }

  debug(message: string, context?: Record<string, any>): void {
    console.debug(message, context);
  }
}
