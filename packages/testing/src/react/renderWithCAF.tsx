/**
 * Render a React component with CAFProvider so that usePlocFromContext and
 * useUseCaseFromContext work. Use this instead of raw render() when testing
 * components that depend on CAF context.
 *
 * @example
 * ```tsx
 * import { renderWithCAF, createTestPloc, mockUseCase } from '@c-a-f/testing/react';
 *
 * const ploc = createTestPloc({ count: 0 });
 * const { getByRole } = renderWithCAF(<Counter />, {
 *   plocs: { counter: ploc },
 *   useCases: { submit: mockUseCase.success({ id: '1' }) },
 * });
 * ```
 */

import React, { type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import type { Ploc } from '@c-a-f/core';
import type { UseCase } from '@c-a-f/core';
import { CAFProvider } from '@c-a-f/infrastructure-react';

export interface RenderWithCAFOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Plocs to provide (keyed by string). */
  plocs?: Record<string, Ploc<unknown>>;
  /** UseCases to provide (keyed by string). */
  useCases?: Record<string, UseCase<any[], any>>;
}

/**
 * Wrapper that provides CAFProvider around the component tree.
 */
function createCAFWrapper(plocs?: Record<string, Ploc<unknown>>, useCases?: Record<string, UseCase<any[], any>>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <CAFProvider plocs={plocs ?? {}} useCases={useCases ?? {}}>
        {children}
      </CAFProvider>
    );
  };
}

/**
 * Render a component with CAFProvider so Ploc/UseCase context is available.
 * Returns the same result as React Testing Library's render().
 */
export function renderWithCAF(
  ui: ReactElement,
  options: RenderWithCAFOptions = {}
): RenderResult {
  const { plocs, useCases, ...renderOptions } = options;
  const Wrapper = createCAFWrapper(plocs, useCases);

  return render(ui, {
    ...renderOptions,
    wrapper: Wrapper,
  });
}
