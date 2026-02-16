"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scaffoldCafStructure = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const templatesDir = path.join(__dirname, 'templates');
async function scaffoldCafStructure(targetPath) {
    const cafPath = path.join(targetPath, 'caf');
    // Create main caf directory
    await fs.mkdirp(cafPath);
    // Create domain structure
    await createDomainStructure(cafPath);
    // Create application structure
    await createApplicationStructure(cafPath);
    // Create infrastructure structure
    await createInfrastructureStructure(cafPath);
    // Create index files
    await createIndexFiles(cafPath);
}
exports.scaffoldCafStructure = scaffoldCafStructure;
async function createDomainStructure(cafPath) {
    const domainPath = path.join(cafPath, 'domain');
    await fs.mkdirp(domainPath);
    // Create example User domain
    const userPath = path.join(domainPath, 'User');
    await fs.mkdirp(userPath);
    // User entity
    await fs.writeFile(path.join(userPath, 'user.entities.ts'), `export interface User {
  id: string;
  name: string;
  email: string;
}
`);
    // User repository interface
    await fs.writeFile(path.join(userPath, 'user.irepository.ts'), `import { User } from './user.entities';

export interface IUserRepository {
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User>;
  createUser(user: User): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
}
`);
    // User service
    await fs.writeFile(path.join(userPath, 'user.service.ts'), `import { User } from './user.entities';
import { IUserRepository } from './user.irepository';

export class UserService {
  constructor(private repository: IUserRepository) {}

  async getUsers(): Promise<User[]> {
    return await this.repository.getUsers();
  }

  async getUserById(id: string): Promise<User> {
    return await this.repository.getUserById(id);
  }

  async createUser(user: User): Promise<User> {
    // Add domain logic here
    return await this.repository.createUser(user);
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    // Add domain logic here
    return await this.repository.updateUser(id, user);
  }

  async deleteUser(id: string): Promise<void> {
    // Add domain logic here
    return await this.repository.deleteUser(id);
  }
}
`);
    // Domain User index
    await fs.writeFile(path.join(userPath, 'index.ts'), `export * from './user.entities';
export * from './user.irepository';
export * from './user.service';
`);
    // Domain index
    await fs.writeFile(path.join(domainPath, 'index.ts'), `export * from './User';
`);
}
async function createApplicationStructure(cafPath) {
    const applicationPath = path.join(cafPath, 'application');
    await fs.mkdirp(applicationPath);
    // Create User application structure
    const userAppPath = path.join(applicationPath, 'User');
    const commandsPath = path.join(userAppPath, 'Commands');
    const queriesPath = path.join(userAppPath, 'Queries');
    await fs.mkdirp(commandsPath);
    await fs.mkdirp(queriesPath);
    // GetUsers query
    await fs.writeFile(path.join(queriesPath, 'GetUsers.ts'), `import { UseCase, RequestResult, pulse } from '@c.a.f/core';
import { User, UserService } from '../../../domain';

export class GetUsers implements UseCase<[], User[]> {
  constructor(private userService: UserService) {}

  async execute(): Promise<RequestResult<User[]>> {
    try {
      const users = await this.userService.getUsers();
      return {
        loading: pulse(false),
        data: pulse(users),
        error: pulse(null! as Error),
      };
    } catch (error) {
      return {
        loading: pulse(false),
        data: pulse([]),
        error: pulse(error as Error),
      };
    }
  }
}
`);
    // CreateUser command
    await fs.writeFile(path.join(commandsPath, 'CreateUser.ts'), `import { UseCase, RequestResult, pulse } from '@c.a.f/core';
import { User, UserService } from '../../../domain';

export class CreateUser implements UseCase<[User], User> {
  constructor(private userService: UserService) {}

  async execute(user: User): Promise<RequestResult<User>> {
    try {
      const createdUser = await this.userService.createUser(user);
      return {
        loading: pulse(false),
        data: pulse(createdUser),
        error: pulse(null! as Error),
      };
    } catch (error) {
      return {
        loading: pulse(false),
        data: pulse(null! as User),
        error: pulse(error as Error),
      };
    }
  }
}
`);
    // Application User index
    await fs.writeFile(path.join(userAppPath, 'index.ts'), `export * from './Commands/CreateUser';
export * from './Queries/GetUsers';
`);
    // Application index
    await fs.writeFile(path.join(applicationPath, 'index.ts'), `export * from './User';
`);
}
async function createInfrastructureStructure(cafPath) {
    const infrastructurePath = path.join(cafPath, 'infrastructure');
    const apiPath = path.join(infrastructurePath, 'api');
    const userApiPath = path.join(apiPath, 'User');
    await fs.mkdirp(userApiPath);
    // UserRepository implementation
    await fs.writeFile(path.join(userApiPath, 'UserRepository.ts'), `import { AxiosInstance } from 'axios';
import { IUserRepository, User } from '../../../domain';

export class UserRepository implements IUserRepository {
  constructor(private axiosInstance: AxiosInstance) {}

  async getUsers(): Promise<User[]> {
    const response = await this.axiosInstance.get<User[]>('/api/users');
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.axiosInstance.get<User>(\`/api/users/\${id}\`);
    return response.data;
  }

  async createUser(user: User): Promise<User> {
    const response = await this.axiosInstance.post<User>('/api/users', user);
    return response.data;
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const response = await this.axiosInstance.put<User>(\`/api/users/\${id}\`, user);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.axiosInstance.delete(\`/api/users/\${id}\`);
  }
}
`);
    // UserApi
    await fs.writeFile(path.join(userApiPath, 'UserApi.ts'), `import { AxiosInstance } from 'axios';
import { User, UserService } from '../../../domain';
import { GetUsers, CreateUser } from '../../../application';
import { UserRepository } from './UserRepository';

export class UserApi {
  private userRepository: UserRepository;
  private userService: UserService;
  private getUsers: GetUsers;
  private createUser: CreateUser;

  constructor(axiosInstance: AxiosInstance) {
    this.userRepository = new UserRepository(axiosInstance);
    this.userService = new UserService(this.userRepository);
    this.getUsers = new GetUsers(this.userService);
    this.createUser = new CreateUser(this.userService);
  }

  async getUsers() {
    return await this.getUsers.execute();
  }

  async createUser(user: User) {
    return await this.createUser.execute(user);
  }
}
`);
    // Infrastructure User index
    await fs.writeFile(path.join(userApiPath, 'index.ts'), `export * from './UserRepository';
export * from './UserApi';
`);
    // Infrastructure API index
    await fs.writeFile(path.join(apiPath, 'index.ts'), `export * from './User';
`);
    // Infrastructure index
    await fs.writeFile(path.join(infrastructurePath, 'index.ts'), `export * from './api';
`);
}
async function createIndexFiles(cafPath) {
    // Main caf index
    await fs.writeFile(path.join(cafPath, 'index.ts'), `export * from './domain';
export * from './application';
export * from './infrastructure';
`);
}
