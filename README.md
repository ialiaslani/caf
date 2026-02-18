# CAF — Clean Architecture Frontend

**Clean Architecture Frontend** — domain-agnostic primitives for building frontend applications with Clean Architecture. Works with any frontend framework (React, Vue, Angular, or future frameworks). Find us on [npm](https://www.npmjs.com/search?q=%40c.a.f) and [GitHub](https://github.com/ialiaslani/caf).

## What is CAF?

CAF is a **core library** that provides framework-agnostic primitives and interfaces for implementing Clean Architecture in frontend applications. The same domain logic and use cases can run in React, Vue, Angular, or any future framework by swapping adapters.

**Key Features:**
- 🎯 **Framework-agnostic** — Write business logic once, use it in any framework
- 🏗️ **Clean Architecture** — Clear separation of domain, application, and infrastructure layers
- ⚡ **Reactive primitives** — Single reactive engine (Pulse) for state management
- 🔌 **Pluggable adapters** — Implement interfaces for routing, HTTP, and UI frameworks
- 📦 **Type-safe** — Full TypeScript support with declaration files

## Vision

CAF provides a **core** that you can use to implement whatever you want using **implementable interfaces** that are compatible with **any frontend library** that exists today or may appear tomorrow.

To achieve that:

- **Pulse** — A proxy-based reactive primitive (like refs/reactive in Vue core). It gives the core a single, framework-agnostic way to hold state and notify subscribers, so any UI layer (React, Vue, Angular, or future frameworks) can bind to it.
- **Request** — Every frontend has a connection with the server. The core defines interfaces and a default implementation (e.g. loading/data/error as Pulse-backed values) so infrastructure can plug in any HTTP or transport.
- **Routing** — Every frontend has routing. The core defines a routing interface (e.g. current route, change route) so each framework implements it once; application and domain code depend only on the interface.

**Goal:** This core can be a **library** (primitives + interfaces + optional default implementations). With conventions and a thin app shell, it can grow into a small **framework**. The same domain and use cases can run in React, Vue, Angular, or a future framework by swapping adapters.

## Packages

This repository contains multiple packages organized as a monorepo:

### Core Package

- **`@c.a.f/core`** — The main library package
  - Domain-agnostic primitives: `UseCase`, `Ploc`, `Pulse`, `ApiRequest`, `RouteManager`
  - Framework-agnostic interfaces: `RouteRepository`, `IRequest`
  - Published to npm (or your registry)
  - See [`packages/core/README.md`](packages/core/README.md) for usage

- **`@c.a.f/workflow`** — Workflow and state machine management
  - Framework-agnostic workflow and state machine management built on top of Ploc
  - Includes guards, actions, and effects utilities
  - Published to npm (or your registry)
  - See [`packages/workflow/README.md`](packages/workflow/README.md) for usage

### Example Domain

- **`@c.a.f/example-domain`** — Example domain implementation
  - Demonstrates how to structure domain and application layers
  - Includes `User`, `Login`, repositories, services, and use cases
  - Used by the demo apps (React/Vue/Angular)
  - **Not published** — This is a reference implementation for learning purposes
  - Depends on `@c.a.f/core` only (domain logic is framework-agnostic)
  - Could be published as a "starter kit" package in the future if desired

### Infrastructure Packages

- **`@c.a.f/infrastructure-axios`** — Axios-based HTTP client utilities (reserved for future generic HTTP utilities)
- **`@c.a.f/infrastructure-react`** — React-specific adapters (routing hooks: `useRouteManager`, `useRouteRepository`)
- **`@c.a.f/infrastructure-vue`** — Vue-specific adapters (routing composables: `useRouteManager`, `useRouteRepository`)
- **`@c.a.f/infrastructure-angular`** — Angular-specific adapters (routing services: `RouterService`, `RouteHandler`)

### Example Packages (Not Published)

- **`@c.a.f/example-domain`** — Example domain implementation (Login, User entities, use cases)
- **`@c.a.f/example-infrastructure`** — Example infrastructure implementations (LoginApi, LogoutApi, UserApi)
- **`@c.a.f/example-react`** — React example app
- **`@c.a.f/example-vue`** — Vue example app
- **`@c.a.f/example-angular`** — Angular example app

These example packages demonstrate how to use CAF with different frameworks. They show how to structure your domain, infrastructure, and presentation layers.

## Getting Started

### Quick Start

The fastest way to get started is using the CAF CLI:

**Windows:**
```powershell
# Install globally (recommended for Windows)
npm install -g "@c.a.f/cli"
caf-init

# Then install dependencies
npm install @c.a.f/core @c.a.f/infrastructure-react
```

**Unix/Mac:**
```bash
# Initialize CAF project structure
npx "@c.a.f/cli"

# Then install dependencies
npm install @c.a.f/core @c.a.f/infrastructure-react
```

**Note:** Windows users should install globally because `npx` has issues with scoped packages on Windows. See [packages/cli/WINDOWS_NPX_ISSUE.md](packages/cli/WINDOWS_NPX_ISSUE.md) for details.

This creates the `caf/` folder structure with example domain, application, and infrastructure code.

### Install

```bash
# Core package (required)
npm install @c.a.f/core

# Validation package (optional, for form validation)
npm install @c.a.f/validation

# Framework-specific infrastructure adapter (choose one)
npm install @c.a.f/infrastructure-react    # For React
# OR
npm install @c.a.f/infrastructure-vue      # For Vue
# OR
npm install @c.a.f/infrastructure-angular # For Angular

# HTTP client adapter (optional, if using Axios)
npm install @c.a.f/infrastructure-axios axios

# Validation library (optional, choose one)
npm install zod    # For Zod
# OR
npm install yup    # For Yup
```

### Quick Start

See [`packages/core/README.md`](packages/core/README.md) for detailed usage examples and API documentation.

**Basic example:**

```typescript
import { UseCase, Ploc, pulse } from '@c.a.f/core';

// Define a use case
class GetUsers implements UseCase<[], User[]> {
  async execute(): Promise<RequestResult<User[]>> {
    // Your logic here
  }
}

// Create a Ploc for presentation logic
class UsersPloc extends Ploc<User[]> {
  constructor(private getUsers: GetUsers) {
    super([]);
  }
  
  async loadUsers() {
    const result = await this.getUsers.execute();
    this.changeState(result.data.value);
  }
}
```

## Setting Up a New Project

This section provides a complete guide for setting up a new project using CAF packages.

### Quick Setup with CLI

The easiest way to get started is using the CAF CLI:

```bash
npx @c.a.f/cli
```

This will create the `caf/` folder structure with default domain, application, and infrastructure templates.

### Manual Setup

If you prefer to set up manually, follow the steps below.

### Project Structure

Here's the recommended folder structure for a new CAF project:

```
my-project/
│
├── caf/                          # CAF Architecture Layers (Framework-agnostic)
│   ├── domain/                   # Domain Layer (Pure Business Logic)
│   │   ├── User/
│   │   │   ├── user.entities.ts      # User entity
│   │   │   ├── user.service.ts       # Domain service
│   │   │   ├── user.irepository.ts   # Repository interface
│   │   │   └── index.ts
│   │   ├── Product/
│   │   │   ├── product.entities.ts
│   │   │   ├── product.service.ts
│   │   │   ├── product.irepository.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── application/             # Application Layer (Use Cases)
│   │   ├── User/
│   │   │   ├── Commands/            # Write operations
│   │   │   │   ├── CreateUser.ts
│   │   │   │   └── UpdateUser.ts
│   │   │   ├── Queries/             # Read operations
│   │   │   │   └── GetUsers.ts
│   │   │   └── index.ts
│   │   ├── Product/
│   │   │   ├── Commands/
│   │   │   ├── Queries/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── infrastructure/          # Infrastructure Layer (Framework-specific)
│   │   ├── api/
│   │   │   ├── User/
│   │   │   │   ├── UserRepository.ts    # Implements IUserRepository
│   │   │   │   ├── UserApi.ts           # API wrapper
│   │   │   │   └── index.ts
│   │   │   ├── Product/
│   │   │   │   ├── ProductRepository.ts
│   │   │   │   ├── ProductApi.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── index.ts
│
├── src/                          # Presentation Layer (UI - Framework-specific)
│   ├── pages/
│   │   ├── Login/
│   │   │   ├── components/
│   │   │   │   └── index.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useLogin.ts
│   │   │   └── index.tsx
│   │   ├── Dashboard/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── index.tsx
│   │   └── ...
│   ├── common/
│   │   ├── components/
│   │   └── hooks/
│   ├── routes/
│   │   └── AppRoutes.tsx
│   ├── constants.ts               # Shared constants
│   └── main.tsx                   # Entry point
│
├── package.json
├── tsconfig.json
└── vite.config.ts                 # or webpack.config.js, etc.
```

**Key Points:**
- The `caf/` folder contains all framework-agnostic code (domain, application, infrastructure)
- The `src/` folder contains framework-specific UI code (React, Vue, Angular, etc.)
- This separation makes it clear what's reusable across frameworks vs. framework-specific

### Step-by-Step Setup

#### Step 1: Create Domain Layer

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
    // Domain logic here
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

#### Step 2: Create Application Layer (Use Cases)

**`caf/application/User/Queries/GetUsers.ts`**
```typescript
import { UseCase, RequestResult, pulse } from '@c.a.f/core';
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

**`src/application/User/Commands/CreateUser.ts`**
```typescript
import { UseCase, RequestResult, pulse } from '@c.a.f/core';
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

#### Step 3: Create Infrastructure Layer

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

#### Step 4: Create Presentation Layer (React Example)

**`src/pages/Users/hooks/useUsers.ts`**
```typescript
import { useState, useEffect } from 'react';
import { Ploc } from '@c.a.f/core';
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
    const unsubscribe = ploc.subscribe((state) => {
      setUsers(state);
    });
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

#### Step 5: Setup Routing (React Example)

**`src/common/hooks/useRouteManager.ts`**
```typescript
import { useRouteManager as useInfraRouteManager } from '@c.a.f/infrastructure-react';

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

  return {
    init,
    routeManager,
  };
};
```

**`src/routes/AppRoutes.tsx`**
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UsersPage } from '../pages/Users';
import { LoginPage } from '../pages/Login';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Routes>
    </BrowserRouter>
  );
};
```

### Using Validation

**`caf/application/User/Commands/CreateUser.ts`** (with validation)
```typescript
import { UseCase, RequestResult, pulse } from '@c.a.f/core';
import { ValidationRunner } from '@c.a.f/validation';
import { ZodValidator } from '@c.a.f/validation/zod';
import { z } from 'zod';
import { User, UserService } from '../../../caf/domain';

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export class CreateUser implements UseCase<[User], User> {
  constructor(private userService: UserService) {}

  async execute(user: User): Promise<RequestResult<User>> {
    // Validate input
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

### TypeScript Configuration

**`tsconfig.json`**
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

### Package.json Example

```json
{
  "name": "my-caf-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  },
  "dependencies": {
    "@c.a.f/core": "^1.0.0",
    "@c.a.f/validation": "^1.0.0",
    "@c.a.f/infrastructure-react": "^1.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.23.1",
    "axios": "^1.7.2",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.2.0"
  }
}
```

### Key Principles

1. **Dependency Direction**: Dependencies point inward
   - Presentation → Application → Domain
   - Infrastructure → Application → Domain
   - Domain has **zero dependencies** on frameworks

2. **Domain Layer**: Pure business logic, no framework dependencies
   - Entities (data structures)
   - Domain services (business rules)
   - Repository interfaces (contracts)

3. **Application Layer**: Use cases orchestrate domain logic
   - Commands (write operations)
   - Queries (read operations)
   - Uses `UseCase` interface from `@c.a.f/core`

4. **Infrastructure Layer**: Framework-specific implementations
   - Implements repository interfaces
   - HTTP clients, routing adapters
   - Can be swapped without changing domain/application

5. **Presentation Layer**: UI components
   - Uses Ploc for state management
   - Uses framework-specific infrastructure adapters
   - Thin layer that delegates to use cases

### Next Steps

1. Start with the domain layer - define your entities and business rules
2. Create use cases in the application layer
3. Implement infrastructure (repositories, APIs)
4. Build UI components in the presentation layer
5. Wire everything together with routing and state management

For more examples, see the `examples/` directory in this repository.

## Architecture

CAF follows Clean Architecture principles with clear layer separation:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation                         │
│              (React / Vue / Angular)                    │
│                                                          │
│  Uses: Ploc, Pulse, RouteManager                        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Application                            │
│                                                          │
│  UseCase, Ploc, RequestResult                           │
│  (Business rules, orchestration)                        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                    Domain                                │
│                                                          │
│  Entities, Value Objects, Domain Logic                  │
│  (Pure business logic, no dependencies)                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                Infrastructure                           │
│                                                          │
│  Repositories, HTTP Clients, Route Adapters             │
│  (Framework-specific implementations)                  │
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

**Domain Layer** (`packages/core/domain`)
- Pure business logic
- No dependencies on frameworks or external libraries
- Entities, value objects, domain rules
- Least likely to change

**Application Layer** (`packages/core/application`)
- Use cases and application services
- Orchestrates domain logic
- Depends on domain, not infrastructure
- Uses `UseCase` interface, `Ploc`, `RequestResult`

**Infrastructure Layer** (`packages/infrastructure-*`)
- Framework-specific adapters
- HTTP clients, routing adapters
- Implements interfaces defined in core
- Examples: React Router, Vue Router, Angular Router adapters

**Example Packages** (`examples/`)
- Example domain implementation (`example-domain`)
- Example infrastructure implementations (`example-infrastructure`)
- Example applications (`example-react`, `example-vue`, `example-angular`)
- Demonstrates how to structure your own domain and infrastructure layers

### Dependency Direction

Dependencies point **inward**:
- Presentation → Application → Domain
- Infrastructure → Application → Domain
- **Core has zero dependencies** on frameworks or external libraries

## Development

This is a monorepo using Yarn workspaces. Each package can be developed independently.

### Prerequisites

- Node.js (v18+)
- Yarn

### Setup

```bash
# Install dependencies
yarn install

# Build all packages
yarn core:build
yarn example-domain:build
yarn infrastructure:build
```

### Running Demo Apps

**React:**
```bash
yarn react:dev        # Run React app with watch mode
yarn react:serve      # Run React app
```

**Vue:**
```bash
yarn vue:dev          # Run Vue app with watch mode
yarn vue:serve        # Run Vue app
```

**Angular:**
```bash
yarn angular:dev      # Run Angular app with watch mode
yarn angular:serve    # Run Angular app
```

### Development Scripts

```bash
# Core package
yarn core:build       # Build core
yarn core:test        # Run tests
yarn core:serve       # Watch mode

# Example domain
yarn example-domain:build
yarn example-domain:serve

# Infrastructure
yarn infrastructure:build
yarn infrastructure:serve
```

### Testing

```bash
# Run all tests (core, devtools, workflow, infrastructure-react)
yarn test

# Run individual package tests
yarn core:test              # Core package tests
yarn workspace @c.a.f/devtools test        # Devtools tests
yarn workspace @c.a.f/workflow test        # Workflow tests
yarn workspace @c.a.f/infrastructure-react test  # Infrastructure React tests

# Watch mode (for individual packages)
yarn core:test:watch
```

## Official Adapters

CAF provides official infrastructure adapter packages that you can use in your projects:

### HTTP / Repository Adapters

- **`@c.a.f/infrastructure-axios`** — Axios-based HTTP and repository implementations
  - `LoginRepository` — Login/logout HTTP operations
  - `UserRepository` — User CRUD operations
  - See [`packages/infrastructure/axios/README.md`](packages/infrastructure/axios/README.md)

### Framework-Specific Routing Adapters

- **`@c.a.f/infrastructure-react`** — React routing hooks
  - `useRouteManager()` — Hook providing core `RouteManager`
  - `useRouteRepository()` — Hook providing `RouteRepository` implementation
  - See [`packages/infrastructure/react/README.md`](packages/infrastructure/react/README.md)

- **`@c.a.f/infrastructure-vue`** — Vue routing adapters
  - `RouterService` — Service providing core `RouteManager`
  - `RouteHandler` — Vue Router adapter
  - See [`packages/infrastructure/vue/README.md`](packages/infrastructure/vue/README.md)

- **`@c.a.f/infrastructure-angular`** — Angular routing adapters
  - `RouterService` — Injectable service providing core `RouteManager`
  - `RouteHandler` — Angular Router adapter
  - See [`packages/infrastructure/angular/README.md`](packages/infrastructure/angular/README.md)

### Example Infrastructure

- **`@c.a.f/example-infrastructure`** — Example API implementations (LoginApi, LogoutApi, UserApi)
  - Uses `@c.a.f/infrastructure-axios` repositories and `@c.a.f/example-domain` entities
  - See [`examples/example-infrastructure/README.md`](examples/example-infrastructure/README.md)

**Installation example:**
```bash
# Core + React adapter
npm install @c.a.f/core @c.a.f/infrastructure-react

# With Axios HTTP adapter (optional)
npm install @c.a.f/infrastructure-axios axios
```

**Note:** The example apps (`@c.a.f/example-react`, `@c.a.f/example-vue`, `@c.a.f/example-angular`) and example infrastructure (`@c.a.f/example-infrastructure`) depend on `@c.a.f/example-domain` for demonstration purposes. These example packages are not published — they're reference implementations showing how to structure your domain, infrastructure, and application layers. You'll create your own domain and infrastructure packages that depend on `@c.a.f/core` and framework-specific infrastructure adapters.

## Documentation

- **[Core Package README](packages/core/README.md)** — Usage guide and examples
- **[API Documentation](docs/API.md)** — Complete API reference
- **[Publishing Guide](docs/PUBLISHING.md)** — How to publish and consume packages
- **[Versioning Strategy](docs/VERSIONING.md)** — Versioning approach
- **[Changelog](CHANGELOG.md)** — Version history

## Example / Demo

This repository serves as a complete example of CAF usage, demonstrating how to build framework-agnostic frontend applications with Clean Architecture.

### Example Domain Package

**`@c.a.f/example-domain`** (`examples/example-domain`) — A complete example implementation showing:

- **Domain Layer:**
  - Entities: `User`, `Login`
  - Domain services: `UserService`, `LoginService`
  - Repository interfaces: `IUserRepository`, `ILoginRepository`

- **Application Layer:**
  - Use cases: `LoginUser`, `LogoutUser`, `GetUsers`, `AddUser`
  - All use cases implement `UseCase` interface from `@c.a.f/core`
  - Returns `RequestResult<T>` for reactive state management

This package demonstrates how to structure your domain and application layers using CAF primitives. It's used by all three demo apps, proving that the same business logic works across frameworks.

### Demo Applications

Three complete demo applications showcase CAF with different frontend frameworks:

- **React Example** — `examples/example-react`
  - Uses `useRouteManager()` hook for routing
  - Demonstrates Ploc usage for state management
  - Full login/logout flow with user management

- **Vue Example** — `examples/example-vue`
  - Vue Router adapter implementation
  - Same use cases as React app
  - Vue Composition API integration

- **Angular Example** — `examples/example-angular`
  - Angular Router adapter implementation
  - Dependency injection setup
  - Same domain logic as React/Vue apps

**Key Point:** All three apps use the **same domain logic** (`@c.a.f/example-domain`) and use cases. Only the UI layer differs, demonstrating how CAF enables true framework-agnostic business logic.

### Running the Examples

```bash
# Run React example
yarn example:react:dev

# Run Vue example
yarn example:vue:dev

# Run Angular example
yarn example:angular:dev
```

Each demo app shows:
- How to implement `RouteRepository` for your framework
- How to use `Ploc` for presentation state
- How to integrate use cases with UI
- How to handle routing and authentication

See the individual demo app directories for framework-specific implementation details.

## License

MIT

## Repository

[https://github.com/ialiaslani/caf](https://github.com/ialiaslani/caf)

---

### For maintainers: discoverability (Google, GitHub, npm)

To help people find this project when searching **"clean architecture frontend"**:

- **GitHub:** Set the repo **Description** (under About) to:  
  `Clean Architecture Frontend (CAF) — framework-agnostic primitives for React, Vue, Angular. Domain, application, infrastructure layers.`
- **GitHub:** Add **Topics** (under About):  
  `clean-architecture`, `clean-architecture-frontend`, `frontend`, `react`, `vue`, `angular`, `typescript`, `architecture`, `domain-driven-design`, `usecase`, `ploc`
- **npm:** Published `@c.a.f/*` packages already include `clean-architecture-frontend` and `clean architecture frontend` in keywords and descriptions. Re-publish after changes to refresh npm search.
