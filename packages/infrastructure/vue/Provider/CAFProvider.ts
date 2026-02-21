import { defineComponent, provide, type PropType } from "vue";
import type { Ploc, UseCase } from "@c-a-f/core";
import { CAFContextKey, type CAFContextValue } from "./CAFContext";

export interface CAFProviderProps {
  /**
   * Plocs to provide to the tree, keyed by string.
   * Descendants can access via useCAFContext().plocs[key] or usePlocFromContext(key).
   */
  plocs?: Record<string, Ploc<unknown>>;
  /**
   * UseCases to provide to the tree, keyed by string.
   * Descendants can access via useCAFContext().useCases[key] or useUseCaseFromContext(key).
   */
  useCases?: Record<string, UseCase<any[], any>>;
}

/**
 * Root-level provider for Plocs and UseCases. Register instances by key so any descendant
 * can access them without prop drilling.
 *
 * @example
 * ```vue
 * <CAFProvider :plocs="{ user: userPloc }" :use-cases="{ createUser }">
 *   <App />
 * </CAFProvider>
 * ```
 */
export const CAFProvider = defineComponent({
  name: "CAFProvider",
  props: {
    plocs: {
      type: Object as PropType<Record<string, Ploc<unknown>>>,
      default: () => ({}),
    },
    useCases: {
      type: Object as PropType<Record<string, UseCase<any[], any>>>,
      default: () => ({}),
    },
  },
  setup(props, { slots }) {
    const value: CAFContextValue = {
      plocs: { ...props.plocs },
      useCases: { ...props.useCases },
    };
    provide(CAFContextKey, value);
    return () => slots.default?.();
  },
});
