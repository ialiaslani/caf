# @caf/infrastructure-react

React-specific infrastructure adapters for CAF.

## Installation

```bash
npm install @caf/infrastructure-react react-router-dom
```

## Usage

### useRouteManager

Hook that provides a `RouteManager` from `@caf/core`:

```typescript
import { useRouteManager } from '@caf/infrastructure-react';
import { RouteManagerAuthOptions } from '@caf/core';

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
import { useRouteRepository } from '@caf/infrastructure-react';
import { RouteManager } from '@caf/core';

function MyComponent() {
  const routeRepository = useRouteRepository();
  const routeManager = new RouteManager(routeRepository);
  
  // Use routeManager...
}
```

## Exports

- `useRouteManager` — Hook returning core `RouteManager` with React Router integration
- `useRouteRepository` — Hook returning `RouteRepository` implementation

## Dependencies

- `@caf/core` — Core primitives
- `react-router-dom` — React Router

## Peer Dependencies

- `react` >= 16.8.0

## License

MIT
