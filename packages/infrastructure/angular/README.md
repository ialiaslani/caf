# @caf/infrastructure-angular

Angular-specific infrastructure adapters for CAF.

## Installation

```bash
npm install @caf/infrastructure-angular @angular/router
```

## Usage

### RouterService

Injectable service that provides a `RouteManager` from `@caf/core`:

```typescript
import { RouterService } from '@caf/infrastructure-angular';
import { RouteManagerAuthOptions } from '@caf/core';
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
import { RouteHandler } from '@caf/infrastructure-angular';
import { RouteManager } from '@caf/core';
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

- `@caf/core` — Core primitives
- `@angular/core` — Angular core
- `@angular/router` — Angular Router

## License

MIT
