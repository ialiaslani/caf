import '@angular/compiler';
import { describe, it, expect, vi } from 'vitest';
import { inject, Injector, runInInjectionContext } from '@angular/core';
import { RouteHandler } from './RouteHandler';
import { ROUTE_MANAGER_AUTH_OPTIONS } from './ROUTE_MANAGER_AUTH_OPTIONS';
import { RouterService } from './RouterService';

describe('RouterService', () => {
  it('provides RouteManager via getRouteManager()', () => {
    const mockRepo = {
      get currentRoute(): string {
        return '/';
      },
      change: vi.fn(),
    };
    const injector = Injector.create({
      providers: [
        RouterService,
        { provide: RouteHandler, useValue: mockRepo },
      ],
    });
    const service = runInInjectionContext(injector, () => inject(RouterService));
    const manager = service.getRouteManager();
    expect(manager).toBeDefined();
    expect(typeof manager.changeRoute).toBe('function');
    expect(typeof manager.checkForLoginRoute).toBe('function');
  });

  it('changeRoute delegates to RouteHandler.change', () => {
    const changeSpy = vi.fn();
    const mockRepo = {
      get currentRoute(): string {
        return '/';
      },
      change: changeSpy,
    };
    const injector = Injector.create({
      providers: [
        RouterService,
        { provide: RouteHandler, useValue: mockRepo },
      ],
    });
    const service = runInInjectionContext(injector, () => inject(RouterService));
    service.getRouteManager().changeRoute('/dashboard');
    expect(changeSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('works without ROUTE_MANAGER_AUTH_OPTIONS (no auth redirect)', () => {
    const changeSpy = vi.fn();
    const mockRepo = {
      get currentRoute(): string {
        return '/dashboard';
      },
      change: changeSpy,
    };
    const injector = Injector.create({
      providers: [
        RouterService,
        { provide: RouteHandler, useValue: mockRepo },
      ],
    });
    const service = runInInjectionContext(injector, () => inject(RouterService));
    const manager = service.getRouteManager();
    manager.checkForLoginRoute();
    expect(changeSpy).not.toHaveBeenCalled();
  });

  it('accepts optional auth options and uses them for checkForLoginRoute', () => {
    const authOptions = {
      loginPath: '/login',
      isLoggedIn: vi.fn(() => false),
    };
    const changeSpy = vi.fn();
    const mockRepo = {
      get currentRoute(): string {
        return '/dashboard';
      },
      change: changeSpy,
    };
    const injector = Injector.create({
      providers: [
        RouterService,
        { provide: RouteHandler, useValue: mockRepo },
        { provide: ROUTE_MANAGER_AUTH_OPTIONS, useValue: authOptions },
      ],
    });
    const service = runInInjectionContext(injector, () => inject(RouterService));
    service.getRouteManager().checkForLoginRoute();
    expect(authOptions.isLoggedIn).toHaveBeenCalled();
    expect(changeSpy).toHaveBeenCalledWith('/login');
  });
});