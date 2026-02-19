import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { createSuccessResult } from '../../src/core/UseCaseTestHelpers';
import { renderWithCAF, createTestPloc, waitForPlocState, mockUseCase } from '../../src/react';

// Full render tests require a single React instance (no duplicate react in node_modules).
// Use renderWithCAF in your app tests; see README for examples.
describe('renderWithCAF', () => {
  it.skip('returns render result when given ui and options (run in app to avoid duplicate React)', () => {
    const ploc = createTestPloc({ count: 0 });
    const result = renderWithCAF(<div data-testid="root">Hello</div>, { plocs: { counter: ploc } });
    expect(result).toBeDefined();
    expect(result.getByTestId('root')).toHaveTextContent('Hello');
  });
});

describe('createTestPloc', () => {
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

describe('waitForPlocState', () => {
  it('resolves when predicate matches', async () => {
    const ploc = createTestPloc({ count: 0 });
    const promise = waitForPlocState(ploc, (s) => s.count === 2);
    ploc.changeState({ count: 1 });
    ploc.changeState({ count: 2 });
    const state = await promise;
    expect(state).toEqual({ count: 2 });
  });
});

describe('mockUseCase', () => {
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
