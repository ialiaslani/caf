import { useRef } from "react";
import {
  createUseCaseDevTools,
  type UseCaseDevTools,
  type UseCaseDevToolsOptions,
} from "@c-a-f/devtools";

/**
 * React hook that provides DevTools for UseCase execution tracking.
 * Creates a singleton DevTools instance that persists across renders.
 *
 * @param options - DevTools options
 * @returns DevTools instance
 *
 * @example
 * ```tsx
 * const useCaseDevTools = useUseCaseDevTools({ name: 'CreateUser', enabled: true });
 * const wrappedUseCase = useCaseDevTools.wrap(createUserUseCase);
 *
 * // Get execution history
 * const history = useCaseDevTools.getExecutionHistory();
 * ```
 */
export function useUseCaseDevTools(
  options?: UseCaseDevToolsOptions
): UseCaseDevTools {
  const devToolsRef = useRef<UseCaseDevTools | null>(null);

  if (!devToolsRef.current) {
    devToolsRef.current = createUseCaseDevTools(options);
  }

  return devToolsRef.current;
}
