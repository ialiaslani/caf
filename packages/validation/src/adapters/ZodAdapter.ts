/**
 * Zod adapter for @c.a.f/validation.
 * 
 * Provides a bridge between Zod schemas and CAF's IValidator interface.
 * 
 * @example
 * ```ts
 * import { z } from 'zod';
 * import { ZodValidator } from '@c.a.f/validation/zod';
 * 
 * const schema = z.object({
 *   email: z.string().email(),
 *   age: z.number().min(18),
 * });
 * 
 * const validator = new ZodValidator(schema);
 * const result = await validator.validate({ email: 'test@example.com', age: 25 });
 * ```
 */

import type { IValidator, ValidationResult, ValidationError } from '../IValidator';

/**
 * Zod validator adapter.
 * Wraps a Zod schema to implement IValidator interface.
 */
export class ZodValidator<T = unknown> implements IValidator<T> {
  constructor(private schema: { parse: (data: unknown) => T; safeParse: (data: unknown) => { success: boolean; error?: { issues: Array<{ path: (string | number)[]; message: string; code?: string }> } } }) {}

  async validate(data: unknown): Promise<ValidationResult> {
    const result = this.schema.safeParse(data);
    
    if (result.success) {
      return {
        success: true,
        errors: [],
        data: result.data as T,
      };
    }

    const errors: ValidationError[] = (result.error?.issues || []).map((issue) => ({
      path: issue.path.map(String),
      message: issue.message,
      code: issue.code,
    }));

    return {
      success: false,
      errors,
    };
  }

  async parse(data: unknown): Promise<T> {
    return this.schema.parse(data);
  }

  async isValid(data: unknown): Promise<boolean> {
    const result = this.schema.safeParse(data);
    return result.success;
  }
}
