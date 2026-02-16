import { Login, LOGIN_PATH, TOKEN_KEY } from '@caf/example-domain';
import { LoginApi } from '@caf/example-infrastructure';
import { useRouteManager } from '@caf/infrastructure-react';

export const useLogin = () => {
  const routeManager = useRouteManager({
    loginPath: LOGIN_PATH,
    isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
  });
  const loginApi = new LoginApi(routeManager);
  const login = (user: Login) => {
    return loginApi.login(user);
  };

  return {
    login,
  };
};
