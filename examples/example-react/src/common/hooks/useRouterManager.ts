import { useRouteManager as useInfraRouteManager } from '@caf/infrastructure-react';
import { LOGIN_PATH, TOKEN_KEY } from '@caf/example-domain';

export const useRouteManager = () => {
  const routeManager = useInfraRouteManager({
    loginPath: LOGIN_PATH,
    isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
  });

  const init = () => {
    routeManager.checkForLoginRoute();
  };

  return {
    init,
    routeManager,
  };
};
