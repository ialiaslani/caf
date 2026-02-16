# @c.a.f/infrastructure-angular

Angular-specific infrastructure adapters for CAF.

## Installation

```bash
npm install @c.a.f/infrastructure-angular @angular/router
```

## Usage

### RouterService

Injectable service that provides a `RouteManager` from `@c.a.f/core`:

```typescript
import { RouterService } from '@c.a.f/infrastructure-angular';
import { RouteManagerAuthOptions } from '@c.a.f/core';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MyService {
  private routerService: RouterService;
  
  constructor(private router: Router) {
    // Optional: provide auth configuration
    const authOptions: RouteManagerAuthOptions = {
      loginPath: '/login',
      isLoggedIn: () => !!localStorage.getItem('token'),
    };
    
    this.routerService = new RouterService(router, authOptions);
  }
  
  navigate() {
    const routeManager = this.routerService.getRouteManager();
    routeManager.changeRoute('/dashboard');
  }
}
```

### RouteHandler

Angular Router adapter implementing `RouteRepository`:

```typescript
import { RouteHandler } from '@c.a.f/infrastructure-angular';
import { RouteManager } from '@c.a.f/core';
import { Router } from '@angular/router';

constructor(private router: Router) {
  const routeHandler = new RouteHandler(router);
  const routeManager = new RouteManager(routeHandler);
}
```

## Exports

- `RouterService` — Injectable service providing core `RouteManager` with Angular Router integration
- `RouteHandler` — Angular Router adapter implementing `RouteRepository`

## Dependencies

- `@c.a.f/core` — Core primitives
- `@angular/core` — Angular core
- `@angular/router` — Angular Router

## License

MIT
