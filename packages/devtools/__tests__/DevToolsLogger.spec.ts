import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DevToolsLogger,
  LogLevel,
  createDevToolsLogger,
  defaultLogger,
} from '../src/logger/DevToolsLogger';

describe('DevToolsLogger', () => {
  let logger: DevToolsLogger;
  let outputSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    outputSpy = vi.fn();
    logger = new DevToolsLogger({
      output: outputSpy,
      level: LogLevel.DEBUG,
      enabled: true,
    });
  });

  describe('constructor', () => {
    it('should create logger with default options', () => {
      const defaultLogger = new DevToolsLogger();
      expect(defaultLogger.isEnabled()).toBe(true);
    });

    it('should create logger with custom options', () => {
      const customLogger = new DevToolsLogger({
        level: LogLevel.WARN,
        enabled: false,
        includeTimestamp: false,
        includeLevel: false,
      });
      expect(customLogger.isEnabled()).toBe(false);
    });

    it('should use custom output function', () => {
      const customOutput = vi.fn();
      const customLogger = new DevToolsLogger({
        output: customOutput,
      });
      customLogger.info('test');
      expect(customOutput).toHaveBeenCalled();
    });
  });

  describe('log levels', () => {
    it('should log debug messages when level is DEBUG', () => {
      logger.debug('debug message');
      expect(outputSpy).toHaveBeenCalled();
    });

    it('should log info messages when level is INFO', () => {
      logger.info('info message');
      expect(outputSpy).toHaveBeenCalled();
    });

    it('should log warn messages when level is WARN', () => {
      logger.warn('warn message');
      expect(outputSpy).toHaveBeenCalled();
    });

    it('should log error messages when level is ERROR', () => {
      logger.error('error message');
      expect(outputSpy).toHaveBeenCalled();
    });

    it('should not log debug when level is INFO', () => {
      const infoLogger = new DevToolsLogger({
        output: outputSpy,
        level: LogLevel.INFO,
      });
      infoLogger.debug('debug message');
      expect(outputSpy).not.toHaveBeenCalled();
    });

    it('should not log info when level is WARN', () => {
      const warnLogger = new DevToolsLogger({
        output: outputSpy,
        level: LogLevel.WARN,
      });
      warnLogger.info('info message');
      expect(outputSpy).not.toHaveBeenCalled();
    });

    it('should not log warn when level is ERROR', () => {
      const errorLevelLogger = new DevToolsLogger({
        output: outputSpy,
        level: LogLevel.ERROR,
      });
      errorLevelLogger.warn('warn message');
      expect(outputSpy).not.toHaveBeenCalled();
    });

    it('should not log anything when level is NONE', () => {
      const noneLogger = new DevToolsLogger({
        output: outputSpy,
        level: LogLevel.NONE,
      });
      noneLogger.error('error message');
      expect(outputSpy).not.toHaveBeenCalled();
    });
  });

  describe('enable/disable', () => {
    it('should disable logging', () => {
      logger.disable();
      logger.info('test');
      expect(outputSpy).not.toHaveBeenCalled();
    });

    it('should enable logging', () => {
      logger.disable();
      logger.enable();
      logger.info('test');
      expect(outputSpy).toHaveBeenCalled();
    });

    it('should check if enabled', () => {
      expect(logger.isEnabled()).toBe(true);
      logger.disable();
      expect(logger.isEnabled()).toBe(false);
    });
  });

  describe('setLevel', () => {
    it('should change log level', () => {
      logger.setLevel(LogLevel.WARN);
      logger.info('info message');
      expect(outputSpy).not.toHaveBeenCalled();

      logger.warn('warn message');
      expect(outputSpy).toHaveBeenCalled();
    });
  });

  describe('message formatting', () => {
    it('should include timestamp by default', () => {
      logger.info('test');
      const call = outputSpy.mock.calls[0][0];
      expect(call).toContain('[');
      expect(call).toContain(']');
    });

    it('should include log level by default', () => {
      logger.info('test');
      const call = outputSpy.mock.calls[0][0];
      expect(call).toContain('[INFO]');
    });

    it('should not include timestamp when disabled', () => {
      const noTimestampLogger = new DevToolsLogger({
        output: outputSpy,
        includeTimestamp: false,
      });
      noTimestampLogger.info('test');
      const call = outputSpy.mock.calls[0][0];
      // Should not contain ISO timestamp (e.g. 2026-02-18T21:04:55.808Z)
      expect(call).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should not include level when disabled', () => {
      const noLevelLogger = new DevToolsLogger({
        output: outputSpy,
        includeLevel: false,
      });
      noLevelLogger.info('test');
      const call = outputSpy.mock.calls[0][0];
      expect(call).not.toContain('[INFO]');
    });

    it('should use custom formatter', () => {
      const formatter = vi.fn((level, message) => `Custom: ${message}`);
      const customLogger = new DevToolsLogger({
        output: outputSpy,
        formatter,
      });
      customLogger.info('test');
      expect(formatter).toHaveBeenCalled();
      expect(outputSpy).toHaveBeenCalledWith('Custom: test', undefined);
    });
  });

  describe('data parameter', () => {
    it('should pass data to output', () => {
      const data = { key: 'value' };
      logger.info('test', data);
      expect(outputSpy).toHaveBeenCalledWith(
        expect.any(String),
        data
      );
    });

    it('should handle undefined data', () => {
      logger.info('test');
      expect(outputSpy).toHaveBeenCalledWith(
        expect.any(String),
        undefined
      );
    });

    it('should handle error objects', () => {
      const error = new Error('test error');
      logger.error('error occurred', error);
      expect(outputSpy).toHaveBeenCalledWith(
        expect.any(String),
        error
      );
    });
  });

  describe('warn and error special handling', () => {
    it('should use console.warn for warn messages with default output', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const defaultOutputLogger = new DevToolsLogger({
        level: LogLevel.WARN,
      });
      defaultOutputLogger.warn('warning');
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should use console.error for error messages with default output', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const defaultOutputLogger = new DevToolsLogger({
        level: LogLevel.ERROR,
      });
      defaultOutputLogger.error('error');
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should use custom output for warn when not default', () => {
      const customOutput = vi.fn();
      const customLogger = new DevToolsLogger({
        output: customOutput,
        level: LogLevel.WARN,
      });
      customLogger.warn('warning');
      expect(customOutput).toHaveBeenCalled();
    });

    it('should use custom output for error when not default', () => {
      const customOutput = vi.fn();
      const customLogger = new DevToolsLogger({
        output: customOutput,
        level: LogLevel.ERROR,
      });
      customLogger.error('error');
      expect(customOutput).toHaveBeenCalled();
    });
  });

  describe('createDevToolsLogger', () => {
    it('should create logger instance', () => {
      const createdLogger = createDevToolsLogger();
      expect(createdLogger).toBeInstanceOf(DevToolsLogger);
    });

    it('should create logger with options', () => {
      const createdLogger = createDevToolsLogger({
        level: LogLevel.DEBUG,
        enabled: false,
      });
      expect(createdLogger).toBeInstanceOf(DevToolsLogger);
      expect(createdLogger.isEnabled()).toBe(false);
    });
  });

  describe('defaultLogger', () => {
    it('should be a logger instance', () => {
      expect(defaultLogger).toBeInstanceOf(DevToolsLogger);
    });

    it('should be enabled by default', () => {
      expect(defaultLogger.isEnabled()).toBe(true);
    });
  });

  describe('LogLevel enum', () => {
    it('should have correct values', () => {
      expect(LogLevel.DEBUG).toBe(0);
      expect(LogLevel.INFO).toBe(1);
      expect(LogLevel.WARN).toBe(2);
      expect(LogLevel.ERROR).toBe(3);
      expect(LogLevel.NONE).toBe(4);
    });
  });
});
