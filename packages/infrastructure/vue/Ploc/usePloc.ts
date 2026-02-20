import { ref, watch, onUnmounted, type Ref } from "vue";
import type { Ploc } from "@c.a.f/core";

/** Infers the state type S from a Ploc subclass P (P extends Ploc<S>) */
type PlocState<P> = P extends Ploc<infer S> ? S : never;

/**
 * Vue composable that subscribes to a Ploc and returns the current state and the Ploc instance.
 * Handles subscription on mount, syncs when the ploc reference changes, and unsubscribes on unmount.
 *
 * @param ploc - A Ploc instance (from @c.a.f/core)
 * @returns A tuple of [stateRef, ploc] — stateRef is a Ref that updates when the Ploc state changes
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const [state, userPloc] = usePloc(userPloc);
 * await userPloc.loadUsers();
 * </script>
 * <template>
 *   <span>{{ state.name }}</span>
 * </template>
 * ```
 */
export function usePloc<P extends Ploc<PlocState<P>>>(
  ploc: P
): [Ref<PlocState<P>>, P] {
  const state = ref<PlocState<P>>(ploc.state) as Ref<PlocState<P>>;
  const currentPlocRef = ref<P>(ploc);

  const listener = (newState: PlocState<P>) => {
    state.value = newState;
  };

  ploc.subscribe(listener);

  onUnmounted(() => {
    currentPlocRef.value.unsubscribe(listener);
  });

  watch(
    () => ploc,
    (newPloc, oldPloc) => {
      if (oldPloc) {
        oldPloc.unsubscribe(listener);
      }
      currentPlocRef.value = newPloc;
      state.value = newPloc.state;
      newPloc.subscribe(listener);
    },
    { flush: "sync" }
  );

  return [state, ploc];
}
