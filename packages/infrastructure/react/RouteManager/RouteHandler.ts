import { RouteRepository } from "@c-a-f/core";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * @deprecated This class violates React's rules of hooks by calling hooks in a constructor.
 * Use `useRouteRepository()` hook instead, which properly calls hooks at the hook level.
 */
export class RouteHandler implements RouteRepository {
    private navigate = useNavigate()

    constructor() {
        this.watchCurrentRoute()
    }

    currentRoute: string = ''

    change(route: string) {
        this.navigate(route)
    }

    watchCurrentRoute() {
        const { pathname } = useLocation()
        this.currentRoute = pathname
    }


}