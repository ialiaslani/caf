---
title: "@c-a-f/core"
sidebar_label: Core
---

# @c-a-f/core

Domain-agnostic primitives for Clean Architecture frontends. No framework dependency — use with React, Vue, Angular, or any future framework.

## Installation

```bash
npm install @c-a-f/core
```

## Features

| Feature | Description |
|--------|-------------|
| **UseCase** | Interface for application commands/queries. `execute(...args)` returns `Promise<RequestResult<T>>`. |
| **Ploc** | Presentation Logic Component — stateful bloc with structured state. Built on Pulse. |
| **Pulse** | Single reactive value; subscribe to changes. Use for one value (e.g. loading flag). |
| **pulse()** | Factory to create a Pulse instance. |
| **ApiRequest** | Wraps async requests with reactive loading/data/error state. |
| **RouteManager** | Coordinates routing; optional auth (login redirect). Depends on `RouteRepository`. |
| **RouteRepository** | Interface: `currentRoute` and `change(route)`. Your framework implements it. |
| **RouteManagerAuthOptions** | `{ loginPath, isLoggedIn }` for optional auth. |
| **RequestResult** | Type: `{ loading, data, error }` (each a Pulse). |
| **IRequest, IRequestHandler** | Async request types; swap real API, mocks, cached. |
| **PromiseRequestHandler, toRequestHandler** | Adapters from Promise or IRequest to IRequestHandler. |
| **IApiClient, ApiRequestConfig, ApiResponse, ApiError** | API client and response types. |
| **extractApiData, normalizeApiError** | Helpers for wrapped responses and errors. |
| **HttpMethod** | HTTP method type. |

## UseCase

Define application use cases that return `RequestResult`:

```typescript
import { UseCase, RequestResult, pulse } from '@c-a-f/core';

class GetUsers implements UseCase<[], User[]> {
  async execute(): Promise<RequestResult<User[]>> {
    const loading = pulse(true);
    const data = pulse([] as User[]);
    const error = pulse(null as unknown as Error);
    try {
      const users = await this.repo.getUsers();
      data.value = users;
      return { loading, data, error };
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
      return { loading, data, error };
    } finally {
      loading.value = false;
    }
  }
}
```

## Ploc

Stateful presentation logic with structured state:

```typescript
import { Ploc } from '@c-a-f/core';

class CounterPloc extends Ploc<{ count: number }> {
  constructor() {
    super({ count: 0 });
  }
  increment() {
    this.changeState({ ...this.state, count: this.state.count + 1 });
  }
}

const counter = new CounterPloc();
counter.subscribe((state) => console.log(state.count));
counter.increment();
```

## Pulse

Single reactive value:

```typescript
import { pulse } from '@c-a-f/core';

const count = pulse(0);
count.subscribe((v) => console.log(v));
count.value = 5;
```

## ApiRequest

Wrap async requests with loading/data/error:

```typescript
import { ApiRequest, IRequestHandler } from '@c-a-f/core';

const fetchUser = new ApiRequest(fetch('/api/user').then(r => r.json()));

// Or with IRequestHandler (real API, mocks, cached)
class ApiRequestHandler<T> implements IRequestHandler<T> {
  constructor(private apiCall: () => Promise<T>) {}
  async execute(): Promise<T> { return await this.apiCall(); }
}
const userRequest = new ApiRequest(new ApiRequestHandler(() => fetch('/api/user').then(r => r.json())));

userRequest.loading.subscribe((loading) => { if (loading) console.log('Loading...'); });
userRequest.data.subscribe((data) => console.log('User:', data));
await userRequest.mutate();
```

## RouteManager and RouteRepository

Application code uses `RouteManager`; infrastructure implements `RouteRepository`:

```typescript
import { RouteManager, RouteRepository, RouteManagerAuthOptions } from '@c-a-f/core';

const repo: RouteRepository = {
  get currentRoute() { return pathname; },
  change(route) { navigate(route); },
};
const auth: RouteManagerAuthOptions = {
  loginPath: '/login',
  isLoggedIn: () => !!token,
};
const manager = new RouteManager(repo, auth);
manager.checkForLoginRoute();  // redirects to login if not authenticated
manager.isUserLoggedIn();
manager.changeRoute('/dashboard');
```

## Exports (full list)

- **UseCase** — Interface for application use cases  
- **Ploc** — Abstract class for presentation logic containers  
- **Pulse** — Class for single reactive values  
- **pulse** — Factory for Pulse instances  
- **ApiRequest** — Class for wrapping async requests  
- **RouteManager** — Class for coordinating routing  
- **RouteRepository** — Interface for routing system  
- **RouteManagerAuthOptions** — Interface for auth configuration  
- **RequestResult** — Type for use case results  
- **IRequest** — Type for async requests  
- **IRequestHandler** — Interface for request handler implementations  
- **PromiseRequestHandler** — Adapter Promise&lt;T&gt; → IRequestHandler&lt;T&gt;  
- **toRequestHandler** — Normalize IRequest or IRequestHandler to IRequestHandler  
- **IApiClient** — Interface for API client implementations  
- **ApiRequestConfig** — Interface for API request configuration  
- **ApiResponse** — Interface for standard API response wrapper  
- **ApiError** — Interface for standard API error format  
- **HttpMethod** — Type for HTTP methods  
- **extractApiData** — Helper to extract data from wrapped responses  
- **normalizeApiError** — Helper to normalize errors  

## Dependencies

None. Core is dependency-free.
