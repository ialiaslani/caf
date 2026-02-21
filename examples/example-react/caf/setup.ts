import { ZodValidator } from '@c-a-f/validation/zod';
import { UserService } from './domain';
import { GetUsers, CreateUser, UserPloc } from './application';
import { MockUserRepository } from './infrastructure/api/User/MockUserRepository';
import { CreateUserSchema } from './infrastructure/validation';

/**
 * Setup function to initialize the application with mock dependencies
 * This demonstrates dependency injection using @c-a-f/core patterns
 */
export function setupUserPloc(): UserPloc {
  // Create mock repository
  const userRepository = new MockUserRepository();

  // Create domain service
  const userService = new UserService(userRepository);

  // Create validator (infrastructure: Zod) and use cases
  const createUserValidator = new ZodValidator(CreateUserSchema);
  const getUsersUseCase = new GetUsers(userService);
  const createUserUseCase = new CreateUser(createUserValidator, userService);
  
  // Create Ploc (Presentation Logic Container)
  const userPloc = new UserPloc(getUsersUseCase, createUserUseCase);
  
  return userPloc;
}
