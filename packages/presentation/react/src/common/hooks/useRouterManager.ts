import { useRouteManager as useInfraRouteManager } from '@caf/infrastructure-react';

export const useRouteManager = () => {
  const routeManager = useInfraRouteManager();

  const init = () => {
    routeManager.checkForLoginRoute();
  };

  return {
    init,
  };
};
