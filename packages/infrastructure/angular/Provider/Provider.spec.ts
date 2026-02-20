import { describe, it, expect } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { Ploc } from '@c.a.f/core';
import { CAF_CONTEXT, provideCAF } from './CAFContext';
import {
  injectCAFContext,
  injectPlocFromContext,
  injectUseCaseFromContext,
} from './injectCAFContext';

class CounterPloc extends Ploc<number> {
  constructor(initial = 0) {
    super(initial);
  }
}

const fakeUseCase = {
  execute: async () =>
    ({ loading: { value: false }, data: { value: null }, error: { value: null } }) as any,
};

describe('provideCAF / CAF_CONTEXT', () => {
  it('provideCAF returns providers that provide context value', () => {
    const ploc = new CounterPloc(5);
    const providers = provideCAF({ plocs: { counter: ploc }, useCases: { doIt: fakeUseCase } });
    const injector = Injector.create({ providers });
    const ctx = injector.get(CAF_CONTEXT);
    expect(ctx.plocs['counter']).toBe(ploc);
    expect(ctx.useCases['doIt']).toBe(fakeUseCase);
  });

  it('throws when CAF_CONTEXT is not provided (app must call provideCAF)', () => {
    const injector = Injector.create({ providers: [] });
    expect(() => injector.get(CAF_CONTEXT)).toThrow();
  });
});

describe('injectCAFContext', () => {
  it('returns context from provideCAF when run in injection context', () => {
    const ploc = new CounterPloc(42);
    const injector = Injector.create({
      providers: [provideCAF({ plocs: { counter: ploc } })],
    });
    runInInjectionContext(injector, () => {
      const ctx = injectCAFContext();
      expect(ctx.plocs['counter']).toBe(ploc);
    });
  });
});

describe('injectPlocFromContext', () => {
  it('returns undefined when key is not registered', () => {
    const injector = Injector.create({
      providers: [provideCAF({ plocs: { other: new CounterPloc(1) } })],
    });
    runInInjectionContext(injector, () => {
      const p = injectPlocFromContext<CounterPloc>('counter');
      expect(p).toBeUndefined();
    });
  });

  it('returns the Ploc when key is registered', () => {
    const ploc = new CounterPloc(7);
    const injector = Injector.create({
      providers: [provideCAF({ plocs: { counter: ploc } })],
    });
    runInInjectionContext(injector, () => {
      const p = injectPlocFromContext<CounterPloc>('counter');
      expect(p).toBe(ploc);
      expect(p?.state).toBe(7);
    });
  });
});

describe('injectUseCaseFromContext', () => {
  it('returns undefined when key is not registered', () => {
    const injector = Injector.create({
      providers: [provideCAF({ useCases: { other: fakeUseCase } })],
    });
    runInInjectionContext(injector, () => {
      const uc = injectUseCaseFromContext<[string], unknown>('createUser');
      expect(uc).toBeUndefined();
    });
  });

  it('returns the UseCase when key is registered', () => {
    const injector = Injector.create({
      providers: [provideCAF({ useCases: { doIt: fakeUseCase } })],
    });
    runInInjectionContext(injector, () => {
      const uc = injectUseCaseFromContext<[], void>('doIt');
      expect(uc).toBe(fakeUseCase);
      expect(typeof uc?.execute).toBe('function');
    });
  });
});
