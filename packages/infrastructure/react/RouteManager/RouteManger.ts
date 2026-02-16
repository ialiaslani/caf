import { RouteManager, RouteManagerAuthOptions } from "@c.a.f/core";
import { RouteHandler } from "./RouteHandler";

/**
 * @deprecated This class creates RouteHandler in constructor, which violates React's rules of hooks.
 * Use `useRouteManager()` hook instead, which properly calls React hooks at the hook level.
 */
export class RouterService {
  private routeManager: RouteManager;

  constructor(authOptions?: RouteManagerAuthOptions) {
    const routeHandler = new RouteHandler();
    this.routeManager = new RouteManager(routeHandler, authOptions);
  }

  public getRouteManager(): RouteManager {
    return this.routeManager;
  }

}
