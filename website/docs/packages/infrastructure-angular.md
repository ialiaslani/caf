---
title: "@c-a-f/infrastructure-angular"
sidebar_label: Infrastructure Angular
---

# @c-a-f/infrastructure-angular

Angular-specific adapters for CAF: routing, Ploc/UseCase provider, Ploc-to-Observable, UseCase state runner, error handling, and DevTools.

## Installation

```bash
npm install @c-a-f/infrastructure-angular @c-a-f/core @angular/core @angular/router
```

## Features

| Feature | Description |
|--------|-------------|
| **injectRouteRepository** | Returns a `RouteRepository` using Angular Router. Use with `new RouteManager(repo, authOptions)`. |
| **injectRouteManager** | Returns a `RouteManager`; optionally provide `ROUTE_MANAGER_AUTH_OPTIONS` in app config for login redirect. |
| **ROUTE_MANAGER_AUTH_OPTIONS** | Injection token for auth options (loginPath, isLoggedIn). |
| **RouteHandler** | Injectable that implements `RouteRepository` (Angular Router). Injected by `injectRouteRepository()`. |
| **provideCAF** | Provides Plocs and UseCases by key. Use in app config or providers. |
| **injectCAFContext** | Inject the CAF context (plocs, useCases). |
| **injectPlocFromContext** | Inject a Ploc by key. |
| **injectUseCaseFromContext** | Inject a UseCase by key. |
| **getPlocFromContext, getUseCaseFromContext** | Get Ploc/UseCase from injector (for esbuild/application builder where inject() in constructor may be limited). |
| **CAF_CONTEXT** | Injection token for CAF context. |
| **plocToObservable** | Convert a Ploc to an Observable of state (for use with toSignal). |
| **UseCaseState** | Wraps a UseCase with loading/error/data signals; call `execute(args)` and `destroy()` in ngOnDestroy. |
| **CAFErrorHandler** | Angular ErrorHandler that captures errors (use with provide: ErrorHandler). |
| **CAFErrorService** | Service exposing current error and resetError(); use in template to show fallback UI. |
| **CAFDevToolsService** | Enable/disable DevTools; trackPloc(ploc, name). |

## injectRouteManager / injectRouteRepository

Same API shape as React and Vue. Use `injectRouteManager()` when you want a RouteManager; use `injectRouteRepository()` when you need the repository and will create RouteManager yourself.

**App config with auth:**

```typescript
import { ROUTE_MANAGER_AUTH_OPTIONS } from '@c-a-f/infrastructure-angular';
import { RouteManagerAuthOptions } from '@c-a-f/core';

const authOptions: RouteManagerAuthOptions = {
  loginPath: '/login',
  isLoggedIn: () => !!localStorage.getItem('token'),
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: ROUTE_MANAGER_AUTH_OPTIONS, useValue: authOptions },
  ],
};
```

**In a service or component:**

```typescript
import { injectRouteManager } from '@c-a-f/infrastructure-angular';

private routeManager = injectRouteManager();

navigate() {
  this.routeManager.changeRoute('/dashboard');
}
```

## Provider (CAF context)

```typescript
import { provideCAF, injectPlocFromContext, injectUseCaseFromContext } from '@c-a-f/infrastructure-angular';

// app.config.ts
providers: [
  provideCAF({
    plocs: { user: userPloc },
    useCases: { createUser: createUserUseCase },
  }),
],

// In a component
const userPloc = injectPlocFromContext<UserPloc>('user');
const createUser = injectUseCaseFromContext<[CreateUserInput], User>('createUser');
```

## Ploc to Observable / Signal

```typescript
import { plocToObservable } from '@c-a-f/infrastructure-angular';
import { toSignal } from '@angular/core/rxjs-interop';

private userPloc = injectPlocFromContext<UserPloc>('user')!;
state = toSignal(plocToObservable(this.userPloc));
```

When using `@angular/build:application` (esbuild), if `inject()` in constructor is not available, use `getPlocFromContext(injector, 'user')` and `getUseCaseFromContext(injector, 'createUser')` with the component's Injector.

## UseCaseState

```typescript
import { UseCaseState } from '@c-a-f/infrastructure-angular';

export class CreateUserComponent implements OnDestroy {
  runner = new UseCaseState(this.createUserUseCase);

  async submit() {
    const result = await this.runner.execute({ name: 'John', email: 'j@example.com' });
    if (result) { /* success */ }
  }

  ngOnDestroy() {
    this.runner.destroy();
  }
}
```

Template: `runner.loading()`, `runner.error()`, `runner.data()`.

## Error boundary

Angular has no component-level error boundary. Use `CAFErrorHandler` and `CAFErrorService`:

```typescript
import { CAFErrorHandler, CAFErrorService } from '@c-a-f/infrastructure-angular';
import { ErrorHandler } from '@angular/core';

// app.config.ts
providers: [{ provide: ErrorHandler, useClass: CAFErrorHandler }]

// In root or layout component
errorService = inject(CAFErrorService);
```

In template: show fallback when `errorService.error()` is non-null; call `errorService.resetError()` to clear.

## DevTools

```typescript
import { CAFDevToolsService } from '@c-a-f/infrastructure-angular';

devTools = inject(CAFDevToolsService);
this.devTools.enable();
this.devTools.trackPloc(userPloc, 'UserPloc');
```

## Exports

- **Routing:** injectRouteManager, injectRouteRepository, ROUTE_MANAGER_AUTH_OPTIONS, RouteHandler  
- **Provider:** CAF_CONTEXT, provideCAF, injectCAFContext, injectPlocFromContext, injectUseCaseFromContext, getPlocFromContext, getUseCaseFromContext  
- **Ploc:** plocToObservable  
- **UseCase:** UseCaseState  
- **Error:** CAFErrorService, CAFErrorHandler  
- **DevTools:** CAFDevToolsService  

## Dependencies

- `@c-a-f/core` — Core primitives  
- **Peer:** @angular/core, @angular/router, rxjs  
