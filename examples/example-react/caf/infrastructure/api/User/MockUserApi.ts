import type { IRequestHandler } from '@c-a-f/core';
import type { User } from '../../../domain';

/**
 * Mock API handlers using IRequestHandler interface from @c-a-f/core
 * This allows swapping between real API and mock implementations
 */

// Mock data store
const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock handler for getting all users
 */
export class MockGetUsersHandler implements IRequestHandler<User[]> {
  async execute(): Promise<User[]> {
    await delay(800); // Simulate network delay
    return [...mockUsers];
  }
}

/**
 * Mock handler for getting a user by ID
 */
export class MockGetUserByIdHandler implements IRequestHandler<User> {
  constructor(private id: string) {}

  async execute(): Promise<User> {
    await delay(500);
    const user = mockUsers.find(u => u.id === this.id);
    if (!user) {
      throw new Error(`User with id ${this.id} not found`);
    }
    return user;
  }
}

/**
 * Mock handler for creating a user
 */
export class MockCreateUserHandler implements IRequestHandler<User> {
  constructor(private user: Omit<User, 'id'>) {}

  async execute(): Promise<User> {
    await delay(600);
    
    // Validate input
    if (!this.user.name || !this.user.email) {
      throw new Error('Name and email are required');
    }
    
    // Generate a unique ID based on current array length + timestamp to avoid collisions
    const newId = String(Date.now());
    const newUser: User = {
      id: newId,
      name: this.user.name.trim(),
      email: this.user.email.trim(),
    };
    
    // Add to mock data store
    mockUsers.push(newUser);
    
    // Return the created user
    return { ...newUser };
  }
}

/**
 * Mock handler for updating a user
 */
export class MockUpdateUserHandler implements IRequestHandler<User> {
  constructor(private id: string, private updates: Partial<User>) {}

  async execute(): Promise<User> {
    await delay(500);
    const index = mockUsers.findIndex(u => u.id === this.id);
    if (index === -1) {
      throw new Error(`User with id ${this.id} not found`);
    }
    mockUsers[index] = { ...mockUsers[index], ...this.updates };
    return mockUsers[index];
  }
}

/**
 * Mock handler for deleting a user
 */
export class MockDeleteUserHandler implements IRequestHandler<void> {
  constructor(private id: string) {}

  async execute(): Promise<void> {
    await delay(400);
    const index = mockUsers.findIndex(u => u.id === this.id);
    if (index === -1) {
      throw new Error(`User with id ${this.id} not found`);
    }
    mockUsers.splice(index, 1);
  }
}
