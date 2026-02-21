import { describe, it, expect } from 'vitest';
import { createSuccessResult } from '../../src/core/UseCaseTestHelpers';
import {
  provideTestingCAF,
  createTestPloc,
  waitForPlocState,
  mockUseCase,
} from '../../src/angular';

describe('@c-a-f/testing/angular provideTestingCAF', () => {
  it('returns provider with provide and useValue', () => {
    const ploc = createTestPloc({ count: 0 });
    const provider = provideTestingCAF({ plocs: { counter: ploc } }) as {
      provide: unknown;
      useValue: { plocs?: Record<string, unknown>; useCases?: Record<string, unknown> };
    };
    expect(provider).toHaveProperty('provide');
    expect(provider).toHaveProperty('useValue');
    expect(provider.useValue).toHaveProperty('plocs');
    expect(provider.useValue).toHaveProperty('useCases');
    expect(provider.useValue.plocs?.counter).toBe(ploc);
  });

  it('accepts useCases', () => {
    const uc = mockUseCase.success({ id: '1' });
    const provider = provideTestingCAF({ useCases: { submit: uc } }) as {
      useValue: { useCases?: Record<string, unknown> };
    };
    expect(provider.useValue.useCases?.submit).toBe(uc);
  });
});

describe('@c-a-f/testing/angular createTestPloc', () => {
  it('creates ploc with initial state', () => {
    const ploc = createTestPloc({ count: 0 });
    expect(ploc.state).toEqual({ count: 0 });
  });

  it('allows changing state', () => {
    const ploc = createTestPloc({ count: 0 });
    ploc.changeState({ count: 1 });
    expect(ploc.state.count).toBe(1);
  });
});

describe('@c-a-f/testing/angular waitForPlocState', () => {
  it('resolves when predicate matches', async () => {
    const ploc = createTestPloc({ count: 0 });
    const promise = waitForPlocState(ploc, (s) => s.count === 2);
    ploc.changeState({ count: 1 });
    ploc.changeState({ count: 2 });
    const state = await promise;
    expect(state).toEqual({ count: 2 });
  });
});

describe('@c-a-f/testing/angular mockUseCase', () => {
  it('success returns data', async () => {
    const uc = mockUseCase.success({ id: '1' });
    const result = await uc.execute();
    expect(result.data.value).toEqual({ id: '1' });
  });

  it('error returns error', async () => {
    const err = new Error('Fail');
    const uc = mockUseCase.error(err);
    const result = await uc.execute();
    expect(result.error.value).toBe(err);
  });

  it('fn uses custom implementation', async () => {
    const uc = mockUseCase.fn<[number], number>((n) =>
      Promise.resolve(createSuccessResult(n * 2))
    );
    const result = await uc.execute(21);
    expect(result.data.value).toBe(42);
  });
});
