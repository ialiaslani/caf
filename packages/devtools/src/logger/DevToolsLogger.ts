/**
 * Centralized DevTools logger.
 * 
 * Provides a unified logging interface for all CAF DevTools.
 * Supports different log levels and custom formatters.
 * 
 * @example
 * ```ts
 * import { DevToolsLogger, LogLevel } from '@c-a-f/devtools/logger';
 * 
 * const logger = new DevToolsLogger({
 *   level: LogLevel.DEBUG,
 *   enabled: true,
 * });
 * 
 * logger.debug('Debug message', { data: 'value' });
 * logger.info('Info message');
 * logger.warn('Warning message');
 * logger.error('Error message', error);
 * ```
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface DevToolsLoggerOptions {
  /** Minimum log level to output */
  level?: LogLevel;
  /** Enable/disable logging */
  enabled?: boolean;
  /** Custom formatter function */
  formatter?: (level: LogLevel, message: string, data?: unknown) => string;
  /** Custom output function */
  output?: (message: string, data?: unknown) => void;
  /** Include timestamps */
  includeTimestamp?: boolean;
  /** Include log level prefix */
  includeLevel?: boolean;
}

/**
 * Centralized DevTools logger.
 */
export class DevToolsLogger {
  private level: LogLevel;
  private enabled: boolean;
  private formatter?: (level: LogLevel, message: string, data?: unknown) => string;
  private output: (message: string, data?: unknown) => void;
  private includeTimestamp: boolean;
  private includeLevel: boolean;

  constructor(options: DevToolsLoggerOptions = {}) {
    this.level = options.level ?? LogLevel.INFO;
    this.enabled = options.enabled ?? true;
    this.formatter = options.formatter;
    this.output = options.output ?? console.log;
    this.includeTimestamp = options.includeTimestamp ?? true;
    this.includeLevel = options.includeLevel ?? true;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.enabled && level >= this.level && level < LogLevel.NONE;
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    if (this.formatter) {
      return this.formatter(level, message, data);
    }

    const parts: string[] = [];

    if (this.includeTimestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    if (this.includeLevel) {
      const levelName = LogLevel[level];
      parts.push(`[${levelName}]`);
    }

    parts.push(message);

    return parts.join(' ');
  }

  /**
   * Log a debug message.
   */
  debug(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formatted = this.formatMessage(LogLevel.DEBUG, message, data);
      this.output(formatted, data);
    }
  }

  /**
   * Log an info message.
   */
  info(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formatted = this.formatMessage(LogLevel.INFO, message, data);
      this.output(formatted, data);
    }
  }

  /**
   * Log a warning message.
   */
  warn(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formatted = this.formatMessage(LogLevel.WARN, message, data);
      if (this.output === console.log) {
        console.warn(formatted, data);
      } else {
        this.output(formatted, data);
      }
    }
  }

  /**
   * Log an error message.
   */
  error(message: string, error?: unknown): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formatted = this.formatMessage(LogLevel.ERROR, message, error);
      if (this.output === console.log) {
        console.error(formatted, error);
      } else {
        this.output(formatted, error);
      }
    }
  }

  /**
   * Set log level.
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Enable logging.
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable logging.
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Check if logging is enabled.
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

/**
 * Create a DevTools logger instance.
 */
export function createDevToolsLogger(options?: DevToolsLoggerOptions): DevToolsLogger {
  return new DevToolsLogger(options);
}

/**
 * Default logger instance.
 */
export const defaultLogger = new DevToolsLogger();
