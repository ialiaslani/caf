import Axios from 'axios';
import { LoginRepository } from './LoginRepository';
import { Login, LoginService, LoginUser } from '@c.a.f/example-domain';
import { RouteManager } from '@c.a.f/core';

export class LoginApi {
  routeManager: RouteManager;
  constructor(routeManager: RouteManager) {
    this.routeManager = routeManager;
  }

  login(user: Login) {
    const loginRepository = new LoginRepository(Axios);
    const loginService = new LoginService(loginRepository);
    const loginUser = new LoginUser(loginService, this.routeManager);
    return loginUser.execute(user);
  }
}
