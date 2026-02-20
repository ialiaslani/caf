import type { UseCase } from '@c.a.f/core';
import type { User } from './domain';
import type { CreateUserInput } from './domain/User/user.validation';
import { ZodValidator } from '@c.a.f/validation/zod';
import { UserService } from './domain';
import { GetUsers, CreateUser, UserPloc } from './application';
import { UserGraphQLRepository, createGraphQLClient } from './infrastructure/graphql';
import { CreateUserSchema } from './infrastructure/validation';

export interface SetupResult {
  userPloc: UserPloc;
  createUserUseCase: UseCase<[CreateUserInput], User>;
}

/**
 * Setup UserPloc and CreateUser use case with a single GraphQL client/repository
 * so that adding a user and loading the list use the same data source.
 */
export function setupUserPloc(graphqlEndpoint?: string): UserPloc;

export function setupUserPloc(
  graphqlEndpoint?: string,
  options?: { withUseCase: true }
): SetupResult;

export function setupUserPloc(
  graphqlEndpoint?: string,
  options?: { withUseCase: true }
): UserPloc | SetupResult {
  const client = createGraphQLClient(graphqlEndpoint);
  const userRepository = new UserGraphQLRepository(client);
  const userService = new UserService(userRepository);
  const createUserValidator = new ZodValidator(CreateUserSchema);
  const getUsersUseCase = new GetUsers(userService);
  const createUserUseCase = new CreateUser(createUserValidator, userService);
  const userPloc = new UserPloc(getUsersUseCase, createUserUseCase);

  if (options?.withUseCase) {
    return { userPloc, createUserUseCase };
  }
  return userPloc;
}
