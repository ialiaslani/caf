/**
 * Yup adapter for @c-a-f/validation.
 * 
 * Provides a bridge between Yup schemas and CAF's IValidator interface.
 * 
 * @example
 * ```ts
 * import * as yup from 'yup';
 * import { YupValidator } from '@c-a-f/validation/yup';
 * 
 * const schema = yup.object({
 *   email: yup.string().email().required(),
 *   age: yup.number().min(18).required(),
 * });
 * 
 * const validator = new YupValidator(schema);
 * const result = await validator.validate({ email: 'test@example.com', age: 25 });
 * ```
 */

import type { IValidator, ValidationResult, ValidationError } from '../IValidator';

/**
 * Yup validator adapter.
 * Wraps a Yup schema to implement IValidator interface.
 */
export class YupValidator<T = unknown> implements IValidator<T> {
  constructor(
    private schema: {
      validate: (data: unknown, options?: { abortEarly?: boolean }) => Promise<T>;
      validateSync: (data: unknown, options?: { abortEarly?: boolean }) => T;
    }
  ) {}

  async validate(data: unknown): Promise<ValidationResult> {
    try {
      const validated = await this.schema.validate(data, { abortEarly: false });
      return {
        success: true,
        errors: [],
        data: validated as T,
      };
    } catch (error: any) {
      const errors: ValidationError[] = [];
      
      if (error.inner && Array.isArray(error.inner)) {
        // Yup validation errors
        error.inner.forEach((err: any) => {
          errors.push({
            path: err.path || '',
            message: err.message || 'Validation error',
          });
        });
      } else if (error.path) {
        // Single Yup error
        errors.push({
          path: error.path || '',
          message: error.message || 'Validation error',
        });
      } else {
        // Unknown error format
        errors.push({
          path: '',
          message: error.message || String(error),
        });
      }

      return {
        success: false,
        errors,
      };
    }
  }

  async parse(data: unknown): Promise<T> {
    return await this.schema.validate(data);
  }

  async isValid(data: unknown): Promise<boolean> {
    try {
      await this.schema.validate(data, { abortEarly: false });
      return true;
    } catch {
      return false;
    }
  }
}
