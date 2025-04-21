import { ApiRequest } from "../shared/IRequest/Request";
import { Login } from "./login.entities";
import { ILoginRepository } from "./login.irepository";


export class LoginService {
    constructor(private readonly loginRepository: ILoginRepository) {}

    login(user: Login) {
        const loginRequest = new ApiRequest<Login>(this.loginRepository.login(user))
        return loginRequest
    }

    async logout() {
        return this.loginRepository.logout()
    }

    saveTokenToLocaleStorage(data: any) {
        localStorage.setItem('token', data?.data?.accessToken?.access_token)
    }

    removeTokenFromLocaleStorage() {
        localStorage.removeItem('token')
    }

}