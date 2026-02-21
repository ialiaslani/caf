import { RouteManager, RouteManagerAuthOptions } from '@c-a-f/core';
import { inject, Injectable } from '@angular/core';
import { injectRouteManager } from './injectRouteManager';
import { ROUTE_MANAGER_AUTH_OPTIONS } from './ROUTE_MANAGER_AUTH_OPTIONS';

/**
 * @deprecated Prefer `injectRouteManager()` for consistency with React/Vue.
 * Injectable that provides the core RouteManager. Uses injectRouteManager under the hood.
 */
@Injectable({ providedIn: 'root' })
export class RouterService {
  private routeManager: RouteManager;

  constructor() {
    this.routeManager = injectRouteManager(
      inject(ROUTE_MANAGER_AUTH_OPTIONS, { optional: true }) ?? undefined
    );
  }

  getRouteManager(): RouteManager {
    return this.routeManager;
  }
}
