# Package Structure and Dependencies

## Framework Packages (Publishable)

### @c-a-f/core
- **Exports:** Primitives only (UseCase, Ploc, Pulse, pulse, ApiRequest, RouteManager, RouteRepository, RouteManagerAuthOptions, RequestResult, IRequest, IRequestHandler, etc.). No domain-specific code.
- **Depends on:** Nothing (dependency-free).
- **Location:** `packages/core/`

### @c-a-f/validation
- **Exports:** Validation interfaces and adapters for Zod/Yup.
- **Depends on:** `@c-a-f/core` only.
- **Location:** `packages/validation/`

### @c-a-f/permission
- **Exports:** Permission interfaces and adapters (role-based, policy-based, CASL, resource-based, hierarchical, time-based, simple).
- **Depends on:** `@c-a-f/core` only. Optional peer: `@casl/ability` for CASL adapter.
- **Location:** `packages/permission/`

### @c-a-f/i18n
- **Exports:** Translation interfaces and adapters (i18next, vue-i18n, ngx-translate, react-intl, next-intl, Intl API).
- **Depends on:** `@c-a-f/core` only. Optional peers: i18n libraries for respective adapters.
- **Location:** `packages/i18n/`

### @c-a-f/infrastructure-react
- **Exports:** React-specific adapters (`useRouteManager`, `useRouteRepository` hooks).
- **Depends on:** `@c-a-f/core` and `react-router-dom` (peer: `react`).
- **Location:** `packages/infrastructure/react/`

### @c-a-f/infrastructure-vue
- **Exports:** Vue-specific adapters (`useRouteManager`, `useRouteRepository` composables).
- **Depends on:** `@c-a-f/core` and `vue-router` (peer: `vue`).
- **Location:** `packages/infrastructure/vue/`

### @c-a-f/infrastructure-angular
- **Exports:** Angular-specific adapters (`RouterService`, `RouteHandler`, Provider, Ploc, UseCase, ErrorBoundary, DevTools).
- **Depends on:** `@c-a-f/core` and `@angular/router` (peer: `@angular/core`).
- **Location:** `packages/infrastructure/angular/`

## Example Packages (Not Publishable)

Examples live under `examples/`. Each contains its own **`caf/`** folder (domain, application, infrastructure); there is no separate `@c-a-f/example-domain` package.

### @c-a-f/example-react
- **Location:** `examples/example-react/`
- **Depends on:** `@c-a-f/core`, `@c-a-f/infrastructure-react`, and React libraries.
- **Purpose:** React example with `caf/` domain, application, and mock REST infrastructure.

### @c-a-f/example-vue
- **Location:** `examples/example-vue/`
- **Depends on:** `@c-a-f/core`, `@c-a-f/infrastructure-vue`, and Vue libraries.
- **Purpose:** Vue example with its own `caf/` layers.

### @c-a-f/example-angular
- **Location:** `examples/example-angular/`
- **Depends on:** `@c-a-f/core`, `@c-a-f/infrastructure-angular`, and Angular libraries.
- **Purpose:** Angular example with its own `caf/` layers.

### example-vue-graphql
- **Location:** `examples/example-vue-graphql/`
- **Purpose:** Vue + GraphQL; same `caf/` structure, GraphQL infrastructure instead of REST.

### example-angular-websocket
- **Location:** `examples/example-angular-websocket/`
- **Purpose:** Angular + WebSocket; same `caf/` structure, WebSocket infrastructure and real-time updates.

## Dependency Graph

```
Framework Packages (Publishable):
┌─────────────────┐
│   @c-a-f/core    │ (no dependencies)
└────────┬────────┘
         │
    ┌────┴────┬────────┬────────┬──────────────┬──────────────┬──────────────┐
    │         │        │        │              │              │              │
┌───▼───┐ ┌──▼──┐ ┌───▼───┐ ┌──▼──────┐ ┌───▼──────┐ ┌─────▼──────┐
│validation│ │permission│ │  i18n   │ │infrastructure│ │infrastructure│ │infrastructure│
│          │ │         │ │        │ │   -react     │ │   -vue      │ │  -angular   │
└──────────┘ └─────────┘ └────────┘ └────────────┘ └────────────┘ └─────────────┘

Example Packages (Not Publishable):
Each example has its own caf/ (domain + application + infrastructure).
┌────────────┬────────────┬────────────┬─────────────────────┬─────────────────────────┐
│example-react│ example-vue │example-angular│ example-vue-graphql │ example-angular-websocket │
└────────────┴────────────┴────────────┴─────────────────────┴─────────────────────────┘
```

## Key Principles

1. **Framework packages are framework-agnostic** (except infrastructure-* packages)
2. **No domain-specific code in framework packages**
3. **Infrastructure packages only provide adapters** (hooks, composables, services)
4. **Examples demonstrate usage** — each includes a `caf/` folder; no shared example-domain package
5. **Clear separation** between framework code and example code

## Migration Notes

- Example code lives under `examples/example-*`.
- Each example is self-contained with its own `caf/domain`, `caf/application`, and `caf/infrastructure`.
- There is no `@c-a-f/example-domain` package; domain and application are in-repo per example.
- Infrastructure packages do not depend on any example code.
