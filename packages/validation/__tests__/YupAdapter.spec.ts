import { describe, it, expect } from 'vitest';
import * as yup from 'yup';
import { YupValidator } from '../src/adapters/YupAdapter';

describe('YupValidator', () => {
  describe('validate', () => {
    it('should return success result when validation passes', async () => {
      const schema = yup.object({
        email: yup.string().email().required(),
        age: yup.number().min(18).required(),
      });
      const validator = new YupValidator(schema);
      const result = await validator.validate({ email: 'test@example.com', age: 25 });

      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.data).toEqual({ email: 'test@example.com', age: 25 });
    });

    it('should return failure result with single error', async () => {
      const schema = yup.object({
        email: yup.string().email().required(),
      });
      const validator = new YupValidator(schema);
      const result = await validator.validate({ email: 'invalid' });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].path).toBe('email');
      expect(result.errors[0].message).toContain('email');
    });

    it('should return failure result with multiple errors', async () => {
      const schema = yup.object({
        email: yup.string().email().required(),
        age: yup.number().min(18).required(),
      });
      const validator = new YupValidator(schema);
      const result = await validator.validate({ email: 'invalid', age: -5 });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
      const paths = result.errors.map((e) => e.path);
      expect(paths).toContain('email');
      expect(paths).toContain('age');
    });

    it('should handle nested object validation', async () => {
      const schema = yup.object({
        user: yup.object({
          email: yup.string().email().required(),
        }),
      });
      const validator = new YupValidator(schema);
      const result = await validator.validate({ user: { email: 'invalid' } });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].path).toContain('user');
    });

    it('should handle array validation', async () => {
      const schema = yup.object({
        items: yup.array().of(yup.string().min(3)).required(),
      });
      const validator = new YupValidator(schema);
      const result = await validator.validate({ items: ['ab', 'cd'] });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle required field errors', async () => {
      const schema = yup.object({
        email: yup.string().email().required(),
        name: yup.string().required(),
      });
      const validator = new YupValidator(schema);
      const result = await validator.validate({});

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle optional fields', async () => {
      const schema = yup.object({
        email: yup.string().email().required(),
        name: yup.string().optional(),
      });
      const validator = new YupValidator(schema);
      const result = await validator.validate({ email: 'test@example.com' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ email: 'test@example.com' });
    });
  });

  describe('parse', () => {
    it('should return parsed data when validation passes', async () => {
      const schema = yup.object({
        email: yup.string().email().required(),
        age: yup.number().required(),
      });
      const validator = new YupValidator(schema);
      const result = await validator.parse({ email: 'test@example.com', age: 25 });

      expect(result).toEqual({ email: 'test@example.com', age: 25 });
    });

    it('should throw error when validation fails', async () => {
      const schema = yup.string().email().required();
      const validator = new YupValidator(schema);

      await expect(validator.parse('invalid-email')).rejects.toThrow();
    });

    it('should transform data according to schema', async () => {
      const schema = yup.object({
        name: yup.string().transform((value) => {
          return value ? value.trim().toUpperCase() : value;
        }),
      });
      const validator = new YupValidator(schema);
      const result = await validator.parse({ name: '  john  ' });

      expect(result.name).toBe('JOHN');
      expect(typeof result.name).toBe('string');
    });
  });

  describe('isValid', () => {
    it('should return true when validation passes', async () => {
      const schema = yup.string().email().required();
      const validator = new YupValidator(schema);
      const result = await validator.isValid('test@example.com');

      expect(result).toBe(true);
    });

    it('should return false when validation fails', async () => {
      const schema = yup.string().email().required();
      const validator = new YupValidator(schema);
      const result = await validator.isValid('invalid-email');

      expect(result).toBe(false);
    });

    it('should handle complex schemas', async () => {
      const schema = yup.object({
        email: yup.string().email().required(),
        age: yup.number().min(18).max(100).required(),
        tags: yup.array().of(yup.string()).required(),
      });
      const validator = new YupValidator(schema);
      
      const validResult = await validator.isValid({
        email: 'test@example.com',
        age: 25,
        tags: ['tag1', 'tag2'],
      });
      expect(validResult).toBe(true);

      const invalidResult = await validator.isValid({
        email: 'invalid',
        age: 15,
        tags: [],
      });
      expect(invalidResult).toBe(false);
    });
  });
});
