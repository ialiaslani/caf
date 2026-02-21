---
title: Custom routing (TanStack, Wouter, Next.js)
---

# Using a Different Routing Library with CAF

Use CAF's routing logic with **any** routing library (TanStack Router, Wouter, Next.js App Router, etc.) by implementing a small adapter. All routing *logic* stays in core.

## How CAF routing is designed

- **`@c-a-f/core`** defines **`RouteRepository`** (current route + navigate) and **`RouteManager`** (changeRoute, checkForLoginRoute, isUserLoggedIn).
- **`@c-a-f/infrastructure-react`** provides one implementation using React Router. If you use another router, implement the interface yourself.

## The interface

```typescript
import type { RouteRepository } from '@c-a-f/core';

export interface RouteRepository {
  currentRoute: string;        // current path (e.g. pathname)
  change(route: string): void; // navigate to route
}
```

## Step 1: Implement RouteRepository

```typescript
import type { RouteRepository } from '@c-a-f/core';

export function createRouteRepository(
  getPathname: () => string,
  navigate: (path: string) => void
): RouteRepository {
  return {
    get currentRoute() {
      return getPathname();
    },
    change(route: string) {
      navigate(route);
    },
  };
}
```

Use your router's APIs for `getPathname` and `navigate`.

## Step 2: Create RouteManager

```typescript
import { RouteManager, RouteManagerAuthOptions } from '@c-a-f/core';
import { createRouteRepository } from './MyRouterAdapter';

const authOptions: RouteManagerAuthOptions = {
  loginPath: '/login',
  isLoggedIn: () => !!localStorage.getItem('token'),
};

const repo = createRouteRepository(getPathname, navigate);
const routeManager = new RouteManager(repo, authOptions);
```

## Step 3: Expose via a hook (React)

```typescript
import { useMemo } from 'react';
import { RouteManager, RouteManagerAuthOptions } from '@c-a-f/core';
import { usePathname, useNavigate } from 'your-router-lib';
import { createRouteRepository } from './MyRouterAdapter';

export function useRouteManager(authOptions?: RouteManagerAuthOptions): RouteManager {
  const pathname = usePathname();
  const navigate = useNavigate();

  return useMemo(() => {
    const repo = createRouteRepository(() => pathname, (path) => navigate(path));
    return new RouteManager(repo, authOptions);
  }, [pathname, navigate, authOptions]);
}
```

## Example: TanStack Router

```typescript
import { useRouter, useRouterState } from '@tanstack/react-router';
import { useMemo } from 'react';
import { RouteManager, RouteManagerAuthOptions } from '@c-a-f/core';

export function useRouteManager(authOptions?: RouteManagerAuthOptions): RouteManager {
  const router = useRouter();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  return useMemo(() => {
    const repo = {
      get currentRoute() {
        return pathname;
      },
      change(route: string) {
        router.navigate({ to: route });
      },
    };
    return new RouteManager(repo, authOptions);
  }, [pathname, router, authOptions]);
}
```

## Example: Wouter

```typescript
import { useLocation } from 'wouter';
import { useMemo } from 'react';
import { RouteManager, RouteManagerAuthOptions } from '@c-a-f/core';

export function useRouteManager(authOptions?: RouteManagerAuthOptions): RouteManager {
  const [location, setLocation] = useLocation();

  return useMemo(() => {
    const repo = {
      get currentRoute() {
        return location;
      },
      change(route: string) {
        setLocation(route);
      },
    };
    return new RouteManager(repo, authOptions);
  }, [location, setLocation, authOptions]);
}
```

## Summary

| Goal | Approach |
|------|----------|
| Use React Router | Use `useRouteManager` and `useRouteRepository` from `@c-a-f/infrastructure-react`. |
| Use another router | Implement `RouteRepository`, create `RouteManager` from `@c-a-f/core`, expose via your own hook. |

All logic stays in core; only the adapter (current route + navigate) lives in your infrastructure.
