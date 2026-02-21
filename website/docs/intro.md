---
sidebar_position: 1
title: Introduction
---

# CAF — Clean Architecture Frontend

**Clean Architecture Frontend** is a core library that provides **framework-agnostic primitives** for building frontend applications with Clean Architecture. The same domain logic and use cases can run in **React**, **Vue**, **Angular**, or any future framework by swapping adapters.

## What is CAF?

CAF gives you:

- **Framework-agnostic core** — Write business logic once, use it in any framework
- **Clean Architecture** — Clear separation of domain, application, and infrastructure layers
- **Reactive primitives** — A single reactive engine (**Pulse**) for state; **Ploc** for presentation logic
- **Pluggable adapters** — Implement interfaces for routing, HTTP, and UI frameworks
- **Type-safe** — Full TypeScript support

## Core concepts

| Concept | Role |
|--------|------|
| **Pulse** | Single reactive value (like a cell). Use for one value (e.g. loading flag, current user). |
| **Ploc** | Presentation Logic Component — stateful bloc with structured state and logic. Built on Pulse. |
| **UseCase** | Application operation (command or query). Returns `RequestResult<T>` (loading, data, error). |
| **RouteRepository** | Interface for routing. Your framework implements it; **RouteManager** uses it for auth and navigation. |

## Packages

- **`@c-a-f/core`** — Primitives: `UseCase`, `Ploc`, `Pulse`, `ApiRequest`, `RouteManager`, interfaces
- **`@c-a-f/infrastructure-react`** — React hooks: `usePloc`, `useUseCase`, `CAFProvider`, `useRouteManager`, `useRouteRepository`
- **`@c-a-f/infrastructure-vue`** — Vue composables and providers
- **`@c-a-f/infrastructure-angular`** — Angular services and injectors
- **`@c-a-f/validation`**, **`@c-a-f/workflow`**, **`@c-a-f/permission`**, **`@c-a-f/i18n`** — Optional modules

## Next steps

- [Packages](/docs/packages/core) — Each CAF package explained (Core, React, Vue, Angular, Validation, Testing, etc.)
- [Getting Started](/docs/getting-started) — Install and run your first CAF app
- [Best Practices](/docs/guides/best-practices) — Folder structure, DI, error handling, testing
- [Architecture decisions](/docs/architecture/decisions) — Why we chose the `caf/` folder, Pulse vs Ploc, routing, packages
