/**
 * Joi adapter for @caf/validation.
 * 
 * Provides a bridge between Joi schemas and CAF's IValidator interface.
 * 
 * @example
 * ```ts
 * import Joi from 'joi';
 * import { JoiValidator } from '@caf/validation/joi';
 * 
 * const schema = Joi.object({
 *   email: Joi.string().email().required(),
 *   age: Joi.number().min(18).required(),
 * });
 * 
 * const validator = new JoiValidator(schema);
 * const result = await validator.validate({ email: 'test@example.com', age: 25 });
 * ```
 */

import type { IValidator, ValidationResult, ValidationError } from '../IValidator';

/**
 * Joi validator adapter.
 * Wraps a Joi schema to implement IValidator interface.
 */
export class JoiValidator<T = unknown> implements IValidator<T> {
  constructor(
    private schema: {
      validate: (data: unknown, options?: { abortEarly?: boolean }) => Promise<{ value: T; error?: { details: Array<{ path: (string | number)[]; message: string; type?: string }> } }>;
      validateSync: (data: unknown, options?: { abortEarly?: boolean }) => { value: T; error?: { details: Array<{ path: (string | number)[]; message: string; type?: string }> } };
    }
  ) {}

  async validate(data: unknown): Promise<ValidationResult> {
    try {
      const result = await this.schema.validate(data, { abortEarly: false });
      
      if (result.error) {
        const errors: ValidationError[] = result.error.details.map((detail) => ({
          path: detail.path.map(String),
          message: detail.message,
          code: detail.type,
        }));

        return {
          success: false,
          errors,
        };
      }

      return {
        success: true,
        errors: [],
        data: result.value as T,
      };
    } catch (error: any) {
      // Fallback for unexpected errors
      return {
        success: false,
        errors: [
          {
            path: '',
            message: error.message || String(error),
            code: error.name,
          },
        ],
      };
    }
  }

  async parse(data: unknown): Promise<T> {
    const result = await this.schema.validate(data);
    if (result.error) {
      throw new Error(result.error.message || 'Validation failed');
    }
    return result.value as T;
  }

  async isValid(data: unknown): Promise<boolean> {
    try {
      const result = await this.schema.validate(data, { abortEarly: false });
      return !result.error;
    } catch {
      return false;
    }
  }
}
