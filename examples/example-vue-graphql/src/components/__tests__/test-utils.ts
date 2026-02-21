/**
 * Test helper: mount a component with CAFProvider so usePlocFromContext / useUseCaseFromContext work.
 */
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import { CAFProvider } from '@c-a-f/infrastructure-vue';
import type { Ploc } from '@c-a-f/core';
import type { UseCase } from '@c-a-f/core';

export interface RenderWithCAFOptions {
  plocs?: Record<string, Ploc<unknown>>;
  useCases?: Record<string, UseCase<unknown[], unknown>>;
}

export function renderWithCAF(
  component: object,
  options: RenderWithCAFOptions = {}
) {
  const { plocs = {}, useCases = {} } = options;
  return mount(CAFProvider, {
    props: { plocs, useCases },
    slots: {
      default: () => h(component),
    },
  });
}
