# @c.a.f/infrastructure-react

React-specific infrastructure adapters for CAF.

## Installation

```bash
npm install @c.a.f/infrastructure-react react-router-dom
```

## Usage

### usePloc

Hook that subscribes to a Ploc and returns the current state and the Ploc instance. Subscribes on mount, syncs when the ploc reference changes, and unsubscribes on unmount.

```typescript
import { usePloc } from '@c.a.f/infrastructure-react';

function UserProfile({ userPloc }: { userPloc: UserPloc }) {
  const [state, ploc] = usePloc(userPloc);

  return (
    <div>
      <span>{state.name}</span>
      <button onClick={() => ploc.loadUser()}>Refresh</button>
    </div>
  );
}
```

The hook returns a tuple `[state, ploc]`: the current state (re-renders when the Ploc updates) and the same Ploc instance so you can call methods on it. The Ploc is typically provided via props, context, or created with `useMemo` for the component tree.

### useUseCase

Hook that wraps a UseCase execution with loading/error/data state management. Handles `RequestResult` subscriptions automatically and provides a clean API for executing use cases.

```typescript
import { useUseCase } from '@c.a.f/infrastructure-react';
import { CreateUser } from './application/User/Commands/CreateUser';

function CreateUserForm({ createUserUseCase }: { createUserUseCase: CreateUser }) {
  const { execute, loading, error, data } = useUseCase(createUserUseCase);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const result = await execute({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    });
    
    if (result) {
      console.log('User created:', result);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {loading && <p>Creating user...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <p>User created: {data.name}</p>}
      {/* form fields */}
    </form>
  );
}
```

The hook automatically subscribes to the `RequestResult`'s `loading`, `data`, and `error` pulses, so your component re-renders when these values change. The `execute` function returns the data value directly (or `null` on error), making it easy to handle results.

### CAFErrorBoundary

Error Boundary component that catches errors from Ploc/UseCase execution and component rendering. Provides error context via React Context and supports custom error UI and recovery.

```typescript
import { CAFErrorBoundary, useCAFError } from '@c.a.f/infrastructure-react';

function App() {
  return (
    <CAFErrorBoundary
      fallback={(error, errorInfo, resetError) => (
        <div>
          <h2>Oops! Something went wrong</h2>
          <p>{error.message}</p>
          <button onClick={resetError}>Try again</button>
        </div>
      )}
      onError={(error, errorInfo) => {
        // Log to error reporting service
        console.error('Error caught:', error, errorInfo);
      }}
    >
      <YourApp />
    </CAFErrorBoundary>
  );
}
```

Access error context from anywhere within the boundary:

```typescript
import { useCAFError } from '@c.a.f/infrastructure-react';

function ErrorDisplay() {
  const errorContext = useCAFError();
  
  if (errorContext?.error) {
    return (
      <div>
        <p>Error: {errorContext.error.message}</p>
        <button onClick={errorContext.resetError}>Reset</button>
      </div>
    );
  }
  
  return null;
}
```

The error boundary catches:
- Errors during component rendering
- Errors in lifecycle methods
- Errors in constructors
- Errors from Ploc/UseCase execution (when not caught locally)

### DevTools Integration

React hooks for debugging and inspecting CAF applications. Integrates with `@c.a.f/devtools` and exposes data for React DevTools.

#### usePlocDevTools

Hook that provides DevTools for a Ploc instance. Enables state tracking, time-travel debugging, and state history.

```typescript
import { usePloc, usePlocDevTools } from '@c.a.f/infrastructure-react';

function UserProfile({ userPloc }: { userPloc: UserPloc }) {
  const [state, ploc] = usePloc(userPloc);
  const devTools = usePlocDevTools(ploc, { 
    name: 'UserPloc', 
    enabled: process.env.NODE_ENV === 'development' 
  });

  // Access state history
  const history = devTools.getStateHistory();
  
  // Time-travel debugging
  const handleUndo = () => {
    devTools.previousState();
  };

  return (
    <div>
      <span>{state.name}</span>
      {process.env.NODE_ENV === 'development' && (
        <button onClick={handleUndo}>Undo</button>
      )}
    </div>
  );
}
```

#### useUseCaseDevTools

Hook that provides DevTools for UseCase execution tracking. Tracks execution history, timing, and errors.

```typescript
import { useUseCaseDevTools } from '@c.a.f/infrastructure-react';
import { CreateUser } from './application/User/Commands/CreateUser';

function CreateUserForm({ createUserUseCase }: { createUserUseCase: CreateUser }) {
  const useCaseDevTools = useUseCaseDevTools({ 
    name: 'CreateUser',
    enabled: true,
    logExecutionTime: true 
  });
  
  // Wrap use case with DevTools tracking
  const trackedUseCase = useCaseDevTools.wrap(createUserUseCase);
  
  // Get execution statistics
  const stats = useCaseDevTools.getStatistics();
  console.log('Total executions:', stats.totalExecutions);
  console.log('Average duration:', stats.averageDuration, 'ms');
  
  // Use the tracked use case...
}
```

#### useCAFDevTools

Main hook that provides centralized DevTools access for your entire application. Tracks all Plocs and UseCases.

```typescript
import { useCAFDevTools, useTrackPloc } from '@c.a.f/infrastructure-react';

function App() {
  const devTools = useCAFDevTools({ 
    enabled: process.env.NODE_ENV === 'development' 
  });

  // Enable/disable globally
  const handleToggleDevTools = () => {
    if (devTools.enabled) {
      devTools.disable();
    } else {
      devTools.enable();
    }
  };

  return (
    <div>
      {/* Your app */}
      {process.env.NODE_ENV === 'development' && (
        <button onClick={handleToggleDevTools}>
          {devTools.enabled ? 'Disable' : 'Enable'} DevTools
        </button>
      )}
    </div>
  );
}

// In components using Plocs, automatically track them:
function UserComponent({ userPloc }: { userPloc: UserPloc }) {
  useTrackPloc(userPloc, 'UserPloc'); // Automatically registered with DevTools
  const [state] = usePloc(userPloc);
  // ...
}
```

The DevTools data is also exposed to `window.__CAF_DEVTOOLS__` for React DevTools extension integration.

### useRouteManager

Hook that provides a `RouteManager` from `@c.a.f/core`:

```typescript
import { useRouteManager } from '@c.a.f/infrastructure-react';
import { RouteManagerAuthOptions } from '@c.a.f/core';

function MyComponent() {
  // Optional: provide auth configuration
  const authOptions: RouteManagerAuthOptions = {
    loginPath: '/login',
    isLoggedIn: () => !!localStorage.getItem('token'),
  };
  
  const routeManager = useRouteManager(authOptions);
  
  const handleLogin = async () => {
    // ... login logic
    routeManager.changeRoute('/dashboard');
  };
  
  return <button onClick={handleLogin}>Login</button>;
}
```

### useRouteRepository

Hook that provides a `RouteRepository` implementation:

```typescript
import { useRouteRepository } from '@c.a.f/infrastructure-react';
import { RouteManager } from '@c.a.f/core';

function MyComponent() {
  const routeRepository = useRouteRepository();
  const routeManager = new RouteManager(routeRepository);
  
  // Use routeManager...
}
```

## Exports

- `usePloc` — Hook that subscribes to a Ploc and returns `[state, ploc]`; handles subscribe/unsubscribe and cleanup
- `useUseCase` — Hook that wraps UseCase execution with loading/error/data state management; handles RequestResult subscriptions automatically
- `CAFErrorBoundary` — Error Boundary component that catches errors from Ploc/UseCase execution; provides error context via React Context
- `useCAFError` — Hook to access error context from CAFErrorBoundary
- `usePlocDevTools` — Hook that provides DevTools for a Ploc instance; enables state tracking and time-travel debugging
- `useUseCaseDevTools` — Hook that provides DevTools for UseCase execution tracking
- `useCAFDevTools` — Main hook that provides centralized DevTools access; tracks all Plocs and UseCases
- `useTrackPloc` — Helper hook to automatically register a Ploc with DevTools
- `useRouteManager` — Hook returning core `RouteManager` with React Router integration
- `useRouteRepository` — Hook returning `RouteRepository` implementation

## Dependencies

- `@c.a.f/core` — Core primitives
- `@c.a.f/devtools` — DevTools utilities (for debugging)
- `react-router-dom` — React Router

## Peer Dependencies

- `react` >= 16.8.0

## License

MIT
