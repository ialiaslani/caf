/**
 * Test helpers for Validation.
 * 
 * Provides utilities for testing validators and validation runners.
 * 
 * @example
 * ```ts
 * import { createMockValidator, createValidationTester } from '@c-a-f/testing/validation';
 * import { ValidationRunner } from '@c-a-f/validation';
 * 
 * const mockValidator = createMockValidator((data) => {
 *   return data.email && data.email.includes('@');
 * });
 * const tester = createValidationTester(mockValidator);
 * 
 * const result = await tester.validate({ email: 'test@example.com' });
 * expect(result.success).toBe(true);
 * ```
 */

import type { IValidator, ValidationResult, ValidationError } from '@c-a-f/validation';

/**
 * Mock Validator implementation for testing.
 */
export class MockValidator<T = unknown> implements IValidator<T> {
  constructor(
    private validateFn: (data: unknown) => boolean | Promise<boolean>,
    private errorMessage?: string
  ) {}

  async validate(data: unknown): Promise<ValidationResult> {
    const isValid = await this.validateFn(data);
    
    if (isValid) {
      return {
        success: true,
        errors: [],
        data: data as T,
      };
    }

    return {
      success: false,
      errors: [
        {
          path: '',
          message: this.errorMessage || 'Validation failed',
        },
      ],
    };
  }

  async parse(data: unknown): Promise<T> {
    const result = await this.validate(data);
    if (!result.success) {
      throw new Error(result.errors.map(e => e.message).join(', '));
    }
    return result.data as T;
  }

  async isValid(data: unknown): Promise<boolean> {
    return await this.validateFn(data);
  }
}

/**
 * Create a mock Validator.
 */
export function createMockValidator<T = unknown>(
  validateFn: (data: unknown) => boolean | Promise<boolean>,
  errorMessage?: string
): IValidator<T> {
  return new MockValidator<T>(validateFn, errorMessage);
}

/**
 * Validation tester utility.
 */
export class ValidationTester<T = unknown> {
  constructor(public readonly validator: IValidator<T>) {}

  /**
   * Validate data.
   */
  async validate(data: unknown): Promise<ValidationResult> {
    return await this.validator.validate(data);
  }

  /**
   * Parse and validate data.
   */
  async parse(data: unknown): Promise<T> {
    return await this.validator.parse(data);
  }

  /**
   * Check if data is valid.
   */
  async isValid(data: unknown): Promise<boolean> {
    return await this.validator.isValid(data);
  }

  /**
   * Validate and expect success.
   */
  async expectSuccess(data: unknown): Promise<T> {
    const result = await this.validate(data);
    if (!result.success) {
      throw new Error(`Expected validation success but got errors: ${result.errors.map(e => e.message).join(', ')}`);
    }
    return result.data as T;
  }

  /**
   * Validate and expect failure.
   */
  async expectFailure(data: unknown): Promise<ValidationError[]> {
    const result = await this.validate(data);
    if (result.success) {
      throw new Error('Expected validation failure but validation succeeded');
    }
    return result.errors;
  }
}

/**
 * Create a Validation tester instance.
 */
export function createValidationTester<T = unknown>(validator: IValidator<T>): ValidationTester<T> {
  return new ValidationTester(validator);
}
