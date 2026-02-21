# @c.a.f/core — Public API

This document lists exactly what the `@c.a.f/core` package exports. These are the domain-agnostic primitives and interfaces that form the CAF architecture.

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
| `IApiClient` | Interface | Base API client interface for HTTP implementations |
| `ApiRequestConfig` | Interface | Configuration for API requests |
| `ApiResponse` | Interface | Standard API response wrapper |
| `ApiError` | Interface | Standard API error response |
| `HttpMethod` | Type | HTTP method types |
| `extractApiData` | Function | Helper to extract data from wrapped API responses |
| `normalizeApiError` | Function | Helper to normalize errors into ApiError format |
| `IRequestHandler` | Interface | Interface for request handler implementations (allows swapping real API, mocks, cached) |
| `PromiseRequestHandler` | Class | Adapter to convert Promise<T> to IRequestHandler<T> |
| `toRequestHandler` | Function | Helper to normalize IRequest<T> or IRequestHandler<T> to IRequestHandler<T> |

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

**Abstract class.** Holds presentation state and notifies subscribers when state changes. **Built on Pulse** (one reactive primitive). Use Ploc for a stateful bloc with structured state and logic (e.g. a screen or feature); use Pulse for a single reactive value.

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

**Class and factory.** Single reactive value: holds a value and notifies listeners when it changes. Use Pulse for one reactive cell (e.g. loading flag, current user); use **Ploc** for a stateful bloc with structured state and logic.

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

**Class.** Wraps an `IRequest<T>` or `IRequestHandler<T>` and exposes reactive `loading`, `data`, and `error` (same shape as `RequestResult`).

```ts
class ApiRequest<T> {
  readonly loading: Pulse<boolean> & { value: boolean };
  readonly data: Pulse<T> & { value: T };
  readonly error: Pulse<Error> & { value: Error };
  constructor(service: IRequest<T> | IRequestHandler<T>);
  mutate(options?: { onSuccess: (data: T) => void }): Promise<{
    loading: ...;
    data: ...;
    error: ...;
  }>;
  onSuccess(onSuccessFn: (data: T) => void): void;
}
```

- **Type parameter:** `T` = response data type.
- **Usage:** Instantiate with a promise-returning service or `IRequestHandler`; call `mutate()` to run the request and update `loading`/`data`/`error`. Subscribe to these for reactive UI. Accepts both `IRequest<T>` (Promise<T>) and `IRequestHandler<T>` for flexibility, allowing swapping implementations (real API, mocks, cached) without changing core.

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

**Interface.** Optional auth configuration for route guards. Core does not use `localStorage` or any browser API; the caller (e.g. your app or infrastructure) provides `isLoggedIn`.

```ts
interface RouteManagerAuthOptions {
  loginPath: string;
  isLoggedIn: () => boolean;
}
```

- **Usage:** Pass as the second argument to `RouteManager` when you want `checkForLoginRoute()` to redirect unauthenticated users. Implement `isLoggedIn` in your application code (e.g. `() => !!localStorage.getItem('token')`). See example apps for reference implementations.

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

- **Usage:** Inject a `RouteRepository` implementation from framework-specific infrastructure packages (`@c.a.f/infrastructure-react`, `@c.a.f/infrastructure-vue`, `@c.a.f/infrastructure-angular`). Optionally pass `RouteManagerAuthOptions` with your application's login path and authentication check. Core remains free of browser/API specifics.

---

## Pulse vs Ploc

| Use **Pulse** when … | Use **Ploc** when … |
|----------------------|----------------------|
| You need a single reactive value (e.g. loading flag, current user, one piece of data). | You have a stateful bloc with structured state and logic (e.g. a screen or feature with multiple states like `'loading' \| 'loaded' \| 'error'`). |
| You are building `RequestResult` / `ApiRequest` (loading, data, error) or similar. | You extend a class, add methods, and drive UI from `state` and `changeState`. |

Ploc is implemented on top of Pulse, so there is one reactive engine; the choice is API and intent.

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
  IApiClient,
  ApiRequestConfig,
  ApiResponse,
  ApiError,
  HttpMethod,
  extractApiData,
  normalizeApiError,
  IRequestHandler,
  PromiseRequestHandler,
  toRequestHandler,
} from '@c.a.f/core';
```

Core has no browser or API specifics; auth behavior is injected via `RouteManagerAuthOptions`.

---

## 10. ApiClient (Request/Response DTO Conventions)

**Interfaces, types, and helpers.** Provides framework-agnostic conventions for API requests and responses. Infrastructure implementations (e.g., Axios, Fetch) can use these types and helpers to standardize their API client implementations.

### IApiClient

**Interface.** Base interface for API client implementations.

```ts
interface IApiClient {
  request<T>(config: ApiRequestConfig): Promise<T>;
}
```

- **Type parameter:** `T` = response data type.
- **Usage:** Infrastructure packages should implement this interface to provide a consistent API client abstraction.

### ApiRequestConfig

**Interface.** Configuration for API requests.

```ts
interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  data?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}
```

- **Usage:** Pass to `IApiClient.request()` to configure HTTP method, URL, body, headers, and query parameters.

### ApiResponse

**Interface.** Standard API response wrapper for APIs that wrap data in a response object.

```ts
interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
  success?: boolean;
}
```

- **Type parameter:** `T` = actual data type.
- **Usage:** Use when your API wraps responses in a standard format. Use `extractApiData()` helper to unwrap.

### ApiError

**Interface.** Standard API error response format.

```ts
interface ApiError {
  message: string;
  code?: string | number;
  errors?: Record<string, string[]>;
  status?: number;
}
```

- **Usage:** Standard format for API errors. Use `normalizeApiError()` helper to convert various error formats.

### HttpMethod

**Type.** HTTP method types.

```ts
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
```

- **Usage:** Specify HTTP method in `ApiRequestConfig`.

### extractApiData

**Function.** Helper to extract data from wrapped API responses.

```ts
function extractApiData<T>(response: T | ApiResponse<T>): T;
```

- **Type parameter:** `T` = data type.
- **Usage:** Handles both direct data and `ApiResponse<T>` formats. Returns the unwrapped data.

### normalizeApiError

**Function.** Helper to normalize errors into `ApiError` format.

```ts
function normalizeApiError(error: unknown): ApiError;
```

- **Usage:** Converts various error formats (Error objects, API error responses, strings) into a standardized `ApiError` format.

### Example Usage

```ts
import { IApiClient, ApiRequestConfig, extractApiData, normalizeApiError } from '@c.a.f/core';

// Infrastructure implementation
class AxiosApiClient implements IApiClient {
  constructor(private axios: AxiosInstance) {}
  
  async request<T>(config: ApiRequestConfig): Promise<T> {
    try {
      const response = await this.axios.request({
        method: config.method,
        url: config.url,
        data: config.data,
        headers: config.headers,
        params: config.params,
      });
      // Extract data if wrapped in ApiResponse format
      return extractApiData<T>(response.data);
    } catch (error) {
      // Normalize error to ApiError format
      throw normalizeApiError(error);
    }
  }
}
```

Core has no browser or API specifics; auth behavior is injected via `RouteManagerAuthOptions`.

---

## 11. Workflow (State Machines)

**Interfaces and utility class.** Provides framework-agnostic interfaces for managing workflows and state machines. Built on top of Ploc for reactive state management.

### IWorkflow

**Interface.** Base interface for workflow implementations.

```ts
interface IWorkflow {
  getState(): WorkflowStateSnapshot;
  dispatch(event: WorkflowEventId, payload?: unknown): Promise<boolean> | boolean;
  canTransition(event: WorkflowEventId): boolean | Promise<boolean>;
  reset(): void | Promise<void>;
  updateContext(context: Partial<WorkflowContext>): void;
  getDefinition(): WorkflowDefinition;
}
```

- **Usage:** Implement to create workflow instances. Can be built on top of Ploc for reactive state management.

### WorkflowDefinition

**Interface.** Definition of a workflow with states and transitions.

```ts
interface WorkflowDefinition {
  id: string;
  initialState: WorkflowStateId;
  states: Record<WorkflowStateId, WorkflowState>;
}
```

- **Usage:** Define your workflow structure with states, transitions, guards, and actions.

### WorkflowState

**Interface.** Definition of a workflow state.

```ts
interface WorkflowState {
  id: WorkflowStateId;
  label?: string;
  transitions: Record<WorkflowEventId, WorkflowTransition>;
  onEnter?: WorkflowAction;
  onExit?: WorkflowAction;
}
```

- **Usage:** Define states with transitions, enter/exit actions, and optional labels.

### WorkflowTransition

**Interface.** Definition of a workflow transition.

```ts
interface WorkflowTransition {
  target: WorkflowStateId;
  guard?: WorkflowGuard;
  action?: WorkflowAction;
}
```

- **Usage:** Define transitions with target state, optional guard (condition check), and optional action.

### WorkflowStateSnapshot

**Interface.** Current workflow state snapshot.

```ts
interface WorkflowStateSnapshot {
  currentState: WorkflowStateId;
  context: WorkflowContext;
  isFinal: boolean;
}
```

- **Usage:** Represents the current state of the workflow, including context data and whether it's in a final state.

### WorkflowManager

**Class.** Workflow manager built on Ploc for reactive state management.

```ts
class WorkflowManager extends Ploc<WorkflowStateSnapshot> implements IWorkflow {
  constructor(definition: WorkflowDefinition, initialContext?: WorkflowContext);
  getState(): WorkflowStateSnapshot;
  dispatch(event: WorkflowEventId, payload?: unknown): Promise<boolean>;
  canTransition(event: WorkflowEventId): boolean;
  reset(): Promise<void>;
  updateContext(context: Partial<WorkflowContext>): void;
  getDefinition(): WorkflowDefinition;
  getCurrentStateDefinition(): WorkflowState | undefined;
  getAvailableTransitions(): Record<WorkflowEventId, WorkflowTransition>;
}
```

- **Usage:** Extends Ploc for reactive state management. Subscribers are notified when workflow state changes. Provides methods to dispatch events, check transitions, and manage workflow context.

### Example Usage

```ts
import { WorkflowManager, WorkflowDefinition } from '@c.a.f/core';

// Define workflow
const orderWorkflow: WorkflowDefinition = {
  id: 'order',
  initialState: 'pending',
  states: {
    pending: {
      id: 'pending',
      label: 'Pending',
      transitions: {
        approve: {
          target: 'approved',
          guard: (context) => context.userRole === 'admin',
        },
        cancel: {
          target: 'cancelled',
        },
      },
      onEnter: async (context) => {
        console.log('Order pending');
      },
    },
    approved: {
      id: 'approved',
      label: 'Approved',
      transitions: {
        ship: {
          target: 'shipped',
        },
      },
    },
    shipped: {
      id: 'shipped',
      label: 'Shipped',
      transitions: {},
    },
    cancelled: {
      id: 'cancelled',
      label: 'Cancelled',
      transitions: {},
    },
  },
};

// Create workflow manager
const workflow = new WorkflowManager(orderWorkflow, { userRole: 'admin' });

// Subscribe to state changes
workflow.subscribe((snapshot) => {
  console.log('Current state:', snapshot.currentState);
  console.log('Is final:', snapshot.isFinal);
});

// Dispatch events
await workflow.dispatch('approve');
await workflow.dispatch('ship');

// Check if transition is available
if (workflow.canTransition('approve')) {
  await workflow.dispatch('approve');
}

// Update context
workflow.updateContext({ orderId: '12345' });

// Reset workflow
await workflow.reset();
```

Core has no browser or API specifics; auth behavior is injected via `RouteManagerAuthOptions`.
