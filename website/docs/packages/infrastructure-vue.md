---
title: "@c-a-f/infrastructure-vue"
sidebar_label: Infrastructure Vue
---

# @c-a-f/infrastructure-vue

Vue-specific adapters for CAF: composables for Ploc/UseCase, provider, error boundary, routing, and DevTools.

## Installation

```bash
npm install @c-a-f/infrastructure-vue vue vue-router
```

## Features

| Feature | Description |
|--------|-------------|
| **usePloc** | Composable that subscribes to a Ploc; returns `[state, ploc]` (reactive state ref and Ploc instance). |
| **useUseCase** | Composable that wraps UseCase execution with loading/error/data refs. |
| **CAFProvider** | Provides Plocs and UseCases to the tree (provide/inject by key). |
| **useCAFContext** | Read the CAF context (plocs and useCases registries). |
| **usePlocFromContext** | Get a Ploc by key from the provider. |
| **useUseCaseFromContext** | Get a UseCase by key from the provider. |
| **CAFErrorBoundary** | Catches errors from child components; shows fallback or default UI. |
| **useCAFError** | Access error context from within the error boundary. |
| **useRouteManager** | Returns RouteManager with optional auth options. Uses Vue Router. |
| **useRouteRepository** | Returns RouteRepository (current route + change) using Vue Router. |
| **useCAFDevTools** | Central DevTools toggle; track Plocs/UseCases. |
| **useTrackPloc** | Register a Ploc with DevTools. |

## usePloc

```vue
<script setup lang="ts">
import { usePloc } from '@c-a-f/infrastructure-vue';

const [state, ploc] = usePloc(userPloc);
await ploc.loadUsers();
</script>
<template>
  <span>{{ state.users?.length }}</span>
</template>
```

## useUseCase

```vue
<script setup lang="ts">
import { useUseCase } from '@c-a-f/infrastructure-vue';

const { execute, loading, error, data } = useUseCase(createUserUseCase);

async function handleCreate() {
  const result = await execute({ name: 'John', email: 'john@example.com' });
  if (result) console.log(result);
}
</script>
```

## CAFProvider and context

Register Plocs and UseCases at the root (e.g. in `main.ts` or root component); in descendants use `usePlocFromContext('key')` and `useUseCaseFromContext('key')` to access by key.

```vue
<!-- Root -->
h(CAFErrorBoundary, null, {
  default: () => h(CAFProvider, { plocs: { users: usersPloc } }, { default: () => h(App) })
});

<!-- Child -->
const usersPloc = usePlocFromContext('users');
const [state, ploc] = usePloc(usersPloc);
```

## CAFErrorBoundary

Catches errors from child components; supports custom fallback (error, resetError) and optional onError callback.

## useRouteManager / useRouteRepository

Same API shape as React: `useRouteManager(authOptions?)` returns RouteManager; `useRouteRepository()` returns RouteRepository. Both use Vue Router under the hood.

## DevTools

```typescript
import { useCAFDevTools, useTrackPloc } from '@c-a-f/infrastructure-vue';

const devTools = useCAFDevTools({ enabled: import.meta.env.DEV });
useTrackPloc(userPloc, 'UserPloc');
// In console: window.__CAF_DEVTOOLS__
```

## Exports

- usePloc, useUseCase  
- CAFProvider, useCAFContext, usePlocFromContext, useUseCaseFromContext  
- CAFErrorBoundary, useCAFError  
- useRouteManager, useRouteRepository  
- useCAFDevTools, useTrackPloc  

## Dependencies

- `@c-a-f/core` — Core primitives  
- `vue-router` — Vue Router  
- **Peer:** vue &gt;= 3.0.0  
