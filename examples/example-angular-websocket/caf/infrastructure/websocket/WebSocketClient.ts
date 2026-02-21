import type { User } from '../../domain';

/**
 * Message types for the demo WebSocket protocol.
 * In production you'd use a real WebSocket URL and server.
 */
export type WSMessage =
  | { type: 'getUsers' }
  | { type: 'getUser'; id: string }
  | { type: 'createUser'; data: Omit<User, 'id'> }
  | { type: 'updateUser'; id: string; data: Partial<User> }
  | { type: 'deleteUser'; id: string };

export type WSResponse =
  | { type: 'users'; data: User[] }
  | { type: 'user'; data: User }
  | { type: 'usersUpdated'; data: User[] }
  | { type: 'error'; message: string };

/**
 * Client interface for WebSocket-based user API.
 * Mock implementation below simulates a server with in-memory store and optional real-time push.
 */
export interface IWebSocketClient {
  connect(): void;
  disconnect(): void;
  request<T extends WSResponse>(msg: WSMessage): Promise<T>;
  onUsersUpdated?(callback: (users: User[]) => void): () => void;
}
