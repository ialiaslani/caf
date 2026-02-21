import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RouteHandler } from './RouteHandler';

describe('RouteHandler', () => {
  let mockRouter: { url: string; navigateByUrl: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockRouter = {
      url: '/home',
      navigateByUrl: vi.fn(),
    };
  });

  it('exposes currentRoute from router.url', () => {
    const handler = new RouteHandler(mockRouter as any);
    expect(handler.currentRoute).toBe('/home');
    mockRouter.url = '/other';
    expect(handler.currentRoute).toBe('/other');
  });

  it('change() calls router.navigateByUrl', () => {
    const handler = new RouteHandler(mockRouter as any);
    handler.change('/login');
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
