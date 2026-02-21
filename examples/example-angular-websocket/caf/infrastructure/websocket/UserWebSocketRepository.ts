import type { IUserRepository, User } from '../../domain';
import type { IWebSocketClient } from './WebSocketClient';

/**
 * UserWebSocketRepository implements IUserRepository over a WebSocket client.
 * Same domain/application as the REST and GraphQL examples; only infrastructure differs.
 * Real-time: subscribe via client.onUsersUpdated to push new user lists to the Ploc.
 */
export class UserWebSocketRepository implements IUserRepository {
  constructor(private client: IWebSocketClient) {}

  async getUsers(): Promise<User[]> {
    const res = await this.client.request<{ type: 'users'; data: User[] } | { type: 'error'; message: string }>({
      type: 'getUsers',
    });
    if (res.type === 'error') throw new Error(res.message);
    return res.data ?? [];
  }

  async getUserById(id: string): Promise<User> {
    const res = await this.client.request<{ type: 'user'; data: User } | { type: 'error'; message: string }>({
      type: 'getUser',
      id,
    });
    if (res.type === 'error') throw new Error(res.message);
    if (!res.data) throw new Error(`User not found: ${id}`);
    return res.data;
  }

  async createUser(user: User): Promise<User> {
    const res = await this.client.request<{ type: 'user'; data: User } | { type: 'error'; message: string }>({
      type: 'createUser',
      data: { name: user.name, email: user.email },
    });
    if (res.type === 'error') throw new Error(res.message);
    return res.data;
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const res = await this.client.request<{ type: 'user'; data: User } | { type: 'error'; message: string }>({
      type: 'updateUser',
      id,
      data: user,
    });
    if (res.type === 'error') throw new Error(res.message);
    return res.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.client.request({ type: 'deleteUser', id });
  }
}
