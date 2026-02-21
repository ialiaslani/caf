import { RouteRepository } from '@c-a-f/core';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

/**
 * App-local RouteRepository implementation so it is AOT-compiled with the app.
 * The same logic as @c-a-f/infrastructure-angular RouteHandler; we provide this
 * for the RouteHandler token to avoid JIT compilation of the package class.
 */
@Injectable({ providedIn: 'root' })
export class AppRouteHandler implements RouteRepository {
  constructor(private router: Router) {}

  get currentRoute(): string {
    return this.router.url;
  }

  change(route: string): void {
    this.router.navigateByUrl(route);
  }
}
