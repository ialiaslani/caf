import { RouteManagerAuthOptions } from '@c.a.f/core';
import { InjectionToken } from '@angular/core';

/** Injection token for optional route-manager auth options. Provide in app config to enable auth redirect. */
export const ROUTE_MANAGER_AUTH_OPTIONS = new InjectionToken<RouteManagerAuthOptions>(
  'ROUTE_MANAGER_AUTH_OPTIONS'
);
