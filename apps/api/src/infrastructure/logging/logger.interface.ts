export interface ILogger {
  log(message: string, context?: Record<string, any>): void;
  error(message: string, trace?: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  debug(message: string, context?: Record<string, any>): void;
}
