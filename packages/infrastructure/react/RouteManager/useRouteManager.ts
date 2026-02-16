import { RouteManager } from "@caf/core";
import { LOGIN_PATH, TOKEN_KEY } from "@caf/example-domain";
import { useMemo } from "react";
import { useRouteRepository } from "./useRouteRepository";

/**
 * React hook that provides a RouteManager from @caf/core.
 * Uses useRouteRepository to get the RouteRepository implementation.
 */
export const useRouteManager = (): RouteManager => {
  const routeRepository = useRouteRepository();

  return useMemo(() => {
    return new RouteManager(routeRepository, {
      loginPath: LOGIN_PATH,
      isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
    });
  }, [routeRepository]);
};
