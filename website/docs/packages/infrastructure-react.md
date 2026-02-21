---
title: "@c-a-f/infrastructure-react"
sidebar_label: Infrastructure React
---

# @c-a-f/infrastructure-react

React-specific adapters for CAF: hooks for Ploc/UseCase, provider, error boundary, routing, and DevTools integration.

## Installation

```bash
npm install @c-a-f/infrastructure-react react react-router-dom
```

## Features

| Feature | Description |
|--------|-------------|
| **usePloc** | Subscribe to a Ploc; returns `[state, ploc]`. Cleans up on unmount. |
| **useUseCase** | Execute a UseCase with loading/error/data state. Returns `{ execute, loading, error, data }`. |
| **CAFProvider** | Provides Plocs and UseCases by key. Children use context hooks. |
| **useCAFContext** | Read the CAF context (`plocs` and `useCases` registries). |
| **usePlocFromContext** | Get a Ploc by key from the nearest CAFProvider. Returns `undefined` if key missing. |
| **useUseCaseFromContext** | Get a UseCase by key from context. Returns `undefined` if key missing. |
| **CAFErrorBoundary** | Catches render/lifecycle errors; custom fallback and onError. |
| **useCAFError** | Access error context from within CAFErrorBoundary. |
| **useRouteManager** | Returns a RouteManager (optional auth options). Uses React Router. |
| **useRouteRepository** | Returns a RouteRepository implementation (useNavigate, useLocation). |
| **useCAFDevTools** | Central DevTools for all Plocs/UseCases; enable/disable globally. |
| **usePlocDevTools** | DevTools for a single Ploc: state history, time-travel, optional memory leak detection. |
| **useUseCaseDevTools** | DevTools for UseCase execution: wrap UseCase, get execution history and statistics. |
| **useTrackPloc** | Register a Ploc with DevTools automatically. |
| **CAFContext** | React context used by CAFProvider (advanced use). |

## usePloc

```tsx
const [state, ploc] = usePloc(userPloc);
return <span>{state.name}</span>;
```

## useUseCase

```tsx
const { execute, loading, error, data } = useUseCase(createUserUseCase);
await execute({ name, email });
if (error) return <ErrorMessage error={error} />;
```

## CAFProvider and context

Register Plocs and UseCases at the app root; consume by key in any descendant:

```tsx
<CAFProvider plocs={{ user: userPloc }} useCases={{ createUser: createUserUseCase }}>
  <App />
</CAFProvider>

// In a child:
const ploc = usePlocFromContext<UserPloc>('user');
const useCase = useUseCaseFromContext<[CreateUserInput], User>('createUser');
if (!ploc) return null;
const [state] = usePloc(ploc);
```

Nested providers do not merge; prefer one root provider with all keys.

## CAFErrorBoundary

Catches errors during rendering, in lifecycle methods, and from Ploc/UseCase when not caught locally:

```tsx
<CAFErrorBoundary
  fallback={(error, errorInfo, reset) => (
    <div><p>{error.message}</p><button onClick={reset}>Try again</button></div>
  )}
  onError={(err, info) => log(err, info)}
>
  <App />
</CAFErrorBoundary>
```

Access error context: `useCAFError()` returns `{ error, errorInfo, resetError }`.

## useRouteManager

```tsx
const routeManager = useRouteManager({
  loginPath: '/login',
  isLoggedIn: () => !!localStorage.getItem('token'),
});
routeManager.checkForLoginRoute();
routeManager.changeRoute('/dashboard');
```

## useRouteRepository

When you need a `RouteRepository` and will build `RouteManager` yourself:

```tsx
const routeRepository = useRouteRepository();
const routeManager = new RouteManager(routeRepository, authOptions);
```

## DevTools

- **usePlocDevTools(ploc, options)** — State history, time-travel (previousState, nextState, jumpToState), optional leak detection.
- **useUseCaseDevTools(options)** — Wrap UseCase with `wrap(useCase)`; get execution history and statistics.
- **useCAFDevTools(options)** — Central toggle; track all Plocs/UseCases.
- **useTrackPloc(ploc, name)** — Register a Ploc with DevTools.

Data is exposed to `window.__CAF_DEVTOOLS__` for React DevTools extension integration.

## Exports (full list)

- usePloc, useUseCase  
- CAFProvider, useCAFContext, usePlocFromContext, useUseCaseFromContext  
- CAFErrorBoundary, useCAFError  
- CAFContext  
- usePlocDevTools, useUseCaseDevTools, useCAFDevTools, useTrackPloc  
- useRouteManager, useRouteRepository  

## Dependencies

- `@c-a-f/core` — Core primitives  
- `@c-a-f/devtools` — DevTools utilities  
- `react-router-dom` — React Router  
- **Peer:** react &gt;= 16.8.0  
