import { useRouteManager as useInfraRouteManager } from '@c.a.f/infrastructure-react';
import { LOGIN_PATH, TOKEN_KEY } from '../../constants';

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
