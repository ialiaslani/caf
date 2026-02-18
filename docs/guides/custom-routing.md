# Using a Different Routing Library with CAF

This guide explains how to use CAF's routing logic with **any** routing library (TanStack Router, Wouter, Next.js App Router, etc.) instead of the built-in React Router adapter from `@c.a.f/infrastructure-react`. All routing *logic* stays in the CAF/core layer; you only implement a small adapter in your project.

---

## How CAF routing is designed

- **`@c.a.f/core`** defines:
  - **`RouteRepository`** — interface: "what is the current route?" and "navigate to this route."
  - **`RouteManager`** — uses that interface and holds app-level logic: `changeRoute()`, `checkForLoginRoute()`, `isUserLoggedIn()`.

- **`@c.a.f/infrastructure-react`** provides one implementation of `RouteRepository` using **React Router** (`useNavigate`, `useLocation`). That is optional. If you use a different router, you do **not** use those hooks; you implement the interface yourself.

So: **logic** (auth checks, redirects, "change route") lives in core; **actual navigation** is pluggable via `RouteRepository`.

---

## The interface you need to implement

From `@c.a.f/core`, `RouteRepository` is:

```typescript
import type { RouteRepository } from '@c.a.f/core';

// You must provide:
export interface RouteRepository {
  currentRoute: string;        // current path (e.g. pathname)
  change(route: string): void; // navigate to route
}
```

Implement this in your `caf/infrastructure` (or app) layer by calling your chosen router's APIs. No dependency on React Router or infrastructure-react for routing.

---

## Step 1: Implement `RouteRepository` for your router

Create an adapter that bridges your router to CAF. Example with a generic "get path + navigate" API:

```typescript
// caf/infrastructure/routing/MyRouterAdapter.ts
import type { RouteRepository } from '@c.a.f/core';

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

Use your router's APIs for `getPathname` and `navigate` (e.g. TanStack Router's `useRouter`, Wouter's `useLocation`/`useNavigate`, Next.js's `usePathname`/`useRouter`).

---

## Step 2: Create a `RouteManager` with your repository

Use **only** `@c.a.f/core` for the manager. Optional auth is passed as the second argument:

```typescript
import { RouteManager, RouteManagerAuthOptions } from '@c.a.f/core';
import { createRouteRepository } from './MyRouterAdapter';

// With auth (e.g. redirect to login when not authenticated)
const authOptions: RouteManagerAuthOptions = {
  loginPath: '/login',
  isLoggedIn: () => !!localStorage.getItem('token'),
};

const repo = createRouteRepository(getPathname, navigate);
const routeManager = new RouteManager(repo, authOptions);

// Use it
routeManager.changeRoute('/dashboard');
routeManager.checkForLoginRoute(); // redirects to login if not logged in
routeManager.isUserLoggedIn();
```

---

## Step 3: Expose via a hook (React example)

Wire your router's hooks and expose a `RouteManager` so components can use the same API regardless of router:

```typescript
// e.g. src/routing/useRouteManager.ts or caf/infrastructure/routing/useRouteManager.ts
import { useMemo } from 'react';
import { RouteManager, RouteManagerAuthOptions } from '@c.a.f/core';
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

Your app code then uses `useRouteManager()` and `RouteManager` as usual; only the adapter changes when you switch routers.

---

## Example: TanStack Router

```typescript
import { useRouter, useRouterState } from '@tanstack/react-router';
import { useMemo } from 'react';
import { RouteManager, RouteManagerAuthOptions } from '@c.a.f/core';

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

---

## Example: Wouter

```typescript
import { useLocation, useRoute } from 'wouter';
import { useMemo } from 'react';
import { RouteManager, RouteManagerAuthOptions } from '@c.a.f/core';

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

---

## Summary

| Goal | Approach |
|------|----------|
| Use React Router | Use `useRouteManager` and `useRouteRepository` from `@c.a.f/infrastructure-react`. |
| Use another routing lib | Implement `RouteRepository` yourself (in `caf/infrastructure` or app), create `RouteManager` from `@c.a.f/core`, and expose via your own hook. |
| Keep logic in caf folder | All logic stays in core (`RouteManager`). Only the adapter (current route + navigate) lives in your infrastructure. |

You do **not** need route management from `@c.a.f/infrastructure-react` to use CAF with a different router. You only need to implement the small `RouteRepository` contract and pass it to `RouteManager`.
