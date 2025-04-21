import { LogoutApi } from '@caf/infrastructure';
import { RouterService } from '@caf/infrastructure-react';

export const useLogout = () => {
  const routerService = new RouterService();
  const logoutApi = new LogoutApi(routerService.getRouteManager());

  const logout = () => {
    logoutApi.logout();
  };

  return { logout };
};
