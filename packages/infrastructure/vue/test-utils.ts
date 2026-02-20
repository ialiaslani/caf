import { createApp, h, type Component } from "vue";

/**
 * Mount a composable inside a minimal Vue app so lifecycle hooks (onMounted, onUnmounted, etc.) run.
 * Returns [composableResult, unmount].
 */
export function withSetup<T>(composable: () => T): [T, () => void] {
  let result: T;
  const app = createApp({
    setup() {
      result = composable();
      return () => h("div");
    },
  });
  const el = document.createElement("div");
  app.mount(el);
  return [
    result!,
    () => {
      app.unmount();
    },
  ];
}

/**
 * Mount a component tree (e.g. CAFProvider with child) and return the wrapper element and unmount.
 */
export function mountComponent(component: Component, props?: Record<string, unknown>) {
  const app = createApp(component, props ?? {});
  const el = document.createElement("div");
  app.mount(el);
  return {
    el,
    unmount: () => app.unmount(),
  };
}
