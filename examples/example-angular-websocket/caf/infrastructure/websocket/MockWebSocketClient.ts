import type { User } from '../../domain';
import type { IWebSocketClient, WSMessage, WSResponse } from './WebSocketClient';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Mock WebSocket client: in-memory user store, request/response, and optional push (usersUpdated).
 * Demonstrates real-time updates: after createUser we push usersUpdated so the Ploc can react.
 */
export class MockWebSocketClient implements IWebSocketClient {
  private users: User[] = [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' },
  ];
  private listeners: ((users: User[]) => void)[] = [];
  private connected = false;

  connect(): void {
    this.connected = true;
  }

  disconnect(): void {
    this.connected = false;
    this.listeners = [];
  }

  request<T extends WSResponse>(msg: WSMessage): Promise<T> {
    if (!this.connected) {
      return Promise.reject(new Error('WebSocket not connected'));
    }
    return this.handleMessage(msg) as Promise<T>;
  }

  private async handleMessage(msg: WSMessage): Promise<WSResponse> {
    await delay(300);
    switch (msg.type) {
      case 'getUsers':
        return { type: 'users', data: [...this.users] };
      case 'getUser': {
        const user = this.users.find((u) => u.id === msg.id);
        if (!user) return { type: 'error', message: `User not found: ${msg.id}` };
        return { type: 'user', data: user };
      }
      case 'createUser': {
        const newUser: User = {
          id: String(Date.now()),
          name: msg.data.name.trim(),
          email: msg.data.email.trim(),
        };
        this.users.push(newUser);
        this.notifyUsersUpdated();
        return { type: 'user', data: newUser };
      }
      case 'updateUser': {
        const i = this.users.findIndex((u) => u.id === msg.id);
        if (i === -1) return { type: 'error', message: `User not found: ${msg.id}` };
        this.users[i] = { ...this.users[i], ...msg.data };
        this.notifyUsersUpdated();
        return { type: 'user', data: this.users[i] };
      }
      case 'deleteUser': {
        const i = this.users.findIndex((u) => u.id === msg.id);
        if (i === -1) return { type: 'error', message: `User not found: ${msg.id}` };
        this.users.splice(i, 1);
        this.notifyUsersUpdated();
        return { type: 'user', data: null! as User };
      }
      default:
        return { type: 'error', message: 'Unknown message type' };
    }
  }

  private notifyUsersUpdated(): void {
    const snapshot = [...this.users];
    this.listeners.forEach((cb) => cb(snapshot));
  }

  onUsersUpdated(callback: (users: User[]) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }
}
