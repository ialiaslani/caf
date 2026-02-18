import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { ZodValidator } from '../src/adapters/ZodAdapter';

describe('ZodValidator', () => {
  describe('validate', () => {
    it('should return success result when validation passes', async () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });
      const validator = new ZodValidator(schema);
      const result = await validator.validate({ email: 'test@example.com', age: 25 });

      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.data).toEqual({ email: 'test@example.com', age: 25 });
    });

    it('should return failure result with errors when validation fails', async () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });
      const validator = new ZodValidator(schema);
      const result = await validator.validate({ email: 'invalid', age: 15 });

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].path).toContain('email');
      expect(result.errors[0].message).toContain('email');
      expect(result.errors[1].path).toContain('age');
      expect(result.errors[1].message).toContain('18');
    });

    it('should handle nested path errors', async () => {
      const schema = z.object({
        user: z.object({
          email: z.string().email(),
        }),
      });
      const validator = new ZodValidator(schema);
      const result = await validator.validate({ user: { email: 'invalid' } });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].path).toContain('user');
      expect(result.errors[0].path).toContain('email');
    });

    it('should handle array validation', async () => {
      const schema = z.object({
        items: z.array(z.string().min(3)),
      });
      const validator = new ZodValidator(schema);
      const result = await validator.validate({ items: ['ab', 'cd'] });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle optional fields', async () => {
      const schema = z.object({
        email: z.string().email(),
        name: z.string().optional(),
      });
      const validator = new ZodValidator(schema);
      const result = await validator.validate({ email: 'test@example.com' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ email: 'test@example.com' });
    });

    it('should include error codes from zod', async () => {
      const schema = z.string().email();
      const validator = new ZodValidator(schema);
      const result = await validator.validate('invalid-email');

      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBeDefined();
    });
  });

  describe('parse', () => {
    it('should return parsed data when validation passes', async () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number(),
      });
      const validator = new ZodValidator(schema);
      const result = await validator.parse({ email: 'test@example.com', age: 25 });

      expect(result).toEqual({ email: 'test@example.com', age: 25 });
    });

    it('should throw error when validation fails', async () => {
      const schema = z.string().email();
      const validator = new ZodValidator(schema);

      await expect(validator.parse('invalid-email')).rejects.toThrow();
    });

    it('should transform data according to schema', async () => {
      const schema = z.object({
        age: z.string().transform((val) => parseInt(val, 10)),
      });
      const validator = new ZodValidator(schema);
      const result = await validator.parse({ age: '25' });

      expect(result.age).toBe(25);
      expect(typeof result.age).toBe('number');
    });
  });

  describe('isValid', () => {
    it('should return true when validation passes', async () => {
      const schema = z.string().email();
      const validator = new ZodValidator(schema);
      const result = await validator.isValid('test@example.com');

      expect(result).toBe(true);
    });

    it('should return false when validation fails', async () => {
      const schema = z.string().email();
      const validator = new ZodValidator(schema);
      const result = await validator.isValid('invalid-email');

      expect(result).toBe(false);
    });

    it('should handle complex schemas', async () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18).max(100),
        tags: z.array(z.string()),
      });
      const validator = new ZodValidator(schema);
      
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
