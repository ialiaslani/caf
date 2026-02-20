import type { User } from './user.entities';
import type { IUserRepository } from './user.irepository';

export class UserService {
  constructor(private repository: IUserRepository) {}

  async getUsers(): Promise<User[]> {
    return await this.repository.getUsers();
  }

  async getUserById(id: string): Promise<User> {
    return await this.repository.getUserById(id);
  }

  async createUser(user: User): Promise<User> {
    return await this.repository.createUser(user);
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    return await this.repository.updateUser(id, user);
  }

  async deleteUser(id: string): Promise<void> {
    return await this.repository.deleteUser(id);
  }
}
