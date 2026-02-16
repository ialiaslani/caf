import { RouteRepository } from '@caf/core';
import { Router } from '@angular/router';

/**
 * Angular adapter for the core RouteRepository.
 * Uses Angular Router so RouteManager from @caf/core works in Angular apps.
 */
export class RouteHandler implements RouteRepository {
  constructor(private router: Router) {}

  get currentRoute(): string {
    return this.router.url;
  }

  change(route: string): void {
    this.router.navigateByUrl(route);
  }
}
