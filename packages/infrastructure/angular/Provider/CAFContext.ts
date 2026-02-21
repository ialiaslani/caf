import { InjectionToken, type Provider } from '@angular/core';
import type { Ploc, UseCase } from '@c-a-f/core';

/**
 * Value provided by CAF (Plocs and UseCases by key).
 * Use provideCAF() in app config and injectCAFContext() / injectPlocFromContext() / injectUseCaseFromContext() in components.
 */
export interface CAFContextValue {
  plocs: Record<string, Ploc<unknown>>;
  useCases: Record<string, UseCase<any[], any>>;
}

const defaultContextValue: CAFContextValue = {
  plocs: {},
  useCases: {},
};

/** Injection token for CAF context. Provide via provideCAF(). */
export const CAF_CONTEXT = new InjectionToken<CAFContextValue>('CAF_CONTEXT', {
  providedIn: null,
  factory: () => defaultContextValue,
});

/**
 * Returns Angular providers for CAF context (Plocs and UseCases by key).
 * Use in app config: providers: [provideCAF({ plocs: { user: userPloc }, useCases: { createUser } })]
 */
export function provideCAF(config: {
  plocs?: Record<string, Ploc<unknown>>;
  useCases?: Record<string, UseCase<any[], any>>;
}): Provider {
  const value: CAFContextValue = {
    plocs: config.plocs ?? {},
    useCases: config.useCases ?? {},
  };
  return { provide: CAF_CONTEXT, useValue: value };
}
