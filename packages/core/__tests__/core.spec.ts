/// <reference path="./vitest.d.ts" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Test the built package output
import {
  Ploc,
  pulse,
  ApiRequest,
  RouteManager,
  RouteRepository,
  type UseCase,
} from '../.build/index.js';

// --- Ploc (abstract: test via a concrete subclass) ---
class CounterPloc extends Ploc<number> {
  constructor(initial = 0) {
    super(initial);
  }
  increment() {
    this.changeState(this.state + 1);
  }
}

describe('Ploc', () => {
  it('exposes initial state', () => {
    const ploc = new CounterPloc(5);
    expect(ploc.state).toBe(5);
  });

  it('updates state via changeState and notifies subscribers', () => {
    const ploc = new CounterPloc(0);
    const listener = vi.fn();
    ploc.subscribe(listener);
    ploc.changeState(10);
    expect(ploc.state).toBe(10);
    expect(listener).toHaveBeenCalledWith(10);
  });

  it('stops notifying after unsubscribe', () => {
    const ploc = new CounterPloc(0);
    const listener = vi.fn();
    ploc.subscribe(listener);
    ploc.unsubscribe(listener);
    ploc.changeState(1);
    expect(listener).not.toHaveBeenCalled();
  });
});

// --- Pulse / pulse ---
describe('pulse', () => {
  it('holds initial value on .value', () => {
    const p = pulse(42);
    expect(p.value).toBe(42);
  });

  it('updates .value and notifies subscribers', () => {
    const p = pulse(0);
    const listener = vi.fn();
    p.subscribe(listener);
    p.value = 10;
    expect(p.value).toBe(10);
    expect(listener).toHaveBeenCalledWith(10);
  });

  it('does not notify when value is unchanged', () => {
    const p = pulse(5);
    const listener = vi.fn();
    p.subscribe(listener);
    p.value = 5;
    expect(listener).not.toHaveBeenCalled();
  });

  it('stops notifying after unsubscribe', () => {
    const p = pulse(0);
    const listener = vi.fn();
    p.subscribe(listener);
    p.unsubscribe(listener);
    p.value = 1;
    expect(listener).not.toHaveBeenCalled();
  });
});

// --- ApiRequest ---
describe('ApiRequest', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('starts with loading false and null data/error', () => {
    const request = new ApiRequest(Promise.resolve('ok'));
    expect(request.loading.value).toBe(false);
    expect(request.data.value).toBeNull();
    expect(request.error.value).toBeNull();
  });

  it('sets loading then data on success', async () => {
    const request = new ApiRequest(Promise.resolve('result'));
    const result = request.mutate();
    expect(request.loading.value).toBe(true);
    await result;
    expect(request.loading.value).toBe(false);
    expect(request.data.value).toBe('result');
    expect(request.error.value).toBeNull();
  });

  it('sets error on rejected promise', async () => {
    const err = new Error('fail');
    const request = new ApiRequest(Promise.reject(err));
    await request.mutate();
    expect(request.loading.value).toBe(false);
    expect(request.error.value).toBe(err);
  });

  it('calls onSuccess when provided', async () => {
    const request = new ApiRequest(Promise.resolve(100));
    const onSuccess = vi.fn();
    await request.mutate({ onSuccess });
    expect(onSuccess).toHaveBeenCalledWith(100);
  });
});

// --- RouteManager + RouteRepository ---
describe('RouteManager', () => {
  let mockRepo: RouteRepository & { change: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockRepo = {
      currentRoute: '/',
      change: vi.fn(),
    };
  });

  it('changeRoute delegates to repository', () => {
    const manager = new RouteManager(mockRepo);
    manager.changeRoute('/home');
    expect(mockRepo.change).toHaveBeenCalledWith('/home');
  });

  it('checkForLoginRoute does nothing when auth options not provided', () => {
    const manager = new RouteManager(mockRepo);
    manager.checkForLoginRoute();
    expect(mockRepo.change).not.toHaveBeenCalled();
  });

  it('checkForLoginRoute redirects to login when not logged in', () => {
    const manager = new RouteManager(mockRepo, {
      loginPath: '/login',
      isLoggedIn: () => false,
    });
    manager.checkForLoginRoute();
    expect(mockRepo.change).toHaveBeenCalledWith('/login');
  });

  it('checkForLoginRoute does not redirect when already on login path', () => {
    mockRepo.currentRoute = '/login';
    const manager = new RouteManager(mockRepo, {
      loginPath: '/login',
      isLoggedIn: () => false,
    });
    manager.checkForLoginRoute();
    expect(mockRepo.change).not.toHaveBeenCalled();
  });

  it('checkForLoginRoute does not redirect when logged in', () => {
    const manager = new RouteManager(mockRepo, {
      loginPath: '/login',
      isLoggedIn: () => true,
    });
    manager.checkForLoginRoute();
    expect(mockRepo.change).not.toHaveBeenCalled();
  });

  it('isUserLoggedIn returns false without auth options', () => {
    const manager = new RouteManager(mockRepo);
    expect(manager.isUserLoggedIn()).toBe(false);
  });

  it('isUserLoggedIn returns value from isLoggedIn', () => {
    const manager = new RouteManager(mockRepo, {
      loginPath: '/login',
      isLoggedIn: () => true,
    });
    expect(manager.isUserLoggedIn()).toBe(true);
  });
});

// --- UseCase (interface: smoke test that a conforming implementation works) ---
describe('UseCase', () => {
  it('built package exposes types and a conforming use case can be used', async () => {
    const execute = vi.fn().mockResolvedValue({
      loading: pulse(false),
      data: pulse('done'),
      error: pulse(null as unknown as Error),
    }) as unknown as UseCase<[string], string>['execute'];
    const useCase: UseCase<[string], string> = { execute };
    const result = await useCase.execute('arg');
    expect(execute).toHaveBeenCalledWith('arg');
    expect(result.data.value).toBe('done');
  });
});
