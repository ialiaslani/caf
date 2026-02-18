import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RouteManager, RouteManagerAuthOptions } from '../src/Route/Route';
import { RouteRepository } from '../src/Route/RouteRepository';

describe('RouteManager', () => {
  let mockRepo: RouteRepository & { change: ReturnType<typeof vi.fn>; currentRoute: string };

  beforeEach(() => {
    mockRepo = {
      currentRoute: '/',
      change: vi.fn(),
    };
  });

  describe('initialization', () => {
    it('should initialize with RouteRepository', () => {
      const manager = new RouteManager(mockRepo);
      expect(manager).toBeInstanceOf(RouteManager);
    });

    it('should initialize with RouteRepository and auth options', () => {
      const authOptions: RouteManagerAuthOptions = {
        loginPath: '/login',
        isLoggedIn: () => true,
      };
      const manager = new RouteManager(mockRepo, authOptions);
      expect(manager).toBeInstanceOf(RouteManager);
    });
  });

  describe('changeRoute', () => {
    it('should delegate to repository change method', () => {
      const manager = new RouteManager(mockRepo);
      manager.changeRoute('/home');
      expect(mockRepo.change).toHaveBeenCalledTimes(1);
      expect(mockRepo.change).toHaveBeenCalledWith('/home');
    });

    it('should handle multiple route changes', () => {
      const manager = new RouteManager(mockRepo);
      manager.changeRoute('/home');
      manager.changeRoute('/about');
      manager.changeRoute('/contact');

      expect(mockRepo.change).toHaveBeenCalledTimes(3);
      expect(mockRepo.change).toHaveBeenNthCalledWith(1, '/home');
      expect(mockRepo.change).toHaveBeenNthCalledWith(2, '/about');
      expect(mockRepo.change).toHaveBeenNthCalledWith(3, '/contact');
    });

    it('should handle empty route string', () => {
      const manager = new RouteManager(mockRepo);
      manager.changeRoute('');
      expect(mockRepo.change).toHaveBeenCalledWith('');
    });

    it('should handle route with query parameters', () => {
      const manager = new RouteManager(mockRepo);
      manager.changeRoute('/search?q=test');
      expect(mockRepo.change).toHaveBeenCalledWith('/search?q=test');
    });
  });

  describe('checkForLoginRoute', () => {
    it('should do nothing when auth options not provided', () => {
      const manager = new RouteManager(mockRepo);
      manager.checkForLoginRoute();
      expect(mockRepo.change).not.toHaveBeenCalled();
    });

    it('should redirect to login when not logged in', () => {
      const manager = new RouteManager(mockRepo, {
        loginPath: '/login',
        isLoggedIn: () => false,
      });
      manager.checkForLoginRoute();
      expect(mockRepo.change).toHaveBeenCalledTimes(1);
      expect(mockRepo.change).toHaveBeenCalledWith('/login');
    });

    it('should not redirect when already on login path', () => {
      mockRepo.currentRoute = '/login';
      const manager = new RouteManager(mockRepo, {
        loginPath: '/login',
        isLoggedIn: () => false,
      });
      manager.checkForLoginRoute();
      expect(mockRepo.change).not.toHaveBeenCalled();
    });

    it('should not redirect when logged in', () => {
      const manager = new RouteManager(mockRepo, {
        loginPath: '/login',
        isLoggedIn: () => true,
      });
      manager.checkForLoginRoute();
      expect(mockRepo.change).not.toHaveBeenCalled();
    });

    it('should not redirect when logged in and on different route', () => {
      mockRepo.currentRoute = '/dashboard';
      const manager = new RouteManager(mockRepo, {
        loginPath: '/login',
        isLoggedIn: () => true,
      });
      manager.checkForLoginRoute();
      expect(mockRepo.change).not.toHaveBeenCalled();
    });

    it('should redirect when not logged in and on protected route', () => {
      mockRepo.currentRoute = '/dashboard';
      const manager = new RouteManager(mockRepo, {
        loginPath: '/login',
        isLoggedIn: () => false,
      });
      manager.checkForLoginRoute();
      expect(mockRepo.change).toHaveBeenCalledWith('/login');
    });

    it('should call isLoggedIn each time checkForLoginRoute is called', () => {
      let loggedIn = false;
      const isLoggedIn = vi.fn(() => loggedIn);
      const manager = new RouteManager(mockRepo, {
        loginPath: '/login',
        isLoggedIn,
      });

      manager.checkForLoginRoute();
      expect(isLoggedIn).toHaveBeenCalledTimes(1);
      expect(mockRepo.change).toHaveBeenCalledWith('/login');

      loggedIn = true;
      manager.checkForLoginRoute();
      expect(isLoggedIn).toHaveBeenCalledTimes(2);
      expect(mockRepo.change).toHaveBeenCalledTimes(1); // Still 1, no new call
    });

    it('should handle different login paths', () => {
      mockRepo.currentRoute = '/dashboard';
      const manager = new RouteManager(mockRepo, {
        loginPath: '/signin',
        isLoggedIn: () => false,
      });
      manager.checkForLoginRoute();
      expect(mockRepo.change).toHaveBeenCalledWith('/signin');
    });
  });

  describe('isUserLoggedIn', () => {
    it('should return false without auth options', () => {
      const manager = new RouteManager(mockRepo);
      expect(manager.isUserLoggedIn()).toBe(false);
    });

    it('should return value from isLoggedIn when auth options provided', () => {
      const manager = new RouteManager(mockRepo, {
        loginPath: '/login',
        isLoggedIn: () => true,
      });
      expect(manager.isUserLoggedIn()).toBe(true);
    });

    it('should return false when isLoggedIn returns false', () => {
      const manager = new RouteManager(mockRepo, {
        loginPath: '/login',
        isLoggedIn: () => false,
      });
      expect(manager.isUserLoggedIn()).toBe(false);
    });

    it('should call isLoggedIn each time', () => {
      let callCount = 0;
      const isLoggedIn = vi.fn(() => {
        callCount++;
        return callCount % 2 === 0;
      });
      const manager = new RouteManager(mockRepo, {
        loginPath: '/login',
        isLoggedIn,
      });

      expect(manager.isUserLoggedIn()).toBe(false);
      expect(manager.isUserLoggedIn()).toBe(true);
      expect(manager.isUserLoggedIn()).toBe(false);
      expect(isLoggedIn).toHaveBeenCalledTimes(3);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete authentication flow', () => {
      let isLoggedIn = false;
      const manager = new RouteManager(mockRepo, {
        loginPath: '/login',
        isLoggedIn: () => isLoggedIn,
      });

      // Not logged in, on protected route
      mockRepo.currentRoute = '/dashboard';
      manager.checkForLoginRoute();
      expect(mockRepo.change).toHaveBeenCalledWith('/login');

      // User logs in
      isLoggedIn = true;
      mockRepo.currentRoute = '/login';
      manager.checkForLoginRoute();
      expect(mockRepo.change).toHaveBeenCalledTimes(1); // No redirect

      // Navigate to protected route
      manager.changeRoute('/dashboard');
      expect(mockRepo.change).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle multiple route checks', () => {
      const manager = new RouteManager(mockRepo, {
        loginPath: '/login',
        isLoggedIn: () => false,
      });

      mockRepo.currentRoute = '/page1';
      manager.checkForLoginRoute();
      expect(mockRepo.change).toHaveBeenCalledWith('/login');

      mockRepo.currentRoute = '/page2';
      manager.checkForLoginRoute();
      expect(mockRepo.change).toHaveBeenCalledTimes(2);
    });
  });

  describe('edge cases', () => {
    it('should handle empty login path', () => {
      mockRepo.currentRoute = '/dashboard';
      const manager = new RouteManager(mockRepo, {
        loginPath: '',
        isLoggedIn: () => false,
      });
      manager.checkForLoginRoute();
      expect(mockRepo.change).toHaveBeenCalledWith('');
    });

    it('should handle login path with trailing slash', () => {
      mockRepo.currentRoute = '/login/';
      const manager = new RouteManager(mockRepo, {
        loginPath: '/login',
        isLoggedIn: () => false,
      });
      // Should redirect because '/login/' !== '/login'
      manager.checkForLoginRoute();
      expect(mockRepo.change).toHaveBeenCalledWith('/login');
    });

    it('should handle route changes during checkForLoginRoute', () => {
      const manager = new RouteManager(mockRepo, {
        loginPath: '/login',
        isLoggedIn: () => false,
      });

      mockRepo.currentRoute = '/dashboard';
      manager.checkForLoginRoute();
      expect(mockRepo.change).toHaveBeenCalledWith('/login');

      // Simulate route change during check
      mockRepo.currentRoute = '/login';
      manager.checkForLoginRoute();
      expect(mockRepo.change).toHaveBeenCalledTimes(1); // No new call
    });
  });
});
