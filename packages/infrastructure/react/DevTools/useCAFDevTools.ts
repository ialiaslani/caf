import { useEffect, useRef, useState } from "react";
import type { Ploc } from "@c-a-f/core";
import type { PlocDevTools } from "@c-a-f/devtools";
import { usePlocDevTools } from "./usePlocDevTools";
import { useUseCaseDevTools } from "./useUseCaseDevTools";

export interface CAFDevToolsContext {
  plocs: Map<Ploc<any>, PlocDevTools<any>>;
  useCases: ReturnType<typeof useUseCaseDevTools>;
  enabled: boolean;
  enable: () => void;
  disable: () => void;
}

/**
 * React hook that provides centralized DevTools access for CAF applications.
 * Tracks all Plocs and UseCases in your application and exposes them for debugging.
 *
 * @param options - Global DevTools options
 * @returns DevTools context with access to all tracked Plocs and UseCases
 *
 * @example
 * ```tsx
 * const devTools = useCAFDevTools({ enabled: process.env.NODE_ENV === 'development' });
 *
 * // Enable/disable globally
 * devTools.enable();
 * devTools.disable();
 *
 * // Access tracked Plocs
 * const plocTools = devTools.plocs.get(myPloc);
 * if (plocTools) {
 *   const history = plocTools.getStateHistory();
 * }
 * ```
 */
export function useCAFDevTools(options?: { enabled?: boolean }): CAFDevToolsContext {
  const plocsRef = useRef<Map<Ploc<any>, PlocDevTools<any>>>(new Map());
  const [enabled, setEnabled] = useState(options?.enabled ?? false);
  const useCaseDevTools = useUseCaseDevTools();

  // Expose devtools to React DevTools if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Expose CAF DevTools to global scope for React DevTools extension
      (window as any).__CAF_DEVTOOLS__ = {
        plocs: plocsRef.current,
        useCases: useCaseDevTools,
        enabled,
        enable: () => setEnabled(true),
        disable: () => setEnabled(false),
      };
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).__CAF_DEVTOOLS__;
      }
    };
  }, [enabled, useCaseDevTools]);

  return {
    plocs: plocsRef.current,
    useCases: useCaseDevTools,
    enabled,
    enable: () => setEnabled(true),
    disable: () => setEnabled(false),
  };
}

/**
 * Helper hook to register a Ploc with DevTools.
 * Use this inside components that use Plocs to automatically track them.
 *
 * @param ploc - Ploc instance to track
 * @param name - Optional name for the Ploc
 */
export function useTrackPloc<T>(ploc: Ploc<T>, name?: string): void {
  const devTools = useCAFDevTools();
  const plocDevTools = usePlocDevTools(ploc, { name, enabled: devTools.enabled });

  useEffect(() => {
    if (!devTools.plocs.has(ploc)) {
      devTools.plocs.set(ploc, plocDevTools);
    }

    return () => {
      devTools.plocs.delete(ploc);
    };
  }, [ploc, plocDevTools, devTools]);
}
