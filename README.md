# CAF — Clean Architecture Frontend

Domain-agnostic primitives for building frontend applications with Clean Architecture. Works with any frontend framework (React, Vue, Angular, or future frameworks).

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

- **`@caf/core`** — The main library package
  - Domain-agnostic primitives: `UseCase`, `Ploc`, `Pulse`, `ApiRequest`, `RouteManager`
  - Framework-agnostic interfaces: `RouteRepository`, `IRequest`
  - Published to npm (or your registry)
  - See [`packages/core/README.md`](packages/core/README.md) for usage

### Example Domain

- **`@caf/example-domain`** — Example domain implementation
  - Demonstrates how to structure domain and application layers
  - Includes `User`, `Login`, repositories, services, and use cases
  - Used by the demo apps (React/Vue/Angular)

### Infrastructure Packages

- **`@caf/infrastructure-axios`** — Axios-based HTTP and repository implementations (`LoginRepository`, `UserRepository`)
- **`@caf/infrastructure`** — Shared infrastructure (LoginApi, LogoutApi, UserApi; depends on `@caf/infrastructure-axios`)
- **`@caf/infrastructure-react`** — React-specific adapters (routing hooks: `useRouteManager`, `useRouteRepository`)
- **`@caf/infrastructure-vue`** — Vue-specific adapters (routing)
- **`@caf/infrastructure-angular`** — Angular-specific adapters (routing)

### Presentation Packages (Demo Apps)

- **`@caf/presentation-react`** — React demo app
- **`@caf/presentation-vue`** — Vue demo app
- **`@caf/presentation-angular`** — Angular demo app

These apps demonstrate how to use CAF with different frameworks. They share the same domain and use cases, only the UI layer differs.

## Getting Started

### Install

```bash
npm install @caf/core
```

### Quick Start

See [`packages/core/README.md`](packages/core/README.md) for detailed usage examples and API documentation.

**Basic example:**

```typescript
import { UseCase, Ploc, pulse } from '@caf/core';

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

**Infrastructure Layer** (`packages/infrastructure`)
- Framework-specific implementations
- HTTP clients, routing adapters, repositories
- Implements interfaces defined in core
- Examples: Axios, React Router, Vue Router adapters

**Presentation Layer** (`packages/presentation`)
- UI components and views
- Framework-specific (React/Vue/Angular)
- Uses Ploc for state management
- Uses RouteManager for navigation

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
# Run core tests
yarn core:test

# Watch mode
yarn core:test:watch
```

## Official Adapters

CAF provides official infrastructure adapter packages that you can use in your projects:

### HTTP / Repository Adapters

- **`@caf/infrastructure-axios`** — Axios-based HTTP and repository implementations
  - `LoginRepository` — Login/logout HTTP operations
  - `UserRepository` — User CRUD operations
  - See [`packages/infrastructure/axios/README.md`](packages/infrastructure/axios/README.md)

### Framework-Specific Routing Adapters

- **`@caf/infrastructure-react`** — React routing hooks
  - `useRouteManager()` — Hook providing core `RouteManager`
  - `useRouteRepository()` — Hook providing `RouteRepository` implementation
  - See [`packages/infrastructure/react/README.md`](packages/infrastructure/react/README.md)

- **`@caf/infrastructure-vue`** — Vue routing adapters
  - `RouterService` — Service providing core `RouteManager`
  - `RouteHandler` — Vue Router adapter
  - See [`packages/infrastructure/vue/README.md`](packages/infrastructure/vue/README.md)

- **`@caf/infrastructure-angular`** — Angular routing adapters
  - `RouterService` — Injectable service providing core `RouteManager`
  - `RouteHandler` — Angular Router adapter
  - See [`packages/infrastructure/angular/README.md`](packages/infrastructure/angular/README.md)

### Shared Infrastructure

- **`@caf/infrastructure`** — Shared API wrappers (LoginApi, LogoutApi, UserApi)
  - Depends on `@caf/infrastructure-axios` for HTTP implementations
  - See [`packages/infrastructure/shared/README.md`](packages/infrastructure/shared/README.md)

**Installation example:**
```bash
# Core + React adapter
npm install @caf/core @caf/infrastructure-react

# With Axios HTTP adapter (optional)
npm install @caf/infrastructure-axios axios
```

## Documentation

- **[Core Package README](packages/core/README.md)** — Usage guide and examples
- **[API Documentation](docs/API.md)** — Complete API reference
- **[Publishing Guide](docs/PUBLISHING.md)** — How to publish and consume packages
- **[Versioning Strategy](docs/VERSIONING.md)** — Versioning approach
- **[Changelog](CHANGELOG.md)** — Version history

## Example / Demo

This repository serves as a complete example of CAF usage, demonstrating how to build framework-agnostic frontend applications with Clean Architecture.

### Example Domain Package

**`@caf/example-domain`** (`packages/example-domain`) — A complete example implementation showing:

- **Domain Layer:**
  - Entities: `User`, `Login`
  - Domain services: `UserService`, `LoginService`
  - Repository interfaces: `IUserRepository`, `ILoginRepository`

- **Application Layer:**
  - Use cases: `LoginUser`, `LogoutUser`, `GetUsers`, `AddUser`
  - All use cases implement `UseCase` interface from `@caf/core`
  - Returns `RequestResult<T>` for reactive state management

This package demonstrates how to structure your domain and application layers using CAF primitives. It's used by all three demo apps, proving that the same business logic works across frameworks.

### Demo Applications

Three complete demo applications showcase CAF with different frontend frameworks:

- **React Demo** — `packages/presentation/react`
  - Uses `useRouteManager()` hook for routing
  - Demonstrates Ploc usage for state management
  - Full login/logout flow with user management

- **Vue Demo** — `packages/presentation/vue`
  - Vue Router adapter implementation
  - Same use cases as React app
  - Vue Composition API integration

- **Angular Demo** — `packages/presentation/angular`
  - Angular Router adapter implementation
  - Dependency injection setup
  - Same domain logic as React/Vue apps

**Key Point:** All three apps use the **same domain logic** (`@caf/example-domain`) and use cases. Only the UI layer differs, demonstrating how CAF enables true framework-agnostic business logic.

### Running the Examples

```bash
# Run React demo
yarn react:dev

# Run Vue demo
yarn vue:dev

# Run Angular demo
yarn angular:dev
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

[https://git.nadindev.ir/aliaslani.mm/caf.git](https://git.nadindev.ir/aliaslani.mm/caf.git)
