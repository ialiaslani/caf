import { Login } from '@caf/core';
import { LoginApi } from '@caf/infrastructure';
import { RouterService } from '@caf/infrastructure-react';

export const useLogin = () => {
  const routerService = new RouterService();
  const loginApi = new LoginApi(routerService.getRouteManager());
  const login = (user: Login) => {
    return loginApi.login(user);
  };

  return {
    login,
  };
};
