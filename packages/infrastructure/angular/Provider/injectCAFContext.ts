import { inject } from '@angular/core';
import type { Ploc, UseCase } from '@c.a.f/core';
import { CAF_CONTEXT } from './CAFContext';

/**
 * Injects the CAF context (Plocs and UseCases registered via provideCAF).
 * Returns the context value; use .plocs[key] or .useCases[key], or use injectPlocFromContext / injectUseCaseFromContext.
 */
export function injectCAFContext() {
  return inject(CAF_CONTEXT);
}

/**
 * Injects a Ploc from the CAF context by key.
 * Use the generic for type-safe access. Returns undefined if the key is not registered.
 */
export function injectPlocFromContext<P extends Ploc<unknown>>(key: string): P | undefined {
  const { plocs } = inject(CAF_CONTEXT);
  return plocs[key] as P | undefined;
}

/**
 * Injects a UseCase from the CAF context by key.
 * Use generics for type-safe args and result. Returns undefined if the key is not registered.
 */
export function injectUseCaseFromContext<TArgs extends any[], TResult>(
  key: string
): UseCase<TArgs, TResult> | undefined {
  const { useCases } = inject(CAF_CONTEXT);
  return useCases[key] as UseCase<TArgs, TResult> | undefined;
}
