import { RouterService } from '@caf/infrastructure-react';

export const useRouteManager = () => {
  const routerService = new RouterService();
  const routeManager = routerService.getRouteManager();

  const init = () => {
    routeManager.checkForLoginRoute();
  };

  return {
    init,
  };
};
