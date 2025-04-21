import { Login, LoginService,  } from "../../../domain";
import { RouteManager } from "../../shared";
import { UseCase } from "../../shared/UseCase";


export class LoginUser implements UseCase<[Login], Login> {
    constructor(private readonly useService: LoginService, private readonly routeManager: RouteManager) {}

    async execute(user: Login) {

        const result = await this.useService.login(user).mutate()
        this.useService.saveTokenToLocaleStorage(result.data.value)
        
        this.routeManager.changeRoute('/dashboard')

        return result
    }

}

