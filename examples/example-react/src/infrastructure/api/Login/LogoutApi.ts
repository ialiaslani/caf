import Axios from 'axios';
import { LoginRepository } from './LoginRepository';
import { LoginService } from '../../../domain';
import { LogoutUser } from '../../../application';
import { RouteManager } from '@caf/core';

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
