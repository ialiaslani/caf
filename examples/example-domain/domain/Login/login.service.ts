import { ApiRequest } from "@caf/core";
import { Login } from "./login.entities";
import { ILoginRepository } from "./login.irepository";
import { TOKEN_KEY } from "../../constants";


export class LoginService {
    constructor(private readonly loginRepository: ILoginRepository) {}

    login(user: Login) {
        const loginRequest = new ApiRequest<Login>(this.loginRepository.login(user))
        return loginRequest
    }

    async logout() {
        return this.loginRepository.logout()
    }

    saveTokenToLocalStorage(data: any) {
        localStorage.setItem(TOKEN_KEY, data?.data?.accessToken?.access_token)
    }

    removeTokenFromLocalStorage() {
        localStorage.removeItem(TOKEN_KEY)
    }

}
