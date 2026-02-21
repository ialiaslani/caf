---
title: API Reference
---

# @c-a-f/core — Public API

The `@c-a-f/core` package exports domain-agnostic primitives and interfaces.

## Exports overview

| Export | Kind | Description |
|--------|------|-------------|
| `UseCase` | Interface | Contract for application use cases |
| `Ploc` | Class | Presentation logic container with reactive state |
| `Pulse` | Class | Observable value container |
| `pulse` | Function | Factory for creating a `Pulse` instance |
| `ApiRequest` | Class | Wraps an async request with loading/data/error state |
| `RouteManager` | Class | Coordinates routing; optional auth via `RouteManagerAuthOptions` |
| `RouteManagerAuthOptions` | Interface | Optional auth config for login redirect |
| `RouteRepository` | Interface | Abstraction for the routing system |
| `RequestResult` | Type | Shape of loading/data/error for use cases |
| `IRequest`, `IRequestHandler` | Type / Interface | Async request types |
| `IApiClient`, `ApiRequestConfig`, `ApiResponse`, `ApiError` | Interface | API client and response types |
| `extractApiData`, `normalizeApiError` | Function | Helpers for API responses and errors |
| `PromiseRequestHandler`, `toRequestHandler` | Class / Function | Adapters for request handlers |

## UseCase

```ts
interface UseCase<A extends any[], T> {
  execute: (...args: A) => Promise<RequestResult<T>>;
}
```

## Ploc

```ts
abstract class Ploc<S> {
  constructor(initialState: S);
  get state(): S;
  changeState(state: S): void;
  subscribe(listener: (state: S) => void): void;
  unsubscribe(listener: (state: S) => void): void;
}
```

## Pulse and pulse

```ts
function pulse<T>(initialValue: T): Pulse<T> & { value: T };
// Pulse: .value, .subscribe(), .unsubscribe()
```

## RequestResult

```ts
type RequestResult<T> = {
  loading: Pulse<boolean> & { value: boolean };
  data: Pulse<T> & { value: T };
  error: Pulse<Error> & { value: Error };
};
```

## RouteRepository and RouteManager

```ts
interface RouteRepository {
  currentRoute: string;
  change(route: string): void;
}

class RouteManager {
  constructor(routingSystem: RouteRepository, authOptions?: RouteManagerAuthOptions);
  checkForLoginRoute(): void;
  isUserLoggedIn(): boolean;
  changeRoute(route: string): void;
}
```

For the full API with examples, see the [API.md](https://github.com/ialiaslani/caf/blob/main/docs/API.md) file in the repository.
