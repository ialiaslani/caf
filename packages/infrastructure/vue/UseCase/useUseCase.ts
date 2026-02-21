import { ref, onUnmounted, type Ref } from "vue";
import type { UseCase, RequestResult } from "@c-a-f/core";

/**
 * Vue composable that wraps a UseCase execution with loading/error/data state management.
 * Handles RequestResult subscriptions automatically and provides a clean API for executing use cases.
 *
 * @param useCase - A UseCase instance (from @c-a-f/core)
 * @returns An object with execute function, loading, error, and data as refs
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { execute, loading, error, data } = useUseCase(createUserUseCase);
 * const handleCreate = async () => {
 *   const result = await execute({ name: 'John', email: 'john@example.com' });
 *   if (result) console.log('User created:', result);
 * };
 * </script>
 * ```
 */
export function useUseCase<TArgs extends any[], TResult>(
  useCase: UseCase<TArgs, TResult>
): {
  execute: (...args: TArgs) => Promise<TResult | null>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  data: Ref<TResult | null>;
} {
  const loading = ref<boolean>(false);
  const error = ref<Error | null>(null);
  const data = ref<TResult | null>(null);

  let requestResult: RequestResult<TResult> | null = null;
  let loadingListener: (value: boolean) => void;
  let dataListener: (value: TResult) => void;
  let errorListener: (value: Error) => void;

  const cleanup = () => {
    if (requestResult) {
      requestResult.loading.unsubscribe(loadingListener);
      requestResult.data.unsubscribe(dataListener);
      requestResult.error.unsubscribe(errorListener);
      requestResult = null;
    }
  };

  onUnmounted(cleanup);

  const execute = async (...args: TArgs): Promise<TResult | null> => {
    cleanup();

    try {
      const result = await useCase.execute(...args);
      requestResult = result;

      loadingListener = (value: boolean) => {
        loading.value = value;
      };
      dataListener = (value: TResult) => {
        data.value = value;
      };
      errorListener = (value: Error) => {
        error.value = value;
      };

      result.loading.subscribe(loadingListener);
      result.data.subscribe(dataListener);
      result.error.subscribe(errorListener);

      loading.value = result.loading.value;
      data.value = result.data.value;
      error.value = result.error.value;

      return result.data.value;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      loading.value = false;
      return null;
    }
  };

  return {
    execute,
    loading,
    error,
    data: data as Ref<TResult | null>,
  };
}
