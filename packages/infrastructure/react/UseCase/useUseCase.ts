import { useCallback, useEffect, useRef, useState } from "react";
import type { UseCase, RequestResult } from "@c.a.f/core";

/**
 * React hook that wraps a UseCase execution with loading/error/data state management.
 * Handles RequestResult subscriptions automatically and provides a clean API for executing use cases.
 *
 * @param useCase - A UseCase instance (from @c.a.f/core)
 * @returns An object with execute function, loading state, error state, and data
 *
 * @example
 * ```tsx
 * const { execute, loading, error, data } = useUseCase(createUserUseCase);
 * 
 * const handleCreate = async () => {
 *   const result = await execute({ name: 'John', email: 'john@example.com' });
 *   if (result) {
 *     console.log('User created:', result);
 *   }
 * };
 * ```
 */
export function useUseCase<TArgs extends any[], TResult>(
  useCase: UseCase<TArgs, TResult>
): {
  execute: (...args: TArgs) => Promise<TResult | null>;
  loading: boolean;
  error: Error | null;
  data: TResult | null;
} {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TResult | null>(null);
  const requestResultRef = useRef<RequestResult<TResult> | null>(null);
  const listenersRef = useRef<{
    loading: (value: boolean) => void;
    data: (value: TResult) => void;
    error: (value: Error) => void;
  } | null>(null);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      const currentResult = requestResultRef.current;
      const listeners = listenersRef.current;
      if (currentResult && listeners) {
        currentResult.loading.unsubscribe(listeners.loading);
        currentResult.data.unsubscribe(listeners.data);
        currentResult.error.unsubscribe(listeners.error);
      }
    };
  }, []);

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      // Unsubscribe from previous result if exists
      const previousResult = requestResultRef.current;
      const previousListeners = listenersRef.current;
      if (previousResult && previousListeners) {
        previousResult.loading.unsubscribe(previousListeners.loading);
        previousResult.data.unsubscribe(previousListeners.data);
        previousResult.error.unsubscribe(previousListeners.error);
      }

      try {
        const result = await useCase.execute(...args);
        requestResultRef.current = result;

        // Create listeners for the new result
        const loadingListener = (value: boolean) => setLoading(value);
        const dataListener = (value: TResult) => setData(value);
        const errorListener = (value: Error) => setError(value);

        listenersRef.current = {
          loading: loadingListener,
          data: dataListener,
          error: errorListener,
        };

        // Subscribe to the new result
        result.loading.subscribe(loadingListener);
        result.data.subscribe(dataListener);
        result.error.subscribe(errorListener);

        // Initialize state from result
        setLoading(result.loading.value);
        setData(result.data.value);
        setError(result.error.value);

        return result.data.value;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setLoading(false);
        return null;
      }
    },
    [useCase]
  );

  return {
    execute,
    loading,
    error,
    data,
  };
}
