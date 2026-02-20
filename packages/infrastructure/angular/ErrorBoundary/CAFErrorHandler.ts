import { ErrorHandler, Injectable, inject } from '@angular/core';
import { CAFErrorService } from './CAFErrorService';

/**
 * Custom ErrorHandler that forwards errors to CAFErrorService so you can show a fallback UI.
 * Provide in app config: { provide: ErrorHandler, useClass: CAFErrorHandler }
 * Then inject CAFErrorService and use error() signal + resetError() in your app component or layout.
 */
@Injectable()
export class CAFErrorHandler extends ErrorHandler {
  private readonly errorService = inject(CAFErrorService);

  override handleError(err: unknown): void {
    const error = err instanceof Error ? err : new Error(String(err));
    this.errorService.setError(error);
    super.handleError(err);
  }
}
