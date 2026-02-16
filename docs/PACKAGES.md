# Package Structure and Dependencies

## Framework Packages (Publishable)

### @c.a.f/core
- **Exports:** Primitives only (UseCase, Ploc, Pulse, pulse, ApiRequest, RouteManager, RouteRepository, RouteManagerAuthOptions, RequestResult, IRequest, IRequestHandler, etc.). No domain-specific code.
- **Depends on:** Nothing (dependency-free).
- **Location:** `packages/core/`

### @c.a.f/validation
- **Exports:** Validation interfaces and adapters for Zod/Yup.
- **Depends on:** `@c.a.f/core` only.
- **Location:** `packages/validation/`

### @c.a.f/infrastructure-axios
- **Exports:** Generic HTTP client utilities (reserved for future use).
- **Depends on:** `@c.a.f/core` and `axios`.
- **Location:** `packages/infrastructure/axios/`
- **Note:** Domain-specific repository implementations have been moved to `@c.a.f/example-infrastructure`.

### @c.a.f/infrastructure-react
- **Exports:** React-specific adapters (`useRouteManager`, `useRouteRepository` hooks).
- **Depends on:** `@c.a.f/core` and `react-router-dom` (peer: `react`).
- **Location:** `packages/infrastructure/react/`

### @c.a.f/infrastructure-vue
- **Exports:** Vue-specific adapters (`useRouteManager`, `useRouteRepository` composables).
- **Depends on:** `@c.a.f/core` and `vue-router` (peer: `vue`).
- **Location:** `packages/infrastructure/vue/`

### @c.a.f/infrastructure-angular
- **Exports:** Angular-specific adapters (`RouterService`, `RouteHandler`).
- **Depends on:** `@c.a.f/core` and `@angular/router` (peer: `@angular/core`).
- **Location:** `packages/infrastructure/angular/`

## Example Packages (Not Publishable)

### @c.a.f/example-domain
- **Exports:** Example domain implementation (User, Login, IUserRepository, ILoginRepository, UserService, LoginService, and use cases: LoginUser, LogoutUser, GetUsers, AddUser).
- **Depends on:** `@c.a.f/core` only.
- **Location:** `examples/example-domain/`
- **Purpose:** Reference implementation showing how to structure your domain layer.

### @c.a.f/example-infrastructure
- **Exports:** Example infrastructure implementations (LoginApi, LogoutApi, UserApi, LoginRepository, UserRepository).
- **Depends on:** `@c.a.f/core`, `@c.a.f/example-domain`, and `axios`.
- **Location:** `examples/example-infrastructure/`
- **Purpose:** Reference implementation showing how to structure your infrastructure layer.

### @c.a.f/example-react
- **Exports:** React example application.
- **Depends on:** `@c.a.f/core`, `@c.a.f/example-domain`, `@c.a.f/example-infrastructure`, `@c.a.f/infrastructure-react`, and React libraries.
- **Location:** `examples/example-react/`
- **Purpose:** Complete example React application demonstrating CAF usage.

### @c.a.f/example-vue
- **Exports:** Vue example application.
- **Depends on:** `@c.a.f/core`, `@c.a.f/example-domain`, `@c.a.f/infrastructure-vue`, and Vue libraries.
- **Location:** `examples/example-vue/`
- **Purpose:** Complete example Vue application demonstrating CAF usage.

### @c.a.f/example-angular
- **Exports:** Angular example application.
- **Depends on:** `@c.a.f/core`, `@c.a.f/example-domain`, `@c.a.f/infrastructure-angular`, and Angular libraries.
- **Location:** `examples/example-angular/`
- **Purpose:** Complete example Angular application demonstrating CAF usage.

## Dependency Graph

```
Framework Packages (Publishable):
┌─────────────────┐
│   @c.a.f/core     │ (no dependencies)
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
│ @c.a.f/core       │
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
