import { describe, it, expect } from 'vitest';
import { ClassValidatorAdapter, createClassValidator } from '../src/adapters/ClassValidatorAdapter';

/**
 * ClassValidatorAdapter tests.
 * 
 * These tests mock the class-validator validate function to avoid decorator metadata issues
 * with vitest/esbuild transformer. The adapter works correctly in production environments
 * where TypeScript compiles with proper decorator metadata support.
 */

// Mock DTO class (without decorators to avoid metadata issues)
class TestDto {
  email!: string;
  age!: number;
}

class OptionalFieldDto {
  email!: string;
  name?: string;
}

// Mock validation function that simulates class-validator behavior
const createMockValidate = (
  shouldSucceed: boolean,
  errors: Array<{ property: string; constraints?: Record<string, string>; value?: unknown }> = []
) => {
  return async (object: object): Promise<Array<{ property: string; constraints?: Record<string, string>; value?: unknown }>> => {
    if (!shouldSucceed) {
      return errors;
    }
    return [];
  };
};

describe('ClassValidatorAdapter', () => {
  describe('validate', () => {
    it('should return success result when validation passes', async () => {
      const validateFn = createMockValidate(true);
      const validator = new ClassValidatorAdapter(TestDto, validateFn);
      const result = await validator.validate({ email: 'test@example.com', age: 25 });

      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.data).toBeDefined();
      expect((result.data as TestDto).email).toBe('test@example.com');
      expect((result.data as TestDto).age).toBe(25);
    });

    it('should return failure result with single error', async () => {
      const errors = [
        {
          property: 'email',
          constraints: { isEmail: 'email must be an email' },
        },
      ];
      const validateFn = createMockValidate(false, errors);
      const validator = new ClassValidatorAdapter(TestDto, validateFn);
      const result = await validator.validate({ email: 'invalid', age: 25 });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].path).toBe('email');
      expect(result.errors[0].message).toContain('email');
    });

    it('should return failure result with multiple constraint errors', async () => {
      const errors = [
        {
          property: 'email',
          constraints: {
            isEmail: 'email must be an email',
            isNotEmpty: 'email should not be empty',
          },
        },
      ];
      const validateFn = createMockValidate(false, errors);
      const validator = new ClassValidatorAdapter(TestDto, validateFn);
      const result = await validator.validate({ email: '', age: 25 });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      const emailErrors = result.errors.filter((e) => e.path === 'email');
      expect(emailErrors.length).toBeGreaterThan(0);
    });

    it('should return failure result with multiple property errors', async () => {
      const errors = [
        {
          property: 'email',
          constraints: { isEmail: 'email must be an email' },
        },
        {
          property: 'age',
          constraints: { min: 'age must be at least 18' },
        },
      ];
      const validateFn = createMockValidate(false, errors);
      const validator = new ClassValidatorAdapter(TestDto, validateFn);
      const result = await validator.validate({ email: 'invalid', age: 15 });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      const paths = result.errors.map((e) => e.path);
      expect(paths).toContain('email');
      expect(paths).toContain('age');
    });

    it('should handle optional fields', async () => {
      const validateFn = createMockValidate(true);
      const validator = new ClassValidatorAdapter(OptionalFieldDto, validateFn);
      const result = await validator.validate({ email: 'test@example.com' });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect((result.data as OptionalFieldDto).email).toBe('test@example.com');
    });

    it('should handle errors without constraints', async () => {
      const errors = [
        {
          property: 'email',
        },
      ];
      const validateFn = createMockValidate(false, errors);
      const validator = new ClassValidatorAdapter(TestDto, validateFn);
      const result = await validator.validate({ email: 'test', age: 25 });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toBe('Validation failed');
    });

    it('should handle unexpected errors gracefully', async () => {
      const validateFn = async () => {
        throw new Error('Unexpected error');
      };
      const validator = new ClassValidatorAdapter(TestDto, validateFn);
      const result = await validator.validate({ email: 'test@example.com', age: 25 });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Unexpected error');
    });
  });

  describe('parse', () => {
    it('should return parsed data when validation passes', async () => {
      const validateFn = createMockValidate(true);
      const validator = new ClassValidatorAdapter(TestDto, validateFn);
      const result = await validator.parse({ email: 'test@example.com', age: 25 });

      expect(result).toBeDefined();
      expect((result as TestDto).email).toBe('test@example.com');
      expect((result as TestDto).age).toBe(25);
    });

    it('should throw error when validation fails', async () => {
      const errors = [
        {
          property: 'email',
          constraints: { isEmail: 'email must be an email' },
        },
      ];
      const validateFn = createMockValidate(false, errors);
      const validator = new ClassValidatorAdapter(TestDto, validateFn);

      await expect(validator.parse({ email: 'invalid', age: 25 })).rejects.toThrow();
    });

    it('should include error messages in thrown error', async () => {
      const errors = [
        {
          property: 'email',
          constraints: { isEmail: 'email must be an email' },
        },
        {
          property: 'age',
          constraints: { min: 'age must be at least 18' },
        },
      ];
      const validateFn = createMockValidate(false, errors);
      const validator = new ClassValidatorAdapter(TestDto, validateFn);

      try {
        await validator.parse({ email: 'invalid', age: 15 });
      } catch (error: any) {
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(0);
        expect(error.message).toContain('email must be an email');
        expect(error.message).toContain('age must be at least 18');
      }
    });
  });

  describe('isValid', () => {
    it('should return true when validation passes', async () => {
      const validateFn = createMockValidate(true);
      const validator = new ClassValidatorAdapter(TestDto, validateFn);
      const result = await validator.isValid({ email: 'test@example.com', age: 25 });

      expect(result).toBe(true);
    });

    it('should return false when validation fails', async () => {
      const errors = [
        {
          property: 'email',
          constraints: { isEmail: 'email must be an email' },
        },
      ];
      const validateFn = createMockValidate(false, errors);
      const validator = new ClassValidatorAdapter(TestDto, validateFn);
      const result = await validator.isValid({ email: 'invalid', age: 25 });

      expect(result).toBe(false);
    });

    it('should handle complex validation scenarios', async () => {
      // Create a validator that validates based on data
      const validateFn = async (object: any): Promise<Array<{ property: string; constraints?: Record<string, string>; value?: unknown }>> => {
        const errors: Array<{ property: string; constraints?: Record<string, string>; value?: unknown }> = [];
        
        if (object.email === 'invalid') {
          errors.push({
            property: 'email',
            constraints: { isEmail: 'email must be an email' },
          });
        }
        
        if (object.age === 15) {
          errors.push({
            property: 'age',
            constraints: { min: 'age must be at least 18' },
          });
        }
        
        return errors;
      };
      
      const validator = new ClassValidatorAdapter(TestDto, validateFn);
      
      const validResult = await validator.isValid({
        email: 'test@example.com',
        age: 25,
      });
      expect(validResult).toBe(true);

      const invalidResult = await validator.isValid({
        email: 'invalid',
        age: 15,
      });
      expect(invalidResult).toBe(false);
    });
  });
});

describe('createClassValidator', () => {
  it('should create ClassValidatorAdapter instance', () => {
    const validateFn = createMockValidate(true);
    const validator = createClassValidator(TestDto, validateFn);

    expect(validator).toBeInstanceOf(ClassValidatorAdapter);
  });

  it('should work with created validator', async () => {
    const validateFn = createMockValidate(true);
    const validator = createClassValidator(TestDto, validateFn);
    const result = await validator.validate({ email: 'test@example.com', age: 25 });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should handle validation errors correctly', async () => {
    const errors = [
      {
        property: 'email',
        constraints: { isEmail: 'email must be an email' },
      },
    ];
    const validateFn = createMockValidate(false, errors);
    const validator = createClassValidator(TestDto, validateFn);
    const result = await validator.validate({ email: 'invalid', age: 15 });

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
