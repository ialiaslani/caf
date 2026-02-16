import { RouteManager, RouteManagerAuthOptions } from "@caf/core";
import { useRouteRepository } from "./useRouteRepository";

/**
 * Vue composable that provides a RouteManager from @caf/core.
 * Uses useRouteRepository to get the RouteRepository implementation.
 * 
 * @param authOptions - Optional authentication configuration. If not provided, RouteManager will work without auth checks.
 */
export const useRouteManager = (authOptions?: RouteManagerAuthOptions): RouteManager => {
  const routeRepository = useRouteRepository();
  return new RouteManager(routeRepository, authOptions);
};
