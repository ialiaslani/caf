import { RouteManager, RouteManagerAuthOptions } from '@c.a.f/core';
import { inject } from '@angular/core';
import { ROUTE_MANAGER_AUTH_OPTIONS } from './ROUTE_MANAGER_AUTH_OPTIONS';
import { injectRouteRepository } from './injectRouteRepository';

/**
 * Angular inject function that provides a RouteManager from @c.a.f/core.
 * Uses injectRouteRepository to get the RouteRepository implementation.
 * Mirrors useRouteManager() in React/Vue.
 *
 * @param authOptions - Optional authentication configuration. If not provided, uses
 *   ROUTE_MANAGER_AUTH_OPTIONS from injector when available, or RouteManager runs without auth checks.
 */
export const injectRouteManager = (
  authOptions?: RouteManagerAuthOptions
): RouteManager => {
  const routeRepository = injectRouteRepository();
  const injectedAuth =
    authOptions ?? inject(ROUTE_MANAGER_AUTH_OPTIONS, { optional: true }) ?? undefined;
  return new RouteManager(routeRepository, injectedAuth);
};
