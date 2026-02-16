import { RouteManager } from "@caf/core";
import { LOGIN_PATH, TOKEN_KEY } from "@caf/example-domain";
import { RouteHandler } from "./RouteHandler";

export class RouterService {
  private routeManager: RouteManager;

  constructor() {
    const routeHandler = new RouteHandler();
    this.routeManager = new RouteManager(routeHandler, {
      loginPath: LOGIN_PATH,
      isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
    });
  }

  public getRouteManager(): RouteManager {
    return this.routeManager;
  }

}
