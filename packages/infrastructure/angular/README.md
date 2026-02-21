# @c.a.f/infrastructure-angular

Angular-specific infrastructure adapters for CAF — routing, Ploc, UseCase, Provider, ErrorBoundary, and DevTools (feature parity with React and Vue packages).

## Installation

```bash
npm install @c.a.f/infrastructure-angular @angular/router
```

## Usage

### injectRouteManager / injectRouteRepository

Same API shape as React (`useRouteManager` / `useRouteRepository`) and Vue composables. Use `injectRouteManager()` in injection context to get a `RouteManager`; use `injectRouteRepository()` when you need a `RouteRepository` and will build `RouteManager` yourself. Optionally provide `ROUTE_MANAGER_AUTH_OPTIONS` in app config to enable login redirect:

```typescript
import { injectRouteManager, ROUTE_MANAGER_AUTH_OPTIONS } from '@c.a.f/infrastructure-angular';
import { RouteManagerAuthOptions } from '@c.a.f/core';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

const authOptions: RouteManagerAuthOptions = {
  loginPath: '/login',
  isLoggedIn: () => !!localStorage.getItem('token'),
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes),
    { provide: ROUTE_MANAGER_AUTH_OPTIONS, useValue: authOptions },
  ],
};
```

```typescript
import { injectRouteManager } from '@c.a.f/infrastructure-angular';

@Injectable({ providedIn: 'root' })
export class MyService {
  private routeManager = injectRouteManager();

  navigate() {
    this.routeManager.changeRoute('/dashboard');
  }
}
```

With a custom `RouteRepository` (mirrors `useRouteRepository` + `new RouteManager(repo)` in React/Vue):

```typescript
import { injectRouteRepository } from '@c.a.f/infrastructure-angular';
import { RouteManager } from '@c.a.f/core';

const routeRepository = injectRouteRepository();
const routeManager = new RouteManager(routeRepository, authOptions);
```

### RouterService (deprecated)

Prefer `injectRouteManager()`. Injectable that provides `RouteManager` via `getRouteManager()`:

```typescript
import { RouterService } from '@c.a.f/infrastructure-angular';

constructor(private routerService: RouterService) {}
const routeManager = this.routerService.getRouteManager();
```

### RouteHandler

Angular `RouteRepository` implementation (injected by `injectRouteRepository()`). Use directly only if you need to provide a custom implementation; otherwise use `injectRouteRepository()`.

### Provider (CAF context)

Provide Plocs and UseCases by key so any descendant can inject them:

```typescript
import { provideCAF, injectPlocFromContext, injectUseCaseFromContext } from '@c.a.f/infrastructure-angular';

// In app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideCAF({
      plocs: { user: userPloc },
      useCases: { createUser: createUserUseCase },
    }),
  ],
};

// In a component
const userPloc = injectPlocFromContext<UserPloc>('user');
const createUser = injectUseCaseFromContext<[CreateUserInput], User>('createUser');
```

### Ploc

Subscribe to a Ploc's state in Angular using `plocToObservable` and `toSignal`:

```typescript
import { plocToObservable } from '@c.a.f/infrastructure-angular';
import { toSignal } from '@angular/core/rxjs-interop';

export class UserComponent {
  private userPloc = injectPlocFromContext<UserPloc>('user')!;
  state = toSignal(plocToObservable(this.userPloc));
}
```

When using `@angular/build:application` (esbuild), `inject()` may not be available in component constructors due to pre-bundling. Use `getPlocFromContext(injector, key)` and `getUseCaseFromContext(injector, key)` instead, passing the component's `Injector` (injected via the constructor).

### UseCase

Wrap a UseCase with `UseCaseState` for loading/error/data signals. Call `destroy()` in `ngOnDestroy`:

```typescript
import { UseCaseState } from '@c.a.f/infrastructure-angular';

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

### Error boundary

Angular has no component-level error boundary. Use `CAFErrorHandler` and `CAFErrorService` to capture errors and show a fallback:

```typescript
import { CAFErrorHandler, CAFErrorService } from '@c.a.f/infrastructure-angular';
import { ErrorHandler } from '@angular/core';

// app.config.ts
providers: [{ provide: ErrorHandler, useClass: CAFErrorHandler }]

// In your root or layout component
export class AppComponent {
  errorService = inject(CAFErrorService);
}
```

Template: show fallback when `errorService.error()` is non-null and call `errorService.resetError()` to clear.

### DevTools

Minimal DevTools service for enabling/disabling and tracking Plocs:

```typescript
import { CAFDevToolsService } from '@c.a.f/infrastructure-angular';

// Inject and enable in dev
devTools = inject(CAFDevToolsService);
this.devTools.enable();
this.devTools.trackPloc(userPloc, 'UserPloc');
```

## Exports

- **Routing:** `injectRouteManager`, `injectRouteRepository`, `RouterService` (deprecated), `ROUTE_MANAGER_AUTH_OPTIONS`, `RouteHandler`
- **Provider:** `CAF_CONTEXT`, `provideCAF`, `injectCAFContext`, `injectPlocFromContext`, `injectUseCaseFromContext`, `getPlocFromContext`, `getUseCaseFromContext`
- **Ploc:** `plocToObservable`
- **UseCase:** `UseCaseState`
- **ErrorBoundary:** `CAFErrorService`, `CAFErrorHandler`
- **DevTools:** `CAFDevToolsService`

## Dependencies

- `@c.a.f/core` — Core primitives
- `@angular/core` — Angular core (peer)
- `@angular/router` — Angular Router (peer)
- `rxjs` — For `plocToObservable` (peer)

## License

MIT
