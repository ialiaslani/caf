# @caf/core

Domain-agnostic primitives for clean architecture frontends: UseCase, Ploc, Pulse, ApiRequest, RouteManager.

## Installation

```bash
npm install @caf/core
```

## Usage

### UseCase

Define application use cases that return `Promise<RequestResult<T>>`:

```typescript
import { UseCase, RequestResult } from '@caf/core';

interface LoginUserArgs {
  username: string;
  password: string;
}

class LoginUser implements UseCase<[LoginUserArgs], { token: string }> {
  async execute(args: LoginUserArgs): Promise<RequestResult<{ token: string }>> {
    // Your login logic here
    const result = await loginService.login(args);
    return {
      loading: pulse(false),
      data: pulse(result),
      error: pulse(null! as Error),
    };
  }
}
```

### Ploc (Presentation Logic Component)

Create stateful presentation logic containers:

```typescript
import { Ploc } from '@caf/core';

interface CounterState {
  count: number;
  isLoading: boolean;
}

class CounterPloc extends Ploc<CounterState> {
  constructor() {
    super({ count: 0, isLoading: false });
  }

  increment() {
    this.changeState({ ...this.state, count: this.state.count + 1 });
  }

  subscribeToState(listener: (state: CounterState) => void) {
    this.subscribe(listener);
  }
}

// Usage
const counter = new CounterPloc();
counter.subscribe((state) => console.log('Count:', state.count));
counter.increment(); // Logs: Count: 1
```

### Pulse (Single Reactive Value)

For single reactive values:

```typescript
import { pulse } from '@caf/core';

const count = pulse(0);
count.subscribe((value) => console.log('Value:', value));
count.value = 5; // Logs: Value: 5
```

### ApiRequest

Wrap async requests with reactive loading/data/error state:

```typescript
import { ApiRequest, IRequestHandler } from '@caf/core';

// Works with Promise (backward compatible)
const fetchUser = new ApiRequest(fetch('/api/user').then(r => r.json()));

// Or with IRequestHandler for flexibility (real API, mocks, cached)
class ApiRequestHandler<T> implements IRequestHandler<T> {
  constructor(private apiCall: () => Promise<T>) {}
  async execute(): Promise<T> {
    return await this.apiCall();
  }
}

const userRequest = new ApiRequest(
  new ApiRequestHandler(() => fetch('/api/user').then(r => r.json()))
);

userRequest.loading.subscribe((loading) => {
  if (loading) console.log('Loading...');
});

userRequest.data.subscribe((data) => {
  console.log('User:', data);
});

await userRequest.mutate();
```

### RouteManager

Coordinate routing (requires a RouteRepository implementation from your framework):

```typescript
import { RouteManager, RouteRepository } from '@caf/core';

// Your framework adapter implements RouteRepository
const routeRepository: RouteRepository = {
  currentRoute: '/',
  change: (route) => router.push(route),
};

const routeManager = new RouteManager(routeRepository, {
  loginPath: '/login',
  isLoggedIn: () => !!localStorage.getItem('token'),
});

routeManager.changeRoute('/dashboard');
routeManager.checkForLoginRoute(); // Redirects to /login if not authenticated
```


## Exports

- `UseCase` — Interface for application use cases
- `Ploc` — Abstract class for presentation logic containers
- `Pulse` — Class for single reactive values
- `pulse` — Factory function for creating Pulse instances
- `ApiRequest` — Class for wrapping async requests
- `RouteManager` — Class for coordinating routing
- `RouteRepository` — Interface for routing system abstraction
- `RouteManagerAuthOptions` — Interface for auth configuration
- `RequestResult` — Type for use case results
- `IRequest` — Type for async requests
- `IApiClient` — Interface for API client implementations
- `ApiRequestConfig` — Interface for API request configuration
- `ApiResponse` — Interface for standard API response wrapper
- `ApiError` — Interface for standard API error format
- `HttpMethod` — Type for HTTP method types
- `extractApiData` — Helper function to extract data from wrapped responses
- `normalizeApiError` — Helper function to normalize errors
- `IRequestHandler` — Interface for request handler implementations (allows swapping real API, mocks, cached)
- `PromiseRequestHandler` — Adapter class to convert Promise<T> to IRequestHandler<T>
- `toRequestHandler` — Helper function to normalize requests to IRequestHandler

## Documentation

- **[Full API Documentation](../../docs/API.md)** — Complete API reference
- **[Main Repository README](../../README.md)** — Architecture overview and getting started
- **[Publishing Guide](../../docs/PUBLISHING.md)** — How to publish and consume packages
- **[Versioning Strategy](../../docs/VERSIONING.md)** — Versioning approach

## License

MIT
