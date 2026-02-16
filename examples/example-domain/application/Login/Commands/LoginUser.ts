import { Login, LoginService } from "../../../domain";
import { RouteManager, UseCase } from "@c.a.f/core";


export class LoginUser implements UseCase<[Login], Login> {
    constructor(private readonly useService: LoginService, private readonly routeManager: RouteManager) {}

    async execute(user: Login) {

        const result = await this.useService.login(user).mutate()
        this.useService.saveTokenToLocalStorage(result.data.value)

        this.routeManager.changeRoute('/dashboard')

        return result
    }

}
