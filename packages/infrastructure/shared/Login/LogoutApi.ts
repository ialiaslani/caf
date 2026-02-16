import Axios from 'axios';
import { LoginRepository } from '@c.a.f/infrastructure-axios';
import { LoginService, LogoutUser } from '@c.a.f/example-domain';
import { RouteManager } from '@c.a.f/core';

export class LogoutApi {
  routeManager: RouteManager;
  constructor(routeManager: RouteManager) {
    this.routeManager = routeManager;
  }

  logout() {
    const loginRepository = new LoginRepository(Axios);
    const loginService = new LoginService(loginRepository);
    const logoutUser = new LogoutUser(loginService, this.routeManager);
    return logoutUser.execute();
  }
}

