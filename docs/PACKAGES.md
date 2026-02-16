# Package Structure and Dependencies

## Framework Packages (Publishable)

### @caf/core
- **Exports:** Primitives only (UseCase, Ploc, Pulse, pulse, ApiRequest, RouteManager, RouteRepository, RouteManagerAuthOptions, RequestResult, IRequest, IRequestHandler, etc.). No domain-specific code.
- **Depends on:** Nothing (dependency-free).
- **Location:** `packages/core/`

### @caf/validation
- **Exports:** Validation interfaces and adapters for Zod/Yup.
- **Depends on:** `@caf/core` only.
- **Location:** `packages/validation/`

### @caf/infrastructure-axios
- **Exports:** Generic HTTP client utilities (reserved for future use).
- **Depends on:** `@caf/core` and `axios`.
- **Location:** `packages/infrastructure/axios/`
- **Note:** Domain-specific repository implementations have been moved to `@caf/example-infrastructure`.

### @caf/infrastructure-react
- **Exports:** React-specific adapters (`useRouteManager`, `useRouteRepository` hooks).
- **Depends on:** `@caf/core` and `react-router-dom` (peer: `react`).
- **Location:** `packages/infrastructure/react/`

### @caf/infrastructure-vue
- **Exports:** Vue-specific adapters (`useRouteManager`, `useRouteRepository` composables).
- **Depends on:** `@caf/core` and `vue-router` (peer: `vue`).
- **Location:** `packages/infrastructure/vue/`

### @caf/infrastructure-angular
- **Exports:** Angular-specific adapters (`RouterService`, `RouteHandler`).
- **Depends on:** `@caf/core` and `@angular/router` (peer: `@angular/core`).
- **Location:** `packages/infrastructure/angular/`

## Example Packages (Not Publishable)

### @caf/example-domain
- **Exports:** Example domain implementation (User, Login, IUserRepository, ILoginRepository, UserService, LoginService, and use cases: LoginUser, LogoutUser, GetUsers, AddUser).
- **Depends on:** `@caf/core` only.
- **Location:** `examples/example-domain/`
- **Purpose:** Reference implementation showing how to structure your domain layer.

### @caf/example-infrastructure
- **Exports:** Example infrastructure implementations (LoginApi, LogoutApi, UserApi, LoginRepository, UserRepository).
- **Depends on:** `@caf/core`, `@caf/example-domain`, and `axios`.
- **Location:** `examples/example-infrastructure/`
- **Purpose:** Reference implementation showing how to structure your infrastructure layer.

### @caf/example-react
- **Exports:** React example application.
- **Depends on:** `@caf/core`, `@caf/example-domain`, `@caf/example-infrastructure`, `@caf/infrastructure-react`, and React libraries.
- **Location:** `examples/example-react/`
- **Purpose:** Complete example React application demonstrating CAF usage.

### @caf/example-vue
- **Exports:** Vue example application.
- **Depends on:** `@caf/core`, `@caf/example-domain`, `@caf/infrastructure-vue`, and Vue libraries.
- **Location:** `examples/example-vue/`
- **Purpose:** Complete example Vue application demonstrating CAF usage.

### @caf/example-angular
- **Exports:** Angular example application.
- **Depends on:** `@caf/core`, `@caf/example-domain`, `@caf/infrastructure-angular`, and Angular libraries.
- **Location:** `examples/example-angular/`
- **Purpose:** Complete example Angular application demonstrating CAF usage.

## Dependency Graph

```
Framework Packages (Publishable):
┌─────────────────┐
│   @caf/core     │ (no dependencies)
└────────┬────────┘
         │
    ┌────┴────┬──────────────┬──────────────┬──────────────┐
    │         │              │              │              │
┌───▼───┐ ┌──▼────────┐ ┌───▼──────┐ ┌───▼──────┐ ┌─────▼──────┐
│validation│ │infrastructure│ │infrastructure│ │infrastructure│ │infrastructure│
│          │ │   -axios     │ │   -react     │ │   -vue      │ │  -angular   │
└──────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └─────────────┘

Example Packages (Not Publishable):
┌─────────────────┐
│ @caf/core       │
└────────┬────────┘
         │
┌────────▼────────┐
│example-domain   │
└────────┬────────┘
         │
┌────────▼──────────────┐
│example-infrastructure │
└────────┬──────────────┘
         │
    ┌────┴────┬──────────────┬──────────────┐
    │         │              │              │
┌───▼────┐ ┌──▼──────┐ ┌────▼──────┐ ┌────▼──────┐
│example │ │example  │ │example    │ │example    │
│-react  │ │-vue     │ │-angular   │ │-domain    │
└────────┘ └─────────┘ └───────────┘ └───────────┘
```

## Key Principles

1. **Framework packages are framework-agnostic** (except infrastructure-* packages)
2. **No domain-specific code in framework packages**
3. **Infrastructure packages only provide adapters** (hooks, composables, services)
4. **Examples demonstrate usage** but are not part of the framework
5. **Clear separation** between framework code and example code

## Migration Notes

The project has been refactored to follow clean architecture principles:
- Example code moved from `packages/presentation/` to `examples/example-*`
- Example domain moved from `packages/example-domain` to `examples/example-domain`
- Domain-specific infrastructure moved to `examples/example-infrastructure`
- Infrastructure packages no longer depend on example code
- Clear separation between framework packages and example packages
