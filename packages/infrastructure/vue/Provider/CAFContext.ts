import { inject } from "vue";
import type { Ploc, UseCase } from "@c.a.f/core";

/**
 * Injection key for CAF context (Plocs and UseCases).
 * Use with provide() in CAFProvider and inject() in useCAFContext.
 */
export const CAFContextKey = Symbol("CAFContext") as symbol;

/**
 * Value provided by CAFProvider. Allows descendants to access Plocs and UseCases by key.
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

/**
 * Vue composable to access the CAF context (Plocs and UseCases from CAFProvider).
 * Returns the context value; when used outside CAFProvider, returns the default empty registry.
 */
export function useCAFContext(): CAFContextValue {
  return inject(CAFContextKey, defaultValue);
}
