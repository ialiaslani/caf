---
title: Packages
---

# Package structure and dependencies

## Core and shared (framework-agnostic)

| Package | Description | Depends on |
|---------|-------------|------------|
| **@c-a-f/core** | Primitives: UseCase, Ploc, Pulse, ApiRequest, RouteManager, interfaces | Nothing |
| **@c-a-f/validation** | Validation interfaces and Zod/Yup adapters | @c-a-f/core |
| **@c-a-f/workflow** | Workflow and state machine on top of Ploc | @c-a-f/core |
| **@c-a-f/permission** | Permission interfaces and adapters (RBAC, CASL) | @c-a-f/core |
| **@c-a-f/i18n** | i18n interfaces and adapters | @c-a-f/core |
| **@c-a-f/devtools** | DevTools utilities for infrastructure to plug into | — |

## Infrastructure (per-framework)

| Package | Description | Depends on |
|---------|-------------|------------|
| **@c-a-f/infrastructure-react** | usePloc, useUseCase, CAFProvider, useRouteManager, useRouteRepository, CAFErrorBoundary, DevTools | @c-a-f/core, react, react-router-dom (peer) |
| **@c-a-f/infrastructure-vue** | Vue composables and components | @c-a-f/core, vue, vue-router (peer) |
| **@c-a-f/infrastructure-angular** | RouteHandler, injectRouteRepository, RouterService, Ploc/UseCase providers | @c-a-f/core, @angular/core, @angular/router (peer) |

## Tooling

| Package | Description |
|---------|-------------|
| **@c-a-f/testing** | createMockPloc, createMockUseCase, renderWithCAF, provideTestingCAF, etc. |
| **@c-a-f/cli** | caf-init, generate commands |

## Examples (not published)

- **@c-a-f/example-react**, **@c-a-f/example-vue**, **@c-a-f/example-angular** — Framework examples with their own `caf/` folder.
- **example-vue-graphql**, **example-angular-websocket** — GraphQL and WebSocket examples.

**Dependency rule:** Core has no framework dependency. Infrastructure depends only on core (and optional shared packages). Examples depend on core + one or more infrastructure packages.

For the full dependency graph and locations, see [PACKAGES.md](https://github.com/ialiaslani/caf/blob/main/docs/PACKAGES.md) in the repository.
