import { Login } from '../../../domain';
import { LoginApi } from '../../../infrastructure';
import { useRouteManager } from '@caf/infrastructure-react';
import { LOGIN_PATH, TOKEN_KEY } from '../../../constants';

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
