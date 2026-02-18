import type { Ploc, UseCase } from "@c.a.f/core";
import { useCAFContext } from "./CAFContext";

/**
 * Hook to get a Ploc from the nearest CAFProvider by key.
 * Returns `undefined` when the key is not registered or when used outside a provider
 * (default context has empty plocs). Use the generic for type-safe access.
 *
 * @param key - Key used when registering the Ploc in CAFProvider (e.g. "user", "auth")
 * @returns The Ploc instance or undefined if not found
 *
 * @example
 * ```tsx
 * const userPloc = usePlocFromContext<UserPloc>("user");
 * if (!userPloc) return <NotFound />;
 * const [state, ploc] = usePloc(userPloc);
 * return <span>{state.name}</span>;
 * ```
 */
export function usePlocFromContext<P extends Ploc<unknown>>(key: string): P | undefined {
  const { plocs } = useCAFContext();
  return plocs[key] as P | undefined;
}

/**
 * Hook to get a UseCase from the nearest CAFProvider by key.
 * Returns `undefined` when the key is not registered or when used outside a provider
 * (default context has empty useCases). Use generics for type-safe args and result.
 *
 * @param key - Key used when registering the UseCase in CAFProvider (e.g. "createUser", "login")
 * @returns The UseCase instance or undefined if not found
 *
 * @example
 * ```tsx
 * const createUser = useUseCaseFromContext<[CreateUserInput], User>("createUser");
 * if (!createUser) return null;
 * const { execute, loading } = useUseCase(createUser);
 * ```
 */
export function useUseCaseFromContext<TArgs extends any[], TResult>(
  key: string
): UseCase<TArgs, TResult> | undefined {
  const { useCases } = useCAFContext();
  return useCases[key] as UseCase<TArgs, TResult> | undefined;
}
