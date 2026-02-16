# @caf/infrastructure-vue

Vue-specific infrastructure adapters for CAF.

## Installation

```bash
npm install @caf/infrastructure-vue vue-router
```

## Usage

### useRouteManager

Composable that provides a `RouteManager` from `@caf/core`:

```typescript
import { useRouteManager } from '@caf/infrastructure-vue';
import { RouteManagerAuthOptions } from '@caf/core';

// In a Vue component setup function
const routeManager = useRouteManager({
  loginPath: '/login',
  isLoggedIn: () => !!localStorage.getItem('token'),
});

// Use routeManager
routeManager.changeRoute('/dashboard');
routeManager.checkForLoginRoute();
```

### useRouteRepository

Composable that provides a `RouteRepository` implementation:

```typescript
import { useRouteRepository } from '@caf/infrastructure-vue';
import { RouteManager } from '@caf/core';

const routeRepository = useRouteRepository();
const routeManager = new RouteManager(routeRepository);

// Use routeManager...
```

## Exports

- `useRouteManager` — Composable returning core `RouteManager` with Vue Router integration
- `useRouteRepository` — Composable returning `RouteRepository` implementation
- `RouterService` — **Deprecated**: Class-based service (violates Vue Composition API rules)
- `RouteHandler` — **Deprecated**: Class-based handler (violates Vue Composition API rules)

## Dependencies

- `@caf/core` — Core primitives
- `vue-router` — Vue Router

## Peer Dependencies

- `vue` >= 3.0.0

## License

MIT
