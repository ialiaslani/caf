import { LogoutApi } from '../../../infrastructure';
import { useRouteManager } from '@c.a.f/infrastructure-react';
import { LOGIN_PATH, TOKEN_KEY } from '../../../constants';

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
