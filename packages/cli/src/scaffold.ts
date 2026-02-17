import * as fs from 'fs-extra';
import * as path from 'path';

const templatesDir = path.join(__dirname, 'templates');

export async function scaffoldCafStructure(targetPath: string, createTsConfig: boolean = false): Promise<void> {
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
  
  // Create TypeScript configuration if requested
  if (createTsConfig) {
    await createTypeScriptConfig(targetPath);
  }
}

async function createDomainStructure(cafPath: string): Promise<void> {
  const domainPath = path.join(cafPath, 'domain');
  await fs.mkdirp(domainPath);
  
  // Create example User domain
  const userPath = path.join(domainPath, 'User');
  await fs.mkdirp(userPath);
  
  // User entity
  await fs.writeFile(
    path.join(userPath, 'user.entities.ts'),
    `export interface User {
  id: string;
  name: string;
  email: string;
}
`
  );
  
  // User repository interface
  await fs.writeFile(
    path.join(userPath, 'user.irepository.ts'),
    `import { User } from './user.entities';

export interface IUserRepository {
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User>;
  createUser(user: User): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
}
`
  );
  
  // User service
  await fs.writeFile(
    path.join(userPath, 'user.service.ts'),
    `import { User } from './user.entities';
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
`
  );
  
  // Domain User index
  await fs.writeFile(
    path.join(userPath, 'index.ts'),
    `export * from './user.entities';
export * from './user.irepository';
export * from './user.service';
`
  );
  
  // Domain index
  await fs.writeFile(
    path.join(domainPath, 'index.ts'),
    `export * from './User';
`
  );
}

async function createApplicationStructure(cafPath: string): Promise<void> {
  const applicationPath = path.join(cafPath, 'application');
  await fs.mkdirp(applicationPath);
  
  // Create User application structure
  const userAppPath = path.join(applicationPath, 'User');
  const commandsPath = path.join(userAppPath, 'Commands');
  const queriesPath = path.join(userAppPath, 'Queries');
  
  await fs.mkdirp(commandsPath);
  await fs.mkdirp(queriesPath);
  
  // GetUsers query
  await fs.writeFile(
    path.join(queriesPath, 'GetUsers.ts'),
    `import { UseCase, RequestResult, pulse } from '@c.a.f/core';
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
`
  );
  
  // CreateUser command
  await fs.writeFile(
    path.join(commandsPath, 'CreateUser.ts'),
    `import { UseCase, RequestResult, pulse } from '@c.a.f/core';
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
`
  );
  
  // Application User index
  await fs.writeFile(
    path.join(userAppPath, 'index.ts'),
    `export * from './Commands/CreateUser';
export * from './Queries/GetUsers';
`
  );
  
  // Application index
  await fs.writeFile(
    path.join(applicationPath, 'index.ts'),
    `export * from './User';
`
  );
}

async function createInfrastructureStructure(cafPath: string): Promise<void> {
  const infrastructurePath = path.join(cafPath, 'infrastructure');
  const apiPath = path.join(infrastructurePath, 'api');
  const userApiPath = path.join(apiPath, 'User');
  
  await fs.mkdirp(userApiPath);
  
  // UserRepository implementation
  await fs.writeFile(
    path.join(userApiPath, 'UserRepository.ts'),
    `import { AxiosInstance } from 'axios';
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
`
  );
  
  // UserApi
  await fs.writeFile(
    path.join(userApiPath, 'UserApi.ts'),
    `import { AxiosInstance } from 'axios';
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
`
  );
  
  // Infrastructure User index
  await fs.writeFile(
    path.join(userApiPath, 'index.ts'),
    `export * from './UserRepository';
export * from './UserApi';
`
  );
  
  // Infrastructure API index
  await fs.writeFile(
    path.join(apiPath, 'index.ts'),
    `export * from './User';
`
  );
  
  // Infrastructure index
  await fs.writeFile(
    path.join(infrastructurePath, 'index.ts'),
    `export * from './api';
`
  );
}

async function createIndexFiles(cafPath: string): Promise<void> {
  // Main caf index
  await fs.writeFile(
    path.join(cafPath, 'index.ts'),
    `export * from './domain';
export * from './application';
export * from './infrastructure';
`
  );
}

async function detectFramework(targetPath: string): Promise<'react' | 'vue' | 'angular' | null> {
  const packageJsonPath = path.join(targetPath, 'package.json');
  
  if (!(await fs.pathExists(packageJsonPath))) {
    return null;
  }

  try {
    const packageJson = await fs.readJson(packageJsonPath);
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.peerDependencies,
    };

    if (allDeps.react || allDeps['react-dom']) {
      return 'react';
    }
    if (allDeps.vue || allDeps['vue-router']) {
      return 'vue';
    }
    if (allDeps['@angular/core'] || allDeps['@angular/router']) {
      return 'angular';
    }
  } catch (error) {
    // If we can't read package.json, return null (framework-agnostic)
    return null;
  }

  return null;
}

async function createTypeScriptConfig(targetPath: string): Promise<boolean> {
  const tsconfigPath = path.join(targetPath, 'tsconfig.json');
  
  // Only create if it doesn't exist (don't overwrite existing config)
  if (await fs.pathExists(tsconfigPath)) {
    console.log('⚠️  tsconfig.json already exists, skipping creation');
    return false;
  }

  const framework = await detectFramework(targetPath);
  
  // Base compiler options (framework-agnostic)
  const baseOptions = {
    target: 'ES2020',
    useDefineForClassFields: true,
    lib: ['ES2020', 'DOM', 'DOM.Iterable'],
    module: 'ESNext',
    skipLibCheck: true,
    moduleResolution: 'node',
    allowImportingTsExtensions: true,
    resolveJsonModule: true,
    isolatedModules: true,
    noEmit: true,
    strict: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noFallthroughCasesInSwitch: true,
  };

  // Framework-specific options
  let jsxOption = '';
  if (framework === 'react') {
    jsxOption = '    "jsx": "react-jsx",\n';
  } else if (framework === 'vue') {
    // Vue doesn't need JSX, but we can add Vue-specific options if needed
    // For now, keep it simple
  } else if (framework === 'angular') {
    // Angular uses different module system
    baseOptions.module = 'ES2022';
    baseOptions.moduleResolution = 'node';
  }

  const config = `{
  "compilerOptions": {
    "target": "${baseOptions.target}",
    "useDefineForClassFields": ${baseOptions.useDefineForClassFields},
    "lib": ${JSON.stringify(baseOptions.lib)},
    "module": "${baseOptions.module}",
    "skipLibCheck": ${baseOptions.skipLibCheck},
    "moduleResolution": "${baseOptions.moduleResolution}",
    "allowImportingTsExtensions": ${baseOptions.allowImportingTsExtensions},
    "resolveJsonModule": ${baseOptions.resolveJsonModule},
    "isolatedModules": ${baseOptions.isolatedModules},
    "noEmit": ${baseOptions.noEmit},${jsxOption ? '\n' + jsxOption : ''}
    "strict": ${baseOptions.strict},
    "esModuleInterop": ${baseOptions.esModuleInterop},
    "allowSyntheticDefaultImports": ${baseOptions.allowSyntheticDefaultImports},
    "noUnusedLocals": ${baseOptions.noUnusedLocals},
    "noUnusedParameters": ${baseOptions.noUnusedParameters},
    "noFallthroughCasesInSwitch": ${baseOptions.noFallthroughCasesInSwitch}
  },
  "include": ["src", "caf"],
  "exclude": ["node_modules"]
}
`;

  await fs.writeFile(tsconfigPath, config);
  return true;
}
