import { RouteRepository } from '@c.a.f/core';
import { inject } from '@angular/core';
import { RouteHandler } from './RouteHandler';

/**
 * Angular inject function that provides a RouteRepository implementation.
 * Uses Angular Router via RouteHandler. Mirrors useRouteRepository() in React/Vue.
 */
export const injectRouteRepository = (): RouteRepository => {
  return inject(RouteHandler);
};
