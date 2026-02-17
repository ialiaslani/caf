import { AxiosInstance } from 'axios';
import { IUserRepository, User } from '../../../domain';

export class UserRepository implements IUserRepository {
  constructor(private axiosInstance: AxiosInstance) {}

  async getUsers(): Promise<User[]> {
    const response = await this.axiosInstance.get<User[]>('/api/users');
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.axiosInstance.get<User>(`/api/users/${id}`);
    return response.data;
  }

  async createUser(user: User): Promise<User> {
    const response = await this.axiosInstance.post<User>('/api/users', user);
    return response.data;
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const response = await this.axiosInstance.put<User>(`/api/users/${id}`, user);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.axiosInstance.delete(`/api/users/${id}`);
  }
}
