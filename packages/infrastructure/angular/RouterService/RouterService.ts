import { RouteManager, RouteManagerAuthOptions } from '@c.a.f/core';
import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { RouteHandler } from '../RouteHandler';

/** Injection token for optional route-manager auth options. Provide in app config to enable auth redirect. */
export const ROUTE_MANAGER_AUTH_OPTIONS = new InjectionToken<RouteManagerAuthOptions>(
  'ROUTE_MANAGER_AUTH_OPTIONS'
);

/**
 * Provides the core RouteManager for Angular.
 * Uses RouteHandler (RouteRepository) so the same RouteManager contract works as in React/Vue.
 * Inject ROUTE_MANAGER_AUTH_OPTIONS (optional) to enable login redirect for unauthenticated users.
 */
@Injectable({ providedIn: 'root' })
export class RouterService {
  private routeManager: RouteManager;

  constructor(
    private router: Router,
    @Optional() @Inject(ROUTE_MANAGER_AUTH_OPTIONS) authOptions?: RouteManagerAuthOptions
  ) {
    const routeHandler = new RouteHandler(router);
    this.routeManager = new RouteManager(routeHandler, authOptions);
  }

  getRouteManager(): RouteManager {
    return this.routeManager;
  }
}
