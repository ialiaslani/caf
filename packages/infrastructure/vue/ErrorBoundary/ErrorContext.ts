import { inject, type InjectionKey } from "vue";

/**
 * Context for CAF error boundary state.
 * Provides access to the current error and recovery function.
 */
export interface CAFErrorContextValue {
  error: Error | null;
  resetError: () => void;
}

export const CAFErrorContextKey: InjectionKey<CAFErrorContextValue> = Symbol(
  "CAFErrorContext"
);

/**
 * Vue composable to access CAF error boundary context.
 * Returns null if used outside of CAFErrorBoundary.
 */
export function useCAFError(): CAFErrorContextValue | null {
  return inject(CAFErrorContextKey, null);
}
