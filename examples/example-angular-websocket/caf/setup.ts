import { ZodValidator } from '@c-a-f/validation/zod';
import { UserService } from './domain';
import { GetUsers, CreateUser, UserPloc } from './application';
import { MockWebSocketClient } from './infrastructure/websocket/MockWebSocketClient';
import { UserWebSocketRepository } from './infrastructure/websocket/UserWebSocketRepository';
import { CreateUserSchema } from './infrastructure/validation';

export function setupUserPloc(): {
  ploc: UserPloc;
  createUserUseCase: CreateUser;
  disconnect: () => void;
} {
  const client = new MockWebSocketClient();
  client.connect();
  const userRepository = new UserWebSocketRepository(client);
  const userService = new UserService(userRepository);
  const createUserValidator = new ZodValidator(CreateUserSchema);
  const getUsersUseCase = new GetUsers(userService);
  const createUserUseCase = new CreateUser(createUserValidator, userService);
  const ploc = new UserPloc(getUsersUseCase, createUserUseCase);

  // Real-time updates: when server pushes usersUpdated, update Ploc state
  const unsub = client.onUsersUpdated?.((users) => {
    ploc.changeState({
      ...ploc.state,
      users,
    });
  });

  return {
    ploc,
    createUserUseCase,
    disconnect: () => {
      unsub?.();
      client.disconnect();
    },
  };
}
