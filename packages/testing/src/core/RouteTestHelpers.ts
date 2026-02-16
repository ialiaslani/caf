/**
 * Test helpers for RouteManager and RouteRepository.
 * 
 * Provides mock implementations and utilities for testing routing.
 * 
 * @example
 * ```ts
 * import { createMockRouteRepository, createRouteManagerTester } from '@c.a.f/testing/core';
 * import { RouteManager } from '@c.a.f/core';
 * 
 * const mockRepo = createMockRouteRepository();
 * const routeManager = new RouteManager(mockRepo);
 * const tester = createRouteManagerTester(routeManager);
 * 
 * await tester.changeRoute('/dashboard');
 * expect(tester.getCurrentRoute()).toBe('/dashboard');
 * ```
 */

import type { RouteRepository, RouteManager } from '@c.a.f/core';

/**
 * Mock RouteRepository implementation for testing.
 */
export class MockRouteRepository implements RouteRepository {
  private _currentRoute: string = '/';

  get currentRoute(): string {
    return this._currentRoute;
  }

  change(route: string): void {
    this._currentRoute = route;
  }

  /**
   * Set the current route directly (for testing).
   */
  setRoute(route: string): void {
    this._currentRoute = route;
  }

  /**
   * Get route change history.
   */
  getRouteHistory(): string[] {
    return [this._currentRoute];
  }
}

/**
 * Create a mock RouteRepository.
 */
export function createMockRouteRepository(): MockRouteRepository {
  return new MockRouteRepository();
}

/**
 * RouteManager tester utility.
 */
export class RouteManagerTester {
  private routeHistory: string[] = [];

  constructor(public readonly routeManager: RouteManager) {
    // Track route changes if possible
    const repo = (routeManager as any).routeRepository;
    if (repo instanceof MockRouteRepository) {
      this.routeHistory.push(repo.currentRoute);
    }
  }

  /**
   * Change route and track it.
   */
  async changeRoute(route: string): Promise<void> {
    this.routeManager.changeRoute(route);
    this.routeHistory.push(route);
  }

  /**
   * Get the current route.
   */
  getCurrentRoute(): string {
    return (this.routeManager as any).routeRepository.currentRoute;
  }

  /**
   * Get route change history.
   */
  getRouteHistory(): string[] {
    return [...this.routeHistory];
  }

  /**
   * Check if user is logged in (based on RouteManager auth options).
   */
  checkForLoginRoute(): void {
    this.routeManager.checkForLoginRoute();
  }
}

/**
 * Create a RouteManager tester instance.
 */
export function createRouteManagerTester(routeManager: RouteManager): RouteManagerTester {
  return new RouteManagerTester(routeManager);
}
