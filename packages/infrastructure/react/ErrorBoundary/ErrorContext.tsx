import { createContext, useContext } from "react";

/**
 * Context for CAF error boundary state.
 * Provides access to the current error and recovery function.
 */
export interface CAFErrorContextValue {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  resetError: () => void;
}

export const CAFErrorContext = createContext<CAFErrorContextValue | null>(null);

/**
 * Hook to access CAF error boundary context.
 * Returns null if used outside of CAFErrorBoundary.
 *
 * @returns Error context value or null
 */
export function useCAFError(): CAFErrorContextValue | null {
  return useContext(CAFErrorContext);
}
