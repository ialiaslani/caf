import { describe, it, expect, vi } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { RouteHandler } from './RouteHandler';
import { injectRouteRepository } from './injectRouteRepository';

describe('injectRouteRepository', () => {
  it('returns RouteRepository with currentRoute from injected RouteHandler', () => {
    let url = '/home';
    const mock = {
      get currentRoute(): string {
        return url;
      },
      change: vi.fn(),
    };
    const injector = Injector.create({
      providers: [{ provide: RouteHandler, useValue: mock }],
    });
    const repo = runInInjectionContext(injector, () => injectRouteRepository());
    expect(repo.currentRoute).toBe('/home');
    url = '/other';
    expect(repo.currentRoute).toBe('/other');
  });

  it('change() delegates to injected RouteHandler', () => {
    const changeSpy = vi.fn();
    const mock = {
      get currentRoute(): string {
        return '/home';
      },
      change: changeSpy,
    };
    const injector = Injector.create({
      providers: [{ provide: RouteHandler, useValue: mock }],
    });
    const repo = runInInjectionContext(injector, () => injectRouteRepository());
    repo.change('/login');
    expect(changeSpy).toHaveBeenCalledWith('/login');
  });
});
