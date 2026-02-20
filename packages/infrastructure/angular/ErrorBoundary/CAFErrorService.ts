import { Injectable, signal, type WritableSignal } from '@angular/core';

/**
 * Service that holds the last caught error and a reset function.
 * Use with CAFErrorHandler so the handler pushes errors here; components can inject CAFErrorService
 * and show a fallback when error() is non-null, and call resetError() to clear.
 */
@Injectable({ providedIn: 'root' })
export class CAFErrorService {
  /** Current error, or null if none. */
  readonly error: WritableSignal<Error | null> = signal(null);

  /** Clears the current error. */
  resetError(): void {
    this.error.set(null);
  }

  /** Called by CAFErrorHandler when an error is caught. */
  setError(err: Error): void {
    this.error.set(err);
  }
}
