import { type AxiosInstance } from 'axios';
import { IUserRepository, User } from '@c.a.f/example-domain';

export class UserRepository implements IUserRepository {
  constructor(private axios: AxiosInstance) {}

  async getUsers(): Promise<User[]> {
    const response = await this.axios.get<User[]>('');
    return response.data;
  }

  async addUser(user: Omit<User, 'id'>): Promise<User> {
    const response = await this.axios.post<User>('', user);
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await this.axios.get<User>('' + id);
    return response.data;
  }
}
