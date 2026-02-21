import { RouteRepository } from '@c.a.f/core';
import { Injectable } from '@angular/core';
import type { Router } from '@angular/router';

/**
 * Angular adapter for the core RouteRepository.
 * Uses Angular Router so RouteManager from @c.a.f/core works in Angular apps.
 * Prefer `injectRouteRepository()` for a consistent API with React/Vue.
 */
@Injectable({ providedIn: 'root' })
export class RouteHandler implements RouteRepository {
  constructor(private router: Router) {}

  get currentRoute(): string {
    return this.router.url;
  }

  change(route: string): void {
    this.router.navigateByUrl(route);
  }
}
