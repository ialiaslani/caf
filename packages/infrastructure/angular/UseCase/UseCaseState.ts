import type { UseCase, RequestResult } from '@c.a.f/core';
import { signal, type WritableSignal } from '@angular/core';

/**
 * Angular wrapper for a UseCase that exposes execute() and loading/error/data as signals.
 * Create in a component or service and call destroy() in ngOnDestroy to unsubscribe.
 *
 * @example
 * ```ts
 * runner = new UseCaseState(this.createUserUseCase);
 * // template: runner.loading(), runner.error(), runner.data()
 * await this.runner.execute({ name: 'John' });
 * ```
 * ```ts
 * ngOnDestroy() {
 *   this.runner.destroy();
 * }
 * ```
 */
export class UseCaseState<TArgs extends any[], TResult> {
  readonly loading: WritableSignal<boolean> = signal(false);
  readonly error: WritableSignal<Error | null> = signal(null);
  readonly data: WritableSignal<TResult | null> = signal(null);

  private lastResult: RequestResult<TResult> | null = null;
  private loadingListener: (v: boolean) => void = () => {};
  private dataListener: (v: TResult) => void = () => {};
  private errorListener: (v: Error) => void = () => {};

  constructor(private readonly useCase: UseCase<TArgs, TResult>) {}

  /**
   * Executes the use case with the given args. Updates loading, error, and data signals from the RequestResult.
   * Returns the final data value or null on error.
   */
  async execute(...args: TArgs): Promise<TResult | null> {
    this.unsubscribe();
    try {
      const result = await this.useCase.execute(...args);
      this.lastResult = result;

      this.loadingListener = (v: boolean) => this.loading.set(v);
      this.dataListener = (v: TResult) => this.data.set(v);
      this.errorListener = (v: Error) => this.error.set(v);

      result.loading.subscribe(this.loadingListener);
      result.data.subscribe(this.dataListener);
      result.error.subscribe(this.errorListener);

      this.loading.set(result.loading.value);
      this.data.set(result.data.value);
      this.error.set(result.error.value);

      return result.data.value;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      this.error.set(e);
      this.loading.set(false);
      return null;
    }
  }

  /** Unsubscribes from the current RequestResult. Call from ngOnDestroy. */
  destroy(): void {
    this.unsubscribe();
  }

  private unsubscribe(): void {
    if (this.lastResult) {
      this.lastResult.loading.unsubscribe(this.loadingListener);
      this.lastResult.data.unsubscribe(this.dataListener);
      this.lastResult.error.unsubscribe(this.errorListener);
      this.lastResult = null;
    }
  }
}
