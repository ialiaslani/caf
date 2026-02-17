import { z } from 'zod';

/**
 * User validation schema using Zod
 * This schema validates user data before it's processed
 */
export const UserSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
});

/**
 * Schema for creating a user (without ID, as it will be generated)
 */
export const CreateUserSchema = UserSchema.omit({ id: true });

/**
 * Type inference from schema
 */
export type UserInput = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
