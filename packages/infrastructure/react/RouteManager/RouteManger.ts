import { RouteManager } from "@caf/core";
import { RouteHandler } from "./RouteHandler";

export class RouterService {
  private routeManager: RouteManager;

  constructor() {
    const routeHandler = new RouteHandler();
    this.routeManager = new RouteManager(routeHandler);
  }

  public getRouteManager(): RouteManager {
    return this.routeManager;
  }

}
