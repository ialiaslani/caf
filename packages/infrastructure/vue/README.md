# @caf/infrastructure-vue

Vue-specific infrastructure adapters for CAF.

## Installation

```bash
npm install @caf/infrastructure-vue vue-router
```

## Usage

### RouterService

Service that provides a `RouteManager` from `@caf/core`:

```typescript
import { RouterService } from '@caf/infrastructure-vue';

const routerService = new RouterService();
const routeManager = routerService.getRouteManager();

// Use routeManager
routeManager.changeRoute('/dashboard');
routeManager.checkForLoginRoute();
```

### RouteHandler

Vue Router adapter implementing `RouteRepository`:

```typescript
import { RouteHandler } from '@caf/infrastructure-vue';
import { RouteManager } from '@caf/core';
import { useRouter } from 'vue-router';

const router = useRouter();
const routeHandler = new RouteHandler(router);
const routeManager = new RouteManager(routeHandler);
```

## Exports

- `RouterService` — Service providing core `RouteManager` with Vue Router integration
- `RouteHandler` — Vue Router adapter implementing `RouteRepository`

## Dependencies

- `@caf/core` — Core primitives
- `@caf/infrastructure` — Shared infrastructure
- `@caf/example-domain` — Example domain
- `vue-router` — Vue Router

## Peer Dependencies

- `vue` >= 3.0.0

## License

MIT
