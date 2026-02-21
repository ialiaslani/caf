import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
});

export const CreateUserSchema = UserSchema.omit({ id: true });
export type CreateUserSchemaType = z.infer<typeof CreateUserSchema>;
