import  Axios, { type AxiosInstance } from 'axios'
import { GetUsers, IUserRepository, User, UserService } from '@caf/example-domain'

class UserApiCall implements IUserRepository {
    constructor(
        private axios: AxiosInstance
    ) {}

    async getUsers() {
        const users = await this.axios.get<Array<User>>('')
        return users.data
    }

    async addUser(user: Omit<User, 'id'>): Promise<User> {
        const users = await this.axios.post<User>('', user)
        return users.data
    }

    async getUser(id: string): Promise<User> {
        const users = await this.axios.get<User>('' + id)
        return users.data
    }
}

export class UserApi {
    getUsers() {
        const userApiCall = new UserApiCall(Axios)
        const userService = new UserService(userApiCall)
        const getUser = new GetUsers(userService)

        return getUser.execute()
    }


}

