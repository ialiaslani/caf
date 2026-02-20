import { defineComponent, ref, provide, onErrorCaptured, h, type PropType } from "vue";
import { CAFErrorContextKey, type CAFErrorContextValue } from "./ErrorContext";

export interface CAFErrorBoundaryProps {
  /** Custom fallback render. Receives error and reset function. */
  fallback?: (props: { error: Error; resetError: () => void }) => any;
  /** Called when an error is caught (e.g. for logging). */
  onError?: (error: Error) => void;
}

/**
 * Error boundary component for Vue/CAF applications.
 * Catches errors from child components (and Ploc/UseCase execution in templates).
 * Provides error context via provide/inject and supports custom error UI and recovery.
 *
 * @example
 * ```vue
 * <CAFErrorBoundary :fallback="({ error, resetError }) => (
 *   <div>
 *     <h2>Something went wrong</h2>
 *     <p>{{ error.message }}</p>
 *     <button @click="resetError">Try again</button>
 *   </div>
 * )">
 *   <App />
 * </CAFErrorBoundary>
 * ```
 */
export const CAFErrorBoundary = defineComponent({
  name: "CAFErrorBoundary",
  props: {
    fallback: {
      type: Function as PropType<(p: { error: Error; resetError: () => void }) => unknown>,
      default: undefined,
    },
    onError: {
      type: Function as PropType<(e: Error) => void>,
      default: undefined,
    },
  },
  setup(
    props: CAFErrorBoundaryProps,
    { slots }: { slots: { default?: () => unknown } }
  ) {
    const error = ref<Error | null>(null);

    const resetError = () => {
      error.value = null;
    };

    onErrorCaptured((err: unknown) => {
      const e = err instanceof Error ? err : new Error(String(err));
      error.value = e;
      props.onError?.(e);
      return false; // prevent propagation
    });

    provide(CAFErrorContextKey, {
      get error() {
        return error.value;
      },
      resetError,
    });

    return () => {
      if (error.value) {
        const ctx: CAFErrorContextValue = {
          error: error.value,
          resetError,
        };
        if (props.fallback) {
          return props.fallback({ error: error.value, resetError });
        }
        return h(
          "div",
          {
            style: {
              padding: "2rem",
              margin: "1rem",
              border: "1px solid #ff6b6b",
              borderRadius: "8px",
              backgroundColor: "#fff5f5",
            },
          },
          [
            h("h2", { style: { color: "#c92a2a", marginTop: 0 } }, "Something went wrong"),
            h(
              "pre",
              {
                style: {
                  marginTop: "0.5rem",
                  padding: "1rem",
                  backgroundColor: "#fff",
                  borderRadius: "4px",
                  overflow: "auto",
                  fontSize: "0.875rem",
                },
              },
              error.value.toString()
            ),
            h(
              "button",
              {
                onClick: resetError,
                style: {
                  padding: "0.5rem 1rem",
                  backgroundColor: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "1rem",
                },
              },
              "Try again"
            ),
          ]
        );
      }
      return slots.default?.();
    };
  },
});
