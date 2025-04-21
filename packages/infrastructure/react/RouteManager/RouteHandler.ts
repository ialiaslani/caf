import { RouteRepository } from "@caf/core";
import { useNavigate, useLocation } from "react-router-dom";

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