# ADR-003: Routing abstraction (RouteManager / RouteRepository)

## Status

Accepted.

## Context

Frontend applications need routing (current route, navigate to route, optional auth guards). Frameworks provide different APIs (React Router, Vue Router, Angular Router). We want:

1. **Application and domain code** to be free of framework-specific routing imports.
2. **Reuse of the same routing logic** (e.g. “redirect to login if not authenticated”) across React, Vue, and Angular.
3. **Testability** of routing behavior with a simple in-memory or mock implementation.

So we need a **thin abstraction** over “get current route” and “change route,” plus optional auth behavior, implemented once in the core and bound to each framework in infrastructure packages.

## Decision

We introduce in `@c-a-f/core`:

### RouteRepository (interface)

- **`currentRoute: string`** — Current route (path or pathname).
- **`change(route: string): void`** — Navigate to the given route.

Implementations live in infrastructure:

- **React:** `useRouteRepository()` using React Router’s `useNavigate` and `useLocation`.
- **Vue:** `useRouteRepository()` using Vue Router’s `useRouter` and `useRoute`.
- **Angular:** `RouteHandler` (implements `RouteRepository`) + `injectRouteRepository()` using Angular’s `Router`.

Application code depends only on `RouteRepository`; it never imports from React Router, Vue Router, or Angular Router.

### RouteManager (class)

- **Constructor:** `RouteManager(routingSystem: RouteRepository, authOptions?: RouteManagerAuthOptions)`.
- **`authOptions`** (optional): `{ loginPath: string; isLoggedIn: () => boolean }`.
- **`checkForLoginRoute(): void`** — If auth options are set and the user is not logged in and current route is not the login path, calls `routingSystem.change(loginPath)`.
- **`isUserLoggedIn(): boolean`** — Delegates to `authOptions.isLoggedIn()` when present.
- **`changeRoute(route: string): void`** — Delegates to `routingSystem.change(route)`.

Auth is optional so apps that don’t need login redirect can use `RouteManager` with only a `RouteRepository`. The “is logged in” check is provided by the app (e.g. from a token store or auth Ploc).

## Consequences

**Positive:**

- Domain and application layers stay framework-agnostic; no `react-router`, `vue-router`, or `@angular/router` in core or in shared use cases/Plocs.
- Same routing and auth logic (e.g. “redirect to login”) is reused across all supported frameworks via a single `RouteManager` API.
- Easy to test: pass a mock `RouteRepository` (e.g. in-memory currentRoute + change stub) and unit-test `RouteManager` and any code that uses it.
- Framework-specific wiring is limited to infrastructure (hooks/services that implement `RouteRepository` and optionally create `RouteManager` with auth options).

**Negative:**

- Abstraction is minimal (current route + change); advanced features (guards, nested routes, params) are not part of the interface. Apps can still use framework router for those and only use `RouteManager` for high-level “go to login” / “change route” behavior.
- `currentRoute` as a string may not match every framework’s notion of “route” (e.g. full URL vs pathname); implementations normalize as needed (e.g. use `location.pathname` or `router.currentRoute.value.path`).

**References:**

- `@c-a-f/core`: `RouteRepository`, `RouteManager`, `RouteManagerAuthOptions` (`packages/core/src/Route`).
- Infrastructure: React (`useRouteManager`, `useRouteRepository`), Vue (composables), Angular (`RouteHandler`, `injectRouteRepository`, `RouterService`).
