import { RouteManager, RouteManagerAuthOptions } from "@c-a-f/core";
import { useMemo } from "react";
import { useRouteRepository } from "./useRouteRepository";

/**
 * React hook that provides a RouteManager from @c-a-f/core.
 * Uses useRouteRepository to get the RouteRepository implementation.
 * 
 * @param authOptions - Optional authentication configuration. If not provided, RouteManager will work without auth checks.
 */
export const useRouteManager = (authOptions?: RouteManagerAuthOptions): RouteManager => {
  const routeRepository = useRouteRepository();

  return useMemo(() => {
    return new RouteManager(routeRepository, authOptions);
  }, [routeRepository, authOptions]);
};
