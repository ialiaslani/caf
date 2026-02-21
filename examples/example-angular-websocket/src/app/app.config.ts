import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideCAF } from '@c.a.f/infrastructure-angular';
import { setupUserPloc } from '../../caf/setup';
import { CreateUser } from '../../caf/application';
import { UserService } from '../../caf/domain';
import { UserWebSocketRepository } from '../../caf/infrastructure/websocket/UserWebSocketRepository';
import { MockWebSocketClient } from '../../caf/infrastructure/websocket/MockWebSocketClient';
import { ZodValidator } from '@c.a.f/validation/zod';
import { CreateUserSchema } from '../../caf/infrastructure/validation';
import { routes } from './app.routes';

const { ploc } = setupUserPloc();
const createUserUseCase = (() => {
  const client = new MockWebSocketClient();
  client.connect();
  const repo = new UserWebSocketRepository(client);
  const userService = new UserService(repo);
  const validator = new ZodValidator(CreateUserSchema);
  return new CreateUser(validator, userService);
})();

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes),
    provideCAF({ plocs: { user: ploc }, useCases: { createUser: createUserUseCase } }),
  ],
};
