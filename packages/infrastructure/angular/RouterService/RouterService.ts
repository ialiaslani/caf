import { RouteManager, RouteManagerAuthOptions } from '@caf/core';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RouteHandler } from '../RouteHandler';

/**
 * Provides the core RouteManager for Angular.
 * Uses RouteHandler (RouteRepository) so the same RouteManager contract works as in React/Vue.
 */
@Injectable({ providedIn: 'root' })
export class RouterService {
  private routeManager: RouteManager;

  constructor(private router: Router, authOptions?: RouteManagerAuthOptions) {
    const routeHandler = new RouteHandler(router);
    this.routeManager = new RouteManager(routeHandler, authOptions);
  }

  getRouteManager(): RouteManager {
    return this.routeManager;
  }
}
