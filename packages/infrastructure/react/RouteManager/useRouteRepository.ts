import { RouteRepository } from "@caf/core";
import { useNavigate, useLocation } from "react-router-dom";
import { useMemo } from "react";

/**
 * React hook that provides a RouteRepository implementation.
 * Calls React Router hooks at the hook level (not in a constructor).
 */
export const useRouteRepository = (): RouteRepository => {
  const navigate = useNavigate();
  const location = useLocation();

  return useMemo(() => {
    return {
      get currentRoute(): string {
        return location.pathname;
      },
      change(route: string): void {
        navigate(route);
      },
    };
  }, [navigate, location.pathname]);
};
