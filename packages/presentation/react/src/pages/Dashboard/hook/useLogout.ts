import { LogoutApi } from '@caf/infrastructure';
import { useRouteManager } from '@caf/infrastructure-react';

export const useLogout = () => {
  const routeManager = useRouteManager();
  const logoutApi = new LogoutApi(routeManager);

  const logout = () => {
    logoutApi.logout();
  };

  return { logout };
};
