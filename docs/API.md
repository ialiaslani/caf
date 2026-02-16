# @caf/core — Public API

This document lists exactly what the `@caf/core` package exports. These are the domain-agnostic primitives and interfaces that form the CAF architecture.

---

## Exports overview

| Export | Kind | Description |
|--------|------|-------------|
| `UseCase` | Interface | Contract for application use cases |
| `Ploc` | Class | Presentation logic container with reactive state |
| `Pulse` | Class | Observable value container |
| `pulse` | Function | Factory for creating a `Pulse` instance |
| `ApiRequest` | Class | Wraps an async request with loading/data/error state |
| `RouteManager` | Class | Coordinates routing (depends on `RouteRepository`); optional auth guard via `RouteManagerAuthOptions` |
| `RouteManagerAuthOptions` | Interface | Optional auth config for login redirect (no browser APIs in core) |
| `RouteRepository` | Interface | Abstraction for the routing system |
| `RequestResult` | Type | Shape of loading/data/error for use cases |
| `IRequest` | Type | Promise-like type for async requests |

---

## 1. UseCase

**Interface.** Represents a single application use case (command or query).

```ts
interface UseCase<A extends any[], T> {
  execute: (...args: A) => Promise<RequestResult<T>>;
}
```

- **Type parameters:** `A` = tuple of arguments, `T` = result data type.
- **Returns:** `Promise<RequestResult<T>>` (see `RequestResult` below).
- Implement this interface for each application operation (e.g. `LoginUser`, `GetUsers`).

---

## 2. Ploc (Presentation Logic Component)

**Abstract class.** Holds presentation state and notifies subscribers when state changes.

```ts
abstract class Ploc<S> {
  constructor(internalState: S);
  get state(): S;
  changeState(state: S): void;
  subscribe(listener: (state: S) => void): void;
  unsubscribe(listener: (state: S) => void): void;
}
```

- **Type parameter:** `S` = state type.
- **Usage:** Extend `Ploc<S>` in your UI layer; call `changeState` when use cases complete; subscribe from the view to re-render.

---

## 3. Pulse and pulse

**Class and factory.** Reactive value container: holds a value and notifies listeners when the value changes.

```ts
class Pulse<T> {
  // Proxied so that .value is readable/writable
  value: T;  // (via proxy)
  subscribe(listener: (value: T) => void): void;
  unsubscribe(listener: (value: T) => void): void;
}

function pulse<T>(initialValue: T): Pulse<T> & { value: T };
```

- **Type parameter:** `T` = value type.
- **Usage:** Create with `pulse(initialValue)`. Read/write `.value`; subscribe to be notified on change. Used inside `RequestResult` and `ApiRequest`.

---

## 4. RequestResult

**Type.** Describes the reactive state of an async operation (e.g. a use case).

```ts
type RequestResult<T> = {
  loading: Pulse<boolean> & { value: boolean };
  data: Pulse<T> & { value: T };
  error: Pulse<Error> & { value: Error };
};
```

- **Type parameter:** `T` = success payload type.
- **Usage:** Use cases return `Promise<RequestResult<T>>`; the UI subscribes to `loading`, `data`, and `error` to show loading state, result, or error.

---

## 5. IRequest

**Type.** Represents an async request (e.g. a repository call).

```ts
type IRequest<T> = Promise<T>;
```

- **Type parameter:** `T` = resolved value type.
- **Usage:** Implemented by infrastructure (e.g. HTTP calls). Passed into `ApiRequest` or used to build `RequestResult` in use cases.

---

## 6. ApiRequest

**Class.** Wraps an `IRequest<T>` and exposes reactive `loading`, `data`, and `error` (same shape as `RequestResult`).

```ts
class ApiRequest<T> {
  readonly loading: Pulse<boolean> & { value: boolean };
  readonly data: Pulse<T> & { value: T };
  readonly error: Pulse<Error> & { value: Error };
  constructor(service: IRequest<T>);
  mutate(options?: { onSuccess: (data: T) => void }): Promise<{
    loading: ...;
    data: ...;
    error: ...;
  }>;
  onSuccess(onSuccessFn: (data: T) => void): void;
}
```

- **Type parameter:** `T` = response data type.
- **Usage:** Instantiate with a promise-returning service; call `mutate()` to run the request and update `loading`/`data`/`error`. Subscribe to these for reactive UI.

---

## 7. RouteRepository

**Interface.** Abstraction for the routing system (framework-agnostic).

```ts
interface RouteRepository {
  currentRoute: string;
  change(route: string): void;
}
```

- **Usage:** Implement in infrastructure (e.g. React Router, Vue Router). Injected into `RouteManager`.

---

## 8. RouteManagerAuthOptions

**Interface.** Optional auth configuration for route guards. Core does not use `localStorage` or any browser API; the caller (e.g. infrastructure or example-domain) provides `isLoggedIn`.

```ts
interface RouteManagerAuthOptions {
  loginPath: string;
  isLoggedIn: () => boolean;
}
```

- **Usage:** Pass as the second argument to `RouteManager` when you want `checkForLoginRoute()` to redirect unauthenticated users. Implement `isLoggedIn` in infrastructure (e.g. `() => !!localStorage.getItem(TOKEN_KEY)` with `TOKEN_KEY` from your app or example-domain).

---

## 9. RouteManager

**Class.** Coordinates navigation using a `RouteRepository`. Optionally accepts auth options for a login redirect guard.

```ts
class RouteManager {
  constructor(
    routingSystem: RouteRepository,
    authOptions?: RouteManagerAuthOptions
  );
  checkForLoginRoute(): void;   // no-op if authOptions not set; else redirects to loginPath when not logged in
  isUserLoggedIn(): boolean;    // returns authOptions?.isLoggedIn() ?? false
  changeRoute(route: string): void;
}
```

- **Usage:** Inject a `RouteRepository` implementation. Optionally pass `RouteManagerAuthOptions` from infrastructure (e.g. using `LOGIN_PATH` and `TOKEN_KEY` from `@caf/example-domain` and `localStorage`). Core remains free of browser/API specifics.

---

## Dependency direction

- **Core** does not depend on any app domain, UI framework, or HTTP client.
- **UseCase** and **RequestResult** / **IRequest** are used by the application layer.
- **Ploc** and **Pulse** / **pulse** are used by the presentation layer.
- **RouteRepository** is implemented by infrastructure; **RouteManager** consumes it.
- **ApiRequest** bridges async services (IRequest) and reactive state (Pulse).

---

## Entrypoint

Consumers should import from the package root:

```ts
import {
  UseCase,
  Ploc,
  Pulse,
  pulse,
  ApiRequest,
  RouteManager,
  RouteManagerAuthOptions,
  RouteRepository,
  RequestResult,
  IRequest,
} from '@caf/core';
```

Core has no browser or API specifics; auth behavior is injected via `RouteManagerAuthOptions`.
