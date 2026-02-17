import { AxiosInstance } from 'axios';
import { User, UserService } from '../../../domain';
import { GetUsers, CreateUser } from '../../../application';
import { UserRepository } from './UserRepository';

export class UserApi {
  private userRepository: UserRepository;
  private userService: UserService;
  private getUsersUseCase: GetUsers;
  private createUserUseCase: CreateUser;

  constructor(axiosInstance: AxiosInstance) {
    this.userRepository = new UserRepository(axiosInstance);
    this.userService = new UserService(this.userRepository);
    this.getUsersUseCase = new GetUsers(this.userService);
    this.createUserUseCase = new CreateUser(this.userService);
  }

  async getUsers() {
    return await this.getUsersUseCase.execute();
  }

  async createUser(user: User) {
    return await this.createUserUseCase.execute(user);
  }
}
