import type { User } from './user.entities';

export type CreateUserInput = Omit<User, 'id'>;
