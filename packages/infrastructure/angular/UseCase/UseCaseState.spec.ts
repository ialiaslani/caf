import { describe, it, expect, vi } from 'vitest';
import { UseCase, pulse } from '@c.a.f/core';
import { UseCaseState } from './UseCaseState';

class MockUseCase implements UseCase<[string], string> {
  constructor(
    private impl: (
      arg: string
    ) => Promise<{ loading: ReturnType<typeof pulse>; data: ReturnType<typeof pulse>; error: ReturnType<typeof pulse> }>
  ) {}
  async execute(arg: string) {
    return this.impl(arg);
  }
}

describe('UseCaseState', () => {
  it('initial state: loading false, error null, data null', () => {
    const useCase = new MockUseCase(async () => ({
      loading: pulse(false),
      data: pulse(null! as string),
      error: pulse(null! as Error),
    }));
    const state = new UseCaseState(useCase);
    expect(state.loading()).toBe(false);
    expect(state.error()).toBeNull();
    expect(state.data()).toBeNull();
  });

  it('execute() updates signals from RequestResult', async () => {
    const loadingPulse = pulse(false);
    const dataPulse = pulse(null! as string);
    const errorPulse = pulse(null! as Error);

    const useCase = new MockUseCase(async () => ({
      loading: loadingPulse,
      data: dataPulse,
      error: errorPulse,
    }));

    const runner = new UseCaseState(useCase);
    await runner.execute('test');

    expect(runner.loading()).toBe(false);
    expect(runner.data()).toBeNull();

    loadingPulse.value = true;
    expect(runner.loading()).toBe(true);

    dataPulse.value = 'done';
    loadingPulse.value = false;
    expect(runner.data()).toBe('done');
    expect(runner.loading()).toBe(false);

    runner.destroy();
  });

  it('execute() returns data value', async () => {
    const useCase = new MockUseCase(async (arg: string) => ({
      loading: pulse(false),
      data: pulse(`result: ${arg}`),
      error: pulse(null! as Error),
    }));

    const runner = new UseCaseState(useCase);
    const result = await runner.execute('foo');
    expect(result).toBe('result: foo');
    expect(runner.data()).toBe('result: foo');
    runner.destroy();
  });

  it('handles execution exception', async () => {
    const useCase = new MockUseCase(async () => {
      throw new Error('failed');
    });

    const runner = new UseCaseState(useCase);
    const result = await runner.execute('x');
    expect(result).toBeNull();
    expect(runner.error()).toBeInstanceOf(Error);
    expect(runner.error()?.message).toBe('failed');
    expect(runner.loading()).toBe(false);
  });

  it('destroy() unsubscribes from RequestResult', async () => {
    const loadingPulse = pulse(false);
    const dataPulse = pulse(null! as string);
    const errorPulse = pulse(null! as Error);

    loadingPulse.unsubscribe = vi.fn(loadingPulse.unsubscribe.bind(loadingPulse));
    dataPulse.unsubscribe = vi.fn(dataPulse.unsubscribe.bind(dataPulse));
    errorPulse.unsubscribe = vi.fn(errorPulse.unsubscribe.bind(errorPulse));

    const useCase = new MockUseCase(async () => ({
      loading: loadingPulse,
      data: dataPulse,
      error: errorPulse,
    }));

    const runner = new UseCaseState(useCase);
    await runner.execute('test');
    runner.destroy();

    expect(loadingPulse.unsubscribe).toHaveBeenCalled();
    expect(dataPulse.unsubscribe).toHaveBeenCalled();
    expect(errorPulse.unsubscribe).toHaveBeenCalled();
  });
});
