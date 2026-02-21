import { describe, it, expect } from 'vitest';
import { defineComponent, h } from 'vue';
import type { Ploc } from '@c-a-f/core';
import { createSuccessResult } from '../../src/core/UseCaseTestHelpers';
import {
  mountWithCAF,
  createTestPloc,
  waitForPlocState,
  mockUseCase,
} from '../../src/vue';
import { usePlocFromContext, usePloc } from '@c-a-f/infrastructure-vue';

const CounterConsumer = defineComponent({
  name: 'CounterConsumer',
  setup() {
    const ploc = usePlocFromContext<Ploc<{ count: number }>>('counter');
    const [state] = usePloc(ploc!);
    return () =>
      h('span', { 'data-testid': 'count' }, String(state?.value?.count ?? ''));
  },
});

describe('@c-a-f/testing/vue mountWithCAF', () => {
  it('mounts component with CAF context and provides plocs', () => {
    const ploc = createTestPloc({ count: 5 });
    const wrapper = mountWithCAF(CounterConsumer, { plocs: { counter: ploc } });
    expect(wrapper.get('[data-testid="count"]').text()).toBe('5');
  });

  it('component receives updated ploc state', async () => {
    const ploc = createTestPloc({ count: 0 });
    const wrapper = mountWithCAF(CounterConsumer, { plocs: { counter: ploc } });
    expect(wrapper.get('[data-testid="count"]').text()).toBe('0');
    ploc.changeState({ count: 3 });
    await wrapper.vm.$nextTick();
    expect(wrapper.get('[data-testid="count"]').text()).toBe('3');
  });

  it('mounts with empty options when no plocs or useCases', () => {
    const EmptyConsumer = defineComponent({
      setup() {
        const ctx = usePlocFromContext('counter');
        return () => h('span', { 'data-testid': 'empty' }, ctx ? 'has' : 'none');
      },
    });
    const wrapper = mountWithCAF(EmptyConsumer, {});
    expect(wrapper.get('[data-testid="empty"]').text()).toBe('none');
  });
});

describe('@c-a-f/testing/vue createTestPloc', () => {
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

describe('@c-a-f/testing/vue waitForPlocState', () => {
  it('resolves when predicate matches', async () => {
    const ploc = createTestPloc({ count: 0 });
    const promise = waitForPlocState(ploc, (s) => s.count === 2);
    ploc.changeState({ count: 1 });
    ploc.changeState({ count: 2 });
    const state = await promise;
    expect(state).toEqual({ count: 2 });
  });
});

describe('@c-a-f/testing/vue mockUseCase', () => {
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
