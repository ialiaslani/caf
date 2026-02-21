import { ref, onMounted, onUnmounted } from "vue";
import type { Ploc } from "@c-a-f/core";

/**
 * Vue composable that provides a simple DevTools toggle for CAF applications.
 * When enabled, exposes a global __CAF_DEVTOOLS__ on window for debugging (e.g. from console).
 *
 * @param options - { enabled?: boolean } default false
 * @returns { enabled: Ref<boolean>, enable: () => void, disable: () => void }
 *
 * @example
 * ```vue
 * const devTools = useCAFDevTools({ enabled: import.meta.env.DEV });
 * devTools.enable();
 * // In console: window.__CAF_DEVTOOLS__
 * ```
 */
export function useCAFDevTools(options?: { enabled?: boolean }) {
  const enabled = ref(options?.enabled ?? false);

  const enable = () => {
    enabled.value = true;
  };

  const disable = () => {
    enabled.value = false;
  };

  onMounted(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { __CAF_DEVTOOLS__?: { enabled: typeof enabled; enable: () => void; disable: () => void; plocs?: Map<Ploc<unknown>, { name: string; state: unknown }> } }).__CAF_DEVTOOLS__ = {
        enabled,
        enable,
        disable,
        plocs: new Map(),
      };
    }
  });

  onUnmounted(() => {
    if (typeof window !== "undefined") {
      delete (window as unknown as { __CAF_DEVTOOLS__?: unknown }).__CAF_DEVTOOLS__;
    }
  });

  return {
    enabled,
    enable,
    disable,
  };
}

/**
 * Helper to register a Ploc with DevTools (for manual inspection via window.__CAF_DEVTOOLS__).
 * Call useCAFDevTools() once at app root, then useTrackPloc(ploc) in components that hold a Ploc.
 *
 * @param ploc - Ploc instance to track
 * @param name - Optional name for the Ploc
 */
export function useTrackPloc<T>(ploc: Ploc<T>, name?: string): void {
  onMounted(() => {
    if (typeof window !== "undefined") {
      const dt = (window as any).__CAF_DEVTOOLS__;
      if (dt?.plocs) dt.plocs.set(ploc, { name: name ?? "Ploc", state: ploc.state });
    }
  });
  onUnmounted(() => {
    if (typeof window !== "undefined" && (window as any).__CAF_DEVTOOLS__?.plocs) {
      (window as any).__CAF_DEVTOOLS__.plocs.delete(ploc);
    }
  });
}
