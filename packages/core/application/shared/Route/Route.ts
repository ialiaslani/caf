import { LOGIN_PATH, TOKEN_KEY } from "../constants";
import { RouteRepository } from "./RouteRepository";



export class RouteManager {
    constructor(private routingSystem: RouteRepository) {}

    checkForLoginRoute() {
        if (this.routingSystem.currentRoute !== LOGIN_PATH && !this.isUserLoggedIn()) {
            this.routingSystem.change(LOGIN_PATH)
        }
    }

    isUserLoggedIn() {
        return !!localStorage.getItem(TOKEN_KEY)
    }

    changeRoute(route: string) {
        this.routingSystem.change(route)
    }

}