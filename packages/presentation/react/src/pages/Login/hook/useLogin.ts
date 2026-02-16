import { Login } from '@caf/example-domain';
import { LoginApi } from '@caf/infrastructure';
import { useRouteManager } from '@caf/infrastructure-react';

export const useLogin = () => {
  const routeManager = useRouteManager();
  const loginApi = new LoginApi(routeManager);
  const login = (user: Login) => {
    return loginApi.login(user);
  };

  return {
    login,
  };
};
