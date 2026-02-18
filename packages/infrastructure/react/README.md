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
- `useRouteManager` — Hook returning core `RouteManager` with React Router integration
- `useRouteRepository` — Hook returning `RouteRepository` implementation

## Dependencies

- `@c.a.f/core` — Core primitives
- `react-router-dom` — React Router

## Peer Dependencies

- `react` >= 16.8.0

## License

MIT
