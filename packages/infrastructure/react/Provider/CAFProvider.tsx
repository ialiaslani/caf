import React, { type ReactNode } from "react";
import type { Ploc } from "@c.a.f/core";
import type { UseCase } from "@c.a.f/core";
import { CAFContext, type CAFContextValue } from "./CAFContext";

export interface CAFProviderProps {
  /**
   * Plocs to provide to the tree, keyed by string.
   * Descendants can access via useCAFContext().plocs[key] or usePlocFromContext(key).
   */
  plocs?: Record<string, Ploc<unknown>>;
  /**
   * UseCases to provide to the tree, keyed by string.
   * Descendants can access via useCAFContext().useCases[key] or useUseCaseFromContext(key).
   */
  useCases?: Record<string, UseCase<any[], any>>;
  children: ReactNode;
}

/**
 * Root-level provider for Plocs and UseCases. Register instances by key so any descendant
 * can access them without prop drilling.
 *
 * @example Single provider at app root
 * ```tsx
 * const userPloc = useMemo(() => new UserPloc(userRepo), [userRepo]);
 * const createUser = useMemo(() => new CreateUser(repo), [repo]);
 *
 * <CAFProvider plocs={{ user: userPloc }} useCases={{ createUser }}>
 *   <App />
 * </CAFProvider>
 * ```
 *
 * @example Nested providers (e.g. feature-specific Plocs)
 * ```tsx
 * <CAFProvider plocs={{ user: userPloc }}>
 *   <CAFProvider plocs={{ dashboard: dashboardPloc }}>
 *     <Dashboard />
 *   </CAFProvider>
 * </CAFProvider>
 * ```
 * Inner provider does not merge with outer; use a single provider at root with all keys, or
 * ensure children only rely on the nearest provider's keys.
 */
export function CAFProvider({ plocs = {}, useCases = {}, children }: CAFProviderProps) {
  const value: CAFContextValue = {
    plocs: { ...plocs },
    useCases: { ...useCases },
  };

  return <CAFContext.Provider value={value}>{children}</CAFContext.Provider>;
}
