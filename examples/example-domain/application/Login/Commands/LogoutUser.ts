import { LoginService } from "../../../domain";
import { RouteManager } from "@caf/core";


export class LogoutUser  {
    constructor(private useService: LoginService, private routeManager: RouteManager) {}

    async execute() {

        await this.useService.logout()
        this.useService.removeTokenFromLocalStorage()
        this.routeManager.changeRoute('/login')

    }

    
}
