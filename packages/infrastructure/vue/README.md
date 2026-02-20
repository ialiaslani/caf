# @c.a.f/infrastructure-vue

Vue-specific infrastructure adapters for CAF (Clean Architecture Frontend).

## Installation

```bash
npm install @c.a.f/infrastructure-vue vue vue-router
```

## Usage

### usePloc

Composable that subscribes to a Ploc and returns reactive state and the Ploc instance:

```vue
<script setup lang="ts">
import { usePloc } from '@c.a.f/infrastructure-vue';

const [state, userPloc] = usePloc(userPloc);
await userPloc.loadUsers();
</script>
<template>
  <span>{{ state.users?.length }}</span>
</template>
```

### useUseCase

Composable that wraps a UseCase with loading/error/data refs:

```vue
<script setup lang="ts">
import { useUseCase } from '@c.a.f/infrastructure-vue';

const { execute, loading, error, data } = useUseCase(createUserUseCase);
const handleCreate = async () => {
  const result = await execute({ name: 'John' });
  if (result) console.log(result);
};
</script>
```

### CAFProvider and context

Register Plocs/UseCases at the root and access them by key:

```vue
<!-- main.ts or root component -->
import { CAFProvider, CAFErrorBoundary } from '@c.a.f/infrastructure-vue';

h(CAFErrorBoundary, null, {
  default: () => h(CAFProvider, { plocs: { users: usersPloc } }, { default: () => h(App) })
});
```

```vue
<script setup lang="ts">
import { usePlocFromContext, usePloc } from '@c.a.f/infrastructure-vue';

const usersPloc = usePlocFromContext('users');
const [state, ploc] = usePloc(usersPloc);
</script>
```

### CAFErrorBoundary

Catches errors from child components and shows a fallback or default UI:

```vue
<CAFErrorBoundary :fallback="({ error, resetError }) => h('div', [error.message, h('button', { onClick: resetError }, 'Try again')])">
  <App />
</CAFErrorBoundary>
```

### useRouteManager / useRouteRepository

Composables for routing with `@c.a.f/core` RouteManager:

```typescript
import { useRouteManager } from '@c.a.f/infrastructure-vue';

const routeManager = useRouteManager({
  loginPath: '/login',
  isLoggedIn: () => !!localStorage.getItem('token'),
});
routeManager.checkForLoginRoute();
```

### DevTools

```typescript
import { useCAFDevTools, useTrackPloc } from '@c.a.f/infrastructure-vue';

const devTools = useCAFDevTools({ enabled: import.meta.env.DEV });
useTrackPloc(userPloc, 'UserPloc');
// In console: window.__CAF_DEVTOOLS__
```

## Exports

- `usePloc` — Subscribe to a Ploc, return [stateRef, ploc]
- `useUseCase` — Execute a UseCase with loading/error/data refs
- `CAFProvider` — Provide Plocs/UseCases by key
- `useCAFContext` / `usePlocFromContext` / `useUseCaseFromContext` — Consume from provider
- `CAFErrorBoundary` / `useCAFError` — Error boundary and error context
- `useCAFDevTools` / `useTrackPloc` — DevTools toggle and Ploc tracking
- `useRouteManager` / `useRouteRepository` — Routing with Vue Router

## Dependencies

- `@c.a.f/core` — Core primitives (Ploc, UseCase, RouteManager, etc.)
- `vue-router` — Vue Router (for route composables)

## Peer Dependencies

- `vue` >= 3.0.0

## License

MIT
