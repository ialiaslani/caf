/**
 * Mount a Vue component with CAF context (Plocs/UseCases) so that usePlocFromContext
 * and useUseCaseFromContext work. Use this instead of raw mount() when testing
 * components that depend on CAF context.
 *
 * @example
 * ```ts
 * import { mountWithCAF, createTestPloc, mockUseCase } from '@c-a-f/testing/vue';
 * import { mount } from '@vue/test-utils';
 *
 * const ploc = createTestPloc({ count: 0 });
 * const wrapper = mountWithCAF(MyComponent, {
 *   plocs: { counter: ploc },
 *   useCases: { submit: mockUseCase.success({ id: '1' }) },
 * });
 * ```
 */

import type { Component } from 'vue';
import { mount, type MountingOptions, type VueWrapper } from '@vue/test-utils';
import type { Ploc, UseCase } from '@c-a-f/core';
import { CAFContextKey, type CAFContextValue } from '@c-a-f/infrastructure-vue';

export interface MountWithCAFOptions<Props = unknown> extends MountingOptions<Props> {
  /** Plocs to provide (keyed by string). */
  plocs?: Record<string, Ploc<unknown>>;
  /** UseCases to provide (keyed by string). */
  useCases?: Record<string, UseCase<any[], any>>;
}

/**
 * Mount a component with CAF context so Ploc/UseCase inject is available.
 * Returns the same VueWrapper as @vue/test-utils mount().
 */
export function mountWithCAF<ComponentPublicInstance = unknown>(
  component: Component,
  options: MountWithCAFOptions = {}
): VueWrapper<ComponentPublicInstance> {
  const { plocs, useCases, global: globalOptions, ...rest } = options;
  const cafValue: CAFContextValue = {
    plocs: plocs ?? {},
    useCases: useCases ?? {},
  };

  return mount(component, {
    ...rest,
    global: {
      ...globalOptions,
      provide: {
        ...(globalOptions?.provide as Record<symbol, unknown>),
        [CAFContextKey]: cafValue,
      },
    },
  }) as VueWrapper<ComponentPublicInstance>;
}
