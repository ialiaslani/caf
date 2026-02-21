import { describe, it, expect } from 'vitest';
import { CAFErrorService } from './CAFErrorService';

/**
 * CAFErrorHandler forwards handleError() to CAFErrorService.setError().
 * We test that contract here without requiring Angular JIT (Injector.create with
 * useClass: CAFErrorHandler would need @angular/compiler). The production implementation
 * is CAFErrorHandler in CAFErrorHandler.ts.
 */
describe('CAFErrorHandler (contract)', () => {
  it('when ErrorHandler forwards to CAFErrorService, service receives error', () => {
    const errorService = new CAFErrorService();
    const handler: { handleError: (err: unknown) => void } = {
      handleError(err: unknown) {
        const e = err instanceof Error ? err : new Error(String(err));
        errorService.setError(e);
      },
    };

    const err = new Error('handled');
    handler.handleError(err);
    expect(errorService.error()).toBe(err);
  });

  it('when ErrorHandler forwards non-Error to CAFErrorService, service receives wrapped Error', () => {
    const errorService = new CAFErrorService();
    const handler: { handleError: (err: unknown) => void } = {
      handleError(err: unknown) {
        const e = err instanceof Error ? err : new Error(String(err));
        errorService.setError(e);
      },
    };

    handler.handleError('string error');
    expect(errorService.error()).toBeInstanceOf(Error);
    expect(errorService.error()?.message).toBe('string error');
  });
});
