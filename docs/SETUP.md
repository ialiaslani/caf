# Setting Up a New Project

Complete guide for setting up a new project using CAF packages.

## Quick setup with CLI

The easiest way is the CAF CLI:

```bash
npx @c-a-f/cli
```

This creates the `caf/` folder structure with default domain, application, and infrastructure templates. Then install dependencies (e.g. `npm install @c-a-f/core @c-a-f/infrastructure-react`).

**Windows:** `npx` can have issues with scoped packages; install globally: `npm install -g @c-a-f/cli` then run `caf-init`. See [packages/cli/WINDOWS_NPX_ISSUE.md](../packages/cli/WINDOWS_NPX_ISSUE.md).

## Manual setup

### Project structure

```
my-project/
├── caf/                          # Framework-agnostic (domain, application, infrastructure)
│   ├── domain/                   # Entities, repository interfaces, domain services
│   │   ├── User/
│   │   │   ├── user.entities.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.irepository.ts
│   │   │   └── index.ts
│   │   └── ...
│   ├── application/              # Use cases (Commands / Queries)
│   │   ├── User/
│   │   │   ├── Commands/
│   │   │   ├── Queries/
│   │   │   └── index.ts
│   │   └── ...
│   ├── infrastructure/           # Repositories, API clients
│   │   ├── api/
│   │   └── index.ts
│   └── index.ts
├── src/                          # Framework-specific UI (React / Vue / Angular)
│   ├── pages/
│   ├── routes/
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```

- **`caf/`** — domain, application, infrastructure (reusable across frameworks).
- **`src/`** — presentation (framework-specific).

### Step 1: Domain layer

**`caf/domain/User/user.entities.ts`**
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
}
```

**`caf/domain/User/user.irepository.ts`**
```typescript
import { User } from './user.entities';

export interface IUserRepository {
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User>;
  createUser(user: User): Promise<User>;
}
```

**`caf/domain/User/user.service.ts`**
```typescript
import { User } from './user.entities';
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
    return await this.repository.createUser(user);
  }
}
```

**`caf/domain/User/index.ts`**
```typescript
export * from './user.entities';
export * from './user.irepository';
export * from './user.service';
```

### Step 2: Application layer (use cases)

**`caf/application/User/Queries/GetUsers.ts`**
```typescript
import { UseCase, RequestResult, pulse } from '@c-a-f/core';
import { User, UserService } from '../../../caf/domain';

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
```

**`caf/application/User/Commands/CreateUser.ts`**
```typescript
import { UseCase, RequestResult, pulse } from '@c-a-f/core';
import { User, UserService } from '../../../caf/domain';

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
```

### Step 3: Infrastructure layer

**`caf/infrastructure/api/User/UserRepository.ts`**
```typescript
import axios, { AxiosInstance } from 'axios';
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
}
```

**`caf/infrastructure/api/User/UserApi.ts`**
```typescript
import axios, { AxiosInstance } from 'axios';
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
```

### Step 4: Presentation layer (React example)

**`src/pages/Users/hooks/useUsers.ts`**
```typescript
import { useState, useEffect } from 'react';
import { Ploc } from '@c-a-f/core';
import { User } from '../../../caf/domain';
import { UserApi } from '../../../caf/infrastructure';
import axios from 'axios';

class UsersPloc extends Ploc<User[]> {
  constructor(private userApi: UserApi) {
    super([]);
  }

  async loadUsers() {
    const result = await this.userApi.getUsers();
    if (result.data.value) {
      this.changeState(result.data.value);
    }
  }
}

export const useUsers = () => {
  const [ploc] = useState(() => {
    const userApi = new UserApi(axios.create({ baseURL: '/api' }));
    return new UsersPloc(userApi);
  });
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const unsubscribe = ploc.subscribe((state) => setUsers(state));
    ploc.loadUsers();
    return unsubscribe;
  }, [ploc]);

  return { users };
};
```

**`src/pages/Users/components/index.tsx`**
```typescript
import { useUsers } from '../hooks/useUsers';

export const UsersPage = () => {
  const { users } = useUsers();

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
};
```

### Step 5: Routing (React example)

**`src/common/hooks/useRouteManager.ts`**
```typescript
import { useRouteManager as useInfraRouteManager } from '@c-a-f/infrastructure-react';

const LOGIN_PATH = '/login';
const TOKEN_KEY = 'auth_token';

export const useRouteManager = () => {
  const routeManager = useInfraRouteManager({
    loginPath: LOGIN_PATH,
    isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
  });

  const init = () => {
    routeManager.checkForLoginRoute();
  };

  return { init, routeManager };
};
```

**`src/routes/AppRoutes.tsx`**
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UsersPage } from '../pages/Users';
import { LoginPage } from '../pages/Login';

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/users" element={<UsersPage />} />
    </Routes>
  </BrowserRouter>
);
```

### Using validation

Use `@c-a-f/validation` with Zod or Yup in use cases. Example with Zod:

**`caf/application/User/Commands/CreateUser.ts`** (with validation)
```typescript
import { UseCase, RequestResult, pulse } from '@c-a-f/core';
import { ValidationRunner } from '@c-a-f/validation';
import { ZodValidator } from '@c-a-f/validation/zod';
import { z } from 'zod';
import { User, UserService } from '../../../caf/domain';

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export class CreateUser implements UseCase<[User], User> {
  constructor(private userService: UserService) {}

  async execute(user: User): Promise<RequestResult<User>> {
    const validator = new ZodValidator(userSchema);
    const validationResult = await ValidationRunner.run(validator, user);

    if (!validationResult.success) {
      return {
        loading: pulse(false),
        data: pulse(null! as User),
        error: pulse(new Error(ValidationRunner.formatErrors(validationResult.errors).join(', '))),
      };
    }

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
```

### TypeScript and package.json

**`tsconfig.json`** — use `baseUrl` and `paths` for `caf/*` and `src/*`:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "strict": true,
    "jsx": "react-jsx",
    "baseUrl": "./",
    "paths": {
      "src/*": ["src/*"],
      "caf/*": ["caf/*"]
    }
  },
  "include": ["src/**/*", "caf/**/*"],
  "exclude": ["node_modules"]
}
```

**Dependencies** — at minimum:

- `@c-a-f/core`
- One of: `@c-a-f/infrastructure-react`, `@c-a-f/infrastructure-vue`, `@c-a-f/infrastructure-angular`
- Optional: `@c-a-f/validation`, `zod` or `yup`

See the [main README](../README.md) Install section for exact commands.

### Key principles

1. **Dependency direction** — Presentation → Application → Domain; Infrastructure → Application → Domain. Domain has no framework dependencies.
2. **Domain** — Entities, repository interfaces, domain services only.
3. **Application** — Use cases (Commands/Queries) using `UseCase` from `@c-a-f/core`.
4. **Infrastructure** — Implements repository interfaces; can be swapped (REST, GraphQL, WebSocket) without changing domain/application.
5. **Presentation** — Thin UI layer using Ploc and framework adapters.

### Next steps

1. Define domain entities and repository interfaces.
2. Add use cases in the application layer.
3. Implement infrastructure (repositories, API clients).
4. Build UI and wire routing.

For full examples, see the `examples/` directory in the repository.
