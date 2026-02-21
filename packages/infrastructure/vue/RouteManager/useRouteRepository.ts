import { RouteRepository } from "@c-a-f/core";
import { useRoute, useRouter } from "vue-router";

/**
 * Vue composable that provides a RouteRepository implementation.
 * Calls Vue Router composables at the composable level (not in a constructor).
 */
export const useRouteRepository = (): RouteRepository => {
  const router = useRouter();
  const route = useRoute();

  return {
    get currentRoute(): string {
      return route.fullPath;
    },
    change(routePath: string): void {
      router.push(routePath);
    },
  };
};
