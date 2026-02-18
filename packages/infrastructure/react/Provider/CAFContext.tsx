import { createContext, useContext } from "react";
import type { Ploc } from "@c.a.f/core";
import type { UseCase } from "@c.a.f/core";

/**
 * Value provided by CAFProvider. Allows descendants to access Plocs and UseCases by key.
 * Use useCAFContext() to read, or usePlocFromContext / useUseCaseFromContext for typed access by key.
 */
export interface CAFContextValue {
  /** Plocs registered at the root, keyed by string (e.g. "user", "auth"). */
  plocs: Record<string, Ploc<unknown>>;
  /** UseCases registered at the root, keyed by string (e.g. "createUser", "login"). */
  useCases: Record<string, UseCase<any[], any>>;
}

const defaultValue: CAFContextValue = {
  plocs: {},
  useCases: {},
};

export const CAFContext = createContext<CAFContextValue>(defaultValue);

/**
 * Hook to access the CAF context (Plocs and UseCases registered by CAFProvider).
 * Returns the context value; use .plocs[key] or .useCases[key] to get instances.
 * When used outside CAFProvider, returns the default empty registry (no throw).
 *
 * @example
 * const { plocs, useCases } = useCAFContext();
 * const userPloc = plocs["user"] as UserPloc | undefined;
 * const createUser = useCases["createUser"];
 */
export function useCAFContext(): CAFContextValue {
  return useContext(CAFContext);
}
