import type { IValidator, ValidationResult, ValidationError } from './IValidator';

/**
 * Validation runner utility.
 * 
 * Provides helper functions for running validations and aggregating results.
 */
export class ValidationRunner {
  /**
   * Run validation and return result.
   * Handles both sync and async validators.
   */
  static async run<T>(
    validator: IValidator<T>,
    data: unknown
  ): Promise<ValidationResult> {
    const result = await validator.validate(data);
    return result;
  }

  /**
   * Run multiple validators and aggregate results.
   * Returns success only if all validators pass.
   */
  static async runAll(
    validators: Array<{ validator: IValidator; data: unknown }>
  ): Promise<ValidationResult> {
    const results = await Promise.all(
      validators.map(({ validator, data }) => validator.validate(data))
    );

    const allSuccess = results.every((r) => r.success);
    const allErrors = results.flatMap((r) => r.errors);

    return {
      success: allSuccess,
      errors: allErrors,
      data: allSuccess ? results.map((r) => r.data) : undefined,
    };
  }

  /**
   * Run validation and throw if invalid.
   * Returns validated data if successful.
   */
  static async runOrThrow<T>(
    validator: IValidator<T>,
    data: unknown
  ): Promise<T> {
    const result = await validator.validate(data);
    if (!result.success) {
      throw new ValidationErrorException(result.errors);
    }
    return result.data as T;
  }

  /**
   * Format validation errors as a flat array of messages.
   */
  static formatErrors(errors: ValidationError[]): string[] {
    return errors.map((error) => {
      const path = Array.isArray(error.path) ? error.path.join('.') : error.path;
      return path ? `${path}: ${error.message}` : error.message;
    });
  }

  /**
   * Format validation errors as a record (field -> message).
   */
  static formatErrorsAsRecord(errors: ValidationError[]): Record<string, string> {
    const record: Record<string, string> = {};
    errors.forEach((error) => {
      const path = Array.isArray(error.path) ? error.path.join('.') : error.path;
      if (path) {
        record[path] = error.message;
      }
    });
    return record;
  }
}

/**
 * Exception thrown when validation fails.
 */
export class ValidationErrorException extends Error {
  constructor(public readonly errors: ValidationError[]) {
    const messages = ValidationRunner.formatErrors(errors);
    super(`Validation failed: ${messages.join('; ')}`);
    this.name = 'ValidationErrorException';
  }
}
