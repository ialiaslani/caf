import { describe, it, expect, vi } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { RouteHandler } from './RouteHandler';
import { injectRouteManager } from './injectRouteManager';
import { ROUTE_MANAGER_AUTH_OPTIONS } from './ROUTE_MANAGER_AUTH_OPTIONS';

describe('injectRouteManager', () => {
  it('returns a RouteManager', () => {
    const mockRepo = {
      get currentRoute(): string {
        return '/';
      },
      change: vi.fn(),
    };
    const injector = Injector.create({
      providers: [{ provide: RouteHandler, useValue: mockRepo }],
    });
    const manager = runInInjectionContext(injector, () => injectRouteManager());
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
      providers: [{ provide: RouteHandler, useValue: mockRepo }],
    });
    const manager = runInInjectionContext(injector, () => injectRouteManager());
    manager.changeRoute('/dashboard');
    expect(changeSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('uses provided auth options for checkForLoginRoute', () => {
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
        { provide: RouteHandler, useValue: mockRepo },
        { provide: ROUTE_MANAGER_AUTH_OPTIONS, useValue: authOptions },
      ],
    });
    const manager = runInInjectionContext(injector, () => injectRouteManager());
    manager.checkForLoginRoute();
    expect(authOptions.isLoggedIn).toHaveBeenCalled();
    expect(changeSpy).toHaveBeenCalledWith('/login');
  });
});
