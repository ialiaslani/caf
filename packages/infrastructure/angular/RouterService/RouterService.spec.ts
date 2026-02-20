import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RouterService, ROUTE_MANAGER_AUTH_OPTIONS } from './RouterService';

describe('RouterService', () => {
  let mockRouter: { url: string; navigateByUrl: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockRouter = {
      url: '/',
      navigateByUrl: vi.fn(),
    };
  });

  it('provides RouteManager via getRouteManager()', () => {
    const service = new RouterService(mockRouter as any);
    const manager = service.getRouteManager();
    expect(manager).toBeDefined();
    expect(typeof manager.changeRoute).toBe('function');
    expect(typeof manager.checkForLoginRoute).toBe('function');
  });

  it('changeRoute delegates to router', () => {
    const service = new RouterService(mockRouter as any);
    service.getRouteManager().changeRoute('/dashboard');
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('accepts optional auth options and uses them for checkForLoginRoute', () => {
    const authOptions = {
      loginPath: '/login',
      isLoggedIn: vi.fn(() => false),
    };
    const service = new RouterService(mockRouter as any, authOptions);
    mockRouter.url = '/dashboard';
    service.getRouteManager().checkForLoginRoute();
    expect(authOptions.isLoggedIn).toHaveBeenCalled();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
