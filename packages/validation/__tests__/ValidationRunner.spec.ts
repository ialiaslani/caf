import { describe, it, expect } from 'vitest';
import { ValidationRunner, ValidationErrorException } from '../src/ValidationRunner';
import type { IValidator, ValidationResult, ValidationError } from '../src/IValidator';

// Mock validator implementations for testing
class MockValidator<T> implements IValidator<T> {
  constructor(
    private shouldSucceed: boolean,
    private errors: ValidationError[] = [],
    private data?: T
  ) {}

  async validate(): Promise<ValidationResult> {
    if (this.shouldSucceed) {
      return {
        success: true,
        errors: [],
        data: this.data,
      };
    }
    return {
      success: false,
      errors: this.errors,
    };
  }

  async parse(data: unknown): Promise<T> {
    const result = await this.validate(data);
    if (!result.success) {
      throw new Error('Validation failed');
    }
    return result.data as T;
  }

  async isValid(): Promise<boolean> {
    return this.shouldSucceed;
  }
}

describe('ValidationRunner', () => {
  describe('run', () => {
    it('should return success result when validation passes', async () => {
      const validator = new MockValidator(true, [], { name: 'test' });
      const result = await ValidationRunner.run(validator, {});

      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.data).toEqual({ name: 'test' });
    });

    it('should return failure result when validation fails', async () => {
      const errors: ValidationError[] = [
        { path: 'email', message: 'Invalid email' },
      ];
      const validator = new MockValidator(false, errors);
      const result = await ValidationRunner.run(validator, {});

      expect(result.success).toBe(false);
      expect(result.errors).toEqual(errors);
      expect(result.data).toBeUndefined();
    });
  });

  describe('runAll', () => {
    it('should return success when all validators pass', async () => {
      const validators = [
        { validator: new MockValidator(true, [], 'data1'), data: {} },
        { validator: new MockValidator(true, [], 'data2'), data: {} },
        { validator: new MockValidator(true, [], 'data3'), data: {} },
      ];

      const result = await ValidationRunner.runAll(validators);

      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.data).toEqual(['data1', 'data2', 'data3']);
    });

    it('should return failure when any validator fails', async () => {
      const errors1: ValidationError[] = [{ path: 'field1', message: 'Error 1' }];
      const errors2: ValidationError[] = [{ path: 'field2', message: 'Error 2' }];

      const validators = [
        { validator: new MockValidator(false, errors1), data: {} },
        { validator: new MockValidator(true, [], 'data2'), data: {} },
        { validator: new MockValidator(false, errors2), data: {} },
      ];

      const result = await ValidationRunner.runAll(validators);

      expect(result.success).toBe(false);
      expect(result.errors).toEqual([...errors1, ...errors2]);
      expect(result.data).toBeUndefined();
    });

    it('should aggregate errors from multiple validators', async () => {
      const errors1: ValidationError[] = [
        { path: 'email', message: 'Invalid email' },
      ];
      const errors2: ValidationError[] = [
        { path: 'age', message: 'Age must be positive' },
      ];

      const validators = [
        { validator: new MockValidator(false, errors1), data: {} },
        { validator: new MockValidator(false, errors2), data: {} },
      ];

      const result = await ValidationRunner.runAll(validators);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toEqual([...errors1, ...errors2]);
    });
  });

  describe('runOrThrow', () => {
    it('should return data when validation passes', async () => {
      const validator = new MockValidator(true, [], { name: 'test' });
      const result = await ValidationRunner.runOrThrow(validator, {});

      expect(result).toEqual({ name: 'test' });
    });

    it('should throw ValidationErrorException when validation fails', async () => {
      const errors: ValidationError[] = [
        { path: 'email', message: 'Invalid email' },
      ];
      const validator = new MockValidator(false, errors);

      await expect(ValidationRunner.runOrThrow(validator, {})).rejects.toThrow(
        ValidationErrorException
      );

      try {
        await ValidationRunner.runOrThrow(validator, {});
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationErrorException);
        expect((error as ValidationErrorException).errors).toEqual(errors);
      }
    });
  });

  describe('formatErrors', () => {
    it('should format errors with string paths', () => {
      const errors: ValidationError[] = [
        { path: 'email', message: 'Invalid email' },
        { path: 'age', message: 'Age must be positive' },
      ];

      const formatted = ValidationRunner.formatErrors(errors);

      expect(formatted).toEqual([
        'email: Invalid email',
        'age: Age must be positive',
      ]);
    });

    it('should format errors with array paths', () => {
      const errors: ValidationError[] = [
        { path: ['user', 'email'], message: 'Invalid email' },
        { path: ['user', 'address', 'street'], message: 'Street is required' },
      ];

      const formatted = ValidationRunner.formatErrors(errors);

      expect(formatted).toEqual([
        'user.email: Invalid email',
        'user.address.street: Street is required',
      ]);
    });

    it('should format errors without paths', () => {
      const errors: ValidationError[] = [
        { path: '', message: 'General error' },
      ];

      const formatted = ValidationRunner.formatErrors(errors);

      expect(formatted).toEqual(['General error']);
    });
  });

  describe('formatErrorsAsRecord', () => {
    it('should format errors as record with string paths', () => {
      const errors: ValidationError[] = [
        { path: 'email', message: 'Invalid email' },
        { path: 'age', message: 'Age must be positive' },
      ];

      const record = ValidationRunner.formatErrorsAsRecord(errors);

      expect(record).toEqual({
        email: 'Invalid email',
        age: 'Age must be positive',
      });
    });

    it('should format errors as record with array paths', () => {
      const errors: ValidationError[] = [
        { path: ['user', 'email'], message: 'Invalid email' },
        { path: ['user', 'age'], message: 'Age must be positive' },
      ];

      const record = ValidationRunner.formatErrorsAsRecord(errors);

      expect(record).toEqual({
        'user.email': 'Invalid email',
        'user.age': 'Age must be positive',
      });
    });

    it('should ignore errors without paths', () => {
      const errors: ValidationError[] = [
        { path: '', message: 'General error' },
        { path: 'email', message: 'Invalid email' },
      ];

      const record = ValidationRunner.formatErrorsAsRecord(errors);

      expect(record).toEqual({
        email: 'Invalid email',
      });
    });

    it('should return empty record for empty errors', () => {
      const record = ValidationRunner.formatErrorsAsRecord([]);

      expect(record).toEqual({});
    });
  });
});

describe('ValidationErrorException', () => {
  it('should create exception with errors', () => {
    const errors: ValidationError[] = [
      { path: 'email', message: 'Invalid email' },
      { path: 'age', message: 'Age must be positive' },
    ];

    const exception = new ValidationErrorException(errors);

    expect(exception.errors).toEqual(errors);
    expect(exception.name).toBe('ValidationErrorException');
    expect(exception.message).toContain('Validation failed');
    expect(exception.message).toContain('Invalid email');
    expect(exception.message).toContain('Age must be positive');
  });

  it('should format error message correctly', () => {
    const errors: ValidationError[] = [
      { path: 'field1', message: 'Error 1' },
    ];

    const exception = new ValidationErrorException(errors);

    expect(exception.message).toBe('Validation failed: field1: Error 1');
  });
});
