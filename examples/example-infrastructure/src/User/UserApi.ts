import Axios from 'axios';
import { UserRepository } from './UserRepository';
import { GetUsers, UserService } from '@c.a.f/example-domain';

export class UserApi {
  getUsers() {
    const userRepository = new UserRepository(Axios);
    const userService = new UserService(userRepository);
    const getUsers = new GetUsers(userService);
    return getUsers.execute();
  }
}
