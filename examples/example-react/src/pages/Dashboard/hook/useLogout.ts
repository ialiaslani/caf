import { LOGIN_PATH, TOKEN_KEY } from '@caf/example-domain';
import { LogoutApi } from '@caf/example-infrastructure';
import { useRouteManager } from '@caf/infrastructure-react';

export const useLogout = () => {
  const routeManager = useRouteManager({
    loginPath: LOGIN_PATH,
    isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
  });
  const logoutApi = new LogoutApi(routeManager);

  const logout = () => {
    logoutApi.logout();
  };

  return { logout };
};
