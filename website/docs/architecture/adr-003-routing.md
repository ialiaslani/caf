---
title: ADR-003 — Routing abstraction
---

# ADR-003: Routing abstraction (RouteManager / RouteRepository)

## Status

Accepted.

## Context

Frontend applications need routing (current route, navigate, optional auth guards). Frameworks provide different APIs. We want application and domain code free of framework routing imports, reuse of the same routing logic across React/Vue/Angular, and testability with a mock.

## Decision

We introduce in `@c-a-f/core`:

### RouteRepository (interface)

- **`currentRoute: string`** — Current route (path or pathname).
- **`change(route: string): void`** — Navigate to the given route.

Implementations live in infrastructure (React: `useRouteRepository`; Vue: composable; Angular: `RouteHandler` + `injectRouteRepository`).

### RouteManager (class)

- **Constructor:** `RouteManager(routingSystem: RouteRepository, authOptions?: RouteManagerAuthOptions)`.
- **`authOptions`** (optional): `{ loginPath: string; isLoggedIn: () => boolean }`.
- **`checkForLoginRoute(): void`** — Redirects to login if not authenticated.
- **`isUserLoggedIn(): boolean`** — Delegates to `authOptions.isLoggedIn()`.
- **`changeRoute(route: string): void`** — Delegates to `routingSystem.change(route)`.

## Consequences

**Positive:** Domain and application stay framework-agnostic; same routing and auth logic across frameworks; easy to test with a mock `RouteRepository`.

**Negative:** Abstraction is minimal (no guards, nested routes, params in the interface); `currentRoute` as string may need normalization per framework.
