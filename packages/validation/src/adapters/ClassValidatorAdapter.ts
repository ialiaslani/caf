/**
 * class-validator adapter for @c.a.f/validation.
 * 
 * Provides a bridge between class-validator decorators and CAF's IValidator interface.
 * 
 * @example
 * ```ts
 * import { validate, IsString, IsEmail, IsNumber, Min } from 'class-validator';
 * import { ClassValidatorAdapter } from '@c.a.f/validation/class-validator';
 * 
 * class UserDto {
 *   @IsString()
 *   @IsEmail()
 *   email!: string;
 * 
 *   @IsNumber()
 *   @Min(18)
 *   age!: number;
 * }
 * 
 * const validator = new ClassValidatorAdapter(UserDto);
 * const result = await validator.validate({ email: 'test@example.com', age: 25 });
 * ```
 */

import type { IValidator, ValidationResult, ValidationError } from '../IValidator';

/**
 * class-validator adapter.
 * Uses class-validator's validate function to implement IValidator interface.
 */
export class ClassValidatorAdapter<T = unknown> implements IValidator<T> {
  constructor(
    private targetClass: new () => T,
    private validateFn: (object: object) => Promise<Array<{ property: string; constraints?: Record<string, string>; value?: unknown }>>
  ) {}

  async validate(data: unknown): Promise<ValidationResult> {
    try {
      // Create instance of the target class and copy data
      const instance = new this.targetClass();
      Object.assign(instance, data);

      // Validate using class-validator
      const errors = await this.validateFn(instance);

      if (errors.length === 0) {
        return {
          success: true,
          errors: [],
          data: instance as T,
        };
      }

      // Convert class-validator errors to CAF ValidationError format
      const validationErrors: ValidationError[] = errors.map((error) => {
        const messages = error.constraints
          ? Object.values(error.constraints)
          : ['Validation failed'];

        return {
          path: error.property,
          message: messages.join(', '),
          code: error.property,
        };
      });

      return {
        success: false,
        errors: validationErrors,
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
    const result = await this.validate(data);
    if (!result.success) {
      const errorMessages = result.errors.map((e) => e.message).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }
    return result.data as T;
  }

  async isValid(data: unknown): Promise<boolean> {
    const result = await this.validate(data);
    return result.success;
  }
}

/**
 * Factory function to create a ClassValidatorAdapter with the validate function.
 * This allows for better type inference and easier usage.
 * 
 * @example
 * ```ts
 * import { validate } from 'class-validator';
 * import { createClassValidator } from '@c.a.f/validation/class-validator';
 * 
 * class UserDto {
 *   @IsEmail()
 *   email!: string;
 * }
 * 
 * const validator = createClassValidator(UserDto, validate);
 * ```
 */
export function createClassValidator<T>(
  targetClass: new () => T,
  validateFn: (object: object) => Promise<Array<{ property: string; constraints?: Record<string, string>; value?: unknown }>>
): ClassValidatorAdapter<T> {
  return new ClassValidatorAdapter(targetClass, validateFn);
}
