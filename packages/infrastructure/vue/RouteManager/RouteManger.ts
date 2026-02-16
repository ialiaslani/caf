import { RouteManager, RouteManagerAuthOptions } from "@c.a.f/core";
import { RouteHandler } from "./RouteHandler";

/**
 * @deprecated This class uses RouteHandler which violates Vue Composition API rules.
 * Use `useRouteManager()` composable instead, which properly calls Vue composables at the composable level.
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
