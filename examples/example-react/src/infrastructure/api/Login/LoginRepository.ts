import { type AxiosInstance } from 'axios';
import { ILoginRepository, Login } from '../../../domain';

export class LoginRepository implements ILoginRepository {
  constructor(private axios: AxiosInstance) {}

  async login(user: Login) {
    return this.axios.post('/simba/api/v1/user/login', user);
  }

  async logout() {
    // Mock logout - no actual API call needed
    return Promise.resolve({ success: true, message: 'Logged out successfully' });
  }
}
