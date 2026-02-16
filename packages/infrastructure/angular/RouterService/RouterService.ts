import { RouteManager } from '@caf/core';
import { LOGIN_PATH, TOKEN_KEY } from '@caf/example-domain';
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

  constructor(private router: Router) {
    const routeHandler = new RouteHandler(router);
    this.routeManager = new RouteManager(routeHandler, {
      loginPath: LOGIN_PATH,
      isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
    });
  }

  getRouteManager(): RouteManager {
    return this.routeManager;
  }
}
