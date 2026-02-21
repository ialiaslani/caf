import type { IUserRepository, User } from '../../../domain';
import {
  MockGetUsersHandler,
  MockGetUserByIdHandler,
  MockCreateUserHandler,
  MockUpdateUserHandler,
  MockDeleteUserHandler,
} from './MockUserApi';

/**
 * Mock repository implementation using IRequestHandler from @c-a-f/core
 * This demonstrates how to use the core's IRequestHandler interface
 * to create mock implementations that can be swapped with real API calls
 */
export class MockUserRepository implements IUserRepository {
  async getUsers(): Promise<User[]> {
    const handler = new MockGetUsersHandler();
    return await handler.execute();
  }

  async getUserById(id: string): Promise<User> {
    const handler = new MockGetUserByIdHandler(id);
    return await handler.execute();
  }

  async createUser(user: User): Promise<User> {
    const handler = new MockCreateUserHandler({
      name: user.name,
      email: user.email,
    });
    return await handler.execute();
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const handler = new MockUpdateUserHandler(id, user);
    return await handler.execute();
  }

  async deleteUser(id: string): Promise<void> {
    const handler = new MockDeleteUserHandler(id);
    return await handler.execute();
  }
}
