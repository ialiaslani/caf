import { describe, it, expect } from 'vitest';
import Joi from 'joi';
import { JoiValidator } from '../src/adapters/JoiAdapter';

describe('JoiValidator', () => {
  describe('validate', () => {
    it('should return success result when validation passes', async () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        age: Joi.number().min(18).required(),
      });
      const validator = new JoiValidator(schema);
      const result = await validator.validate({ email: 'test@example.com', age: 25 });

      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.data).toEqual({ email: 'test@example.com', age: 25 });
    });

    it('should return failure result with errors when validation fails', async () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        age: Joi.number().min(18).required(),
      });
      const validator = new JoiValidator(schema);
      const result = await validator.validate({ email: 'invalid', age: 15 });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      const paths = result.errors.map((e) => Array.isArray(e.path) ? e.path.join('.') : e.path);
      expect(paths.some((p) => p.includes('email'))).toBe(true);
      expect(paths.some((p) => p.includes('age'))).toBe(true);
    });

    it('should handle nested path errors', async () => {
      const schema = Joi.object({
        user: Joi.object({
          email: Joi.string().email().required(),
        }),
      });
      const validator = new JoiValidator(schema);
      const result = await validator.validate({ user: { email: 'invalid' } });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      const path = Array.isArray(result.errors[0].path) 
        ? result.errors[0].path.join('.') 
        : result.errors[0].path;
      expect(path).toContain('user');
      expect(path).toContain('email');
    });

    it('should handle array validation', async () => {
      const schema = Joi.object({
        items: Joi.array().items(Joi.string().min(3)).required(),
      });
      const validator = new JoiValidator(schema);
      const result = await validator.validate({ items: ['ab', 'cd'] });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should include error codes from joi', async () => {
      const schema = Joi.string().email().required();
      const validator = new JoiValidator(schema);
      const result = await validator.validate('invalid-email');

      expect(result.success).toBe(false);
      expect(result.errors[0].code).toBeDefined();
    });

    it('should handle optional fields', async () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        name: Joi.string().optional(),
      });
      const validator = new JoiValidator(schema);
      const result = await validator.validate({ email: 'test@example.com' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ email: 'test@example.com' });
    });

    it('should handle required field errors', async () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        name: Joi.string().required(),
      });
      const validator = new JoiValidator(schema);
      const result = await validator.validate({});

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('parse', () => {
    it('should return parsed data when validation passes', async () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        age: Joi.number().required(),
      });
      const validator = new JoiValidator(schema);
      const result = await validator.parse({ email: 'test@example.com', age: 25 });

      expect(result).toEqual({ email: 'test@example.com', age: 25 });
    });

    it('should throw error when validation fails', async () => {
      const schema = Joi.string().email().required();
      const validator = new JoiValidator(schema);

      await expect(validator.parse('invalid-email')).rejects.toThrow();
    });

    it('should include error messages in thrown error', async () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        age: Joi.number().min(18).required(),
      });
      const validator = new JoiValidator(schema);

      try {
        await validator.parse({ email: 'invalid', age: 15 });
      } catch (error: any) {
        expect(error.message).toBeDefined();
        expect(error.message.length).toBeGreaterThan(0);
      }
    });

    it('should transform data according to schema', async () => {
      const schema = Joi.object({
        age: Joi.string().custom((value) => parseInt(value, 10)),
      });
      const validator = new JoiValidator(schema);
      const result = await validator.parse({ age: '25' });

      expect(result.age).toBe(25);
    });
  });

  describe('isValid', () => {
    it('should return true when validation passes', async () => {
      const schema = Joi.string().email().required();
      const validator = new JoiValidator(schema);
      const result = await validator.isValid('test@example.com');

      expect(result).toBe(true);
    });

    it('should return false when validation fails', async () => {
      const schema = Joi.string().email().required();
      const validator = new JoiValidator(schema);
      const result = await validator.isValid('invalid-email');

      expect(result).toBe(false);
    });

    it('should handle complex schemas', async () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        age: Joi.number().min(18).max(100).required(),
        tags: Joi.array().items(Joi.string()).required(),
      });
      const validator = new JoiValidator(schema);
      
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
