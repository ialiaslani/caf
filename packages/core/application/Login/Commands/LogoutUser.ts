import { LoginService,  } from "../../../domain";
import { RouteManager } from "../../shared";


export class LogoutUser  {
    constructor(private useService: LoginService, private routeManager: RouteManager) {}

    async execute() {

        await this.useService.logout()
        this.useService.removeTokenFromLocaleStorage()
        this.routeManager.changeRoute('/login')

    }

    
}

