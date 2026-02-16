import  { type AxiosInstance } from 'axios'
import { ILoginRepository, Login } from '@caf/example-domain'

export class LoginRepository implements ILoginRepository {
    constructor(
        private axios: AxiosInstance
    ) {}

    async login(user: Login) {
        return this.axios.post('/simba/api/v1/user/login', user)
    }

    async logout() {
        return this.axios.post('/simba/api/v1/user/logout', undefined, {
            headers: {
                Authorization:  `Bearer ${localStorage.getItem('token')}`
            }
        })
    }

}