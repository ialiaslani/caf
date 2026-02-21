import type { Ploc, UseCase } from "@c-a-f/core";
import { useCAFContext } from "./CAFContext";

/**
 * Get a Ploc from the nearest CAFProvider by key.
 * Returns undefined when the key is not registered or when used outside a provider.
 *
 * @param key - Key used when registering the Ploc in CAFProvider (e.g. "user", "auth")
 * @returns The Ploc instance or undefined if not found
 */
export function usePlocFromContext<P extends Ploc<unknown>>(key: string): P | undefined {
  const { plocs } = useCAFContext();
  return plocs[key] as P | undefined;
}

/**
 * Get a UseCase from the nearest CAFProvider by key.
 * Returns undefined when the key is not registered or when used outside a provider.
 *
 * @param key - Key used when registering the UseCase in CAFProvider (e.g. "createUser", "login")
 * @returns The UseCase instance or undefined if not found
 */
export function useUseCaseFromContext<TArgs extends any[], TResult>(
  key: string
): UseCase<TArgs, TResult> | undefined {
  const { useCases } = useCAFContext();
  return useCases[key] as UseCase<TArgs, TResult> | undefined;
}
