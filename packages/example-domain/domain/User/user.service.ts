import { User } from "./user.entities";
import { IUserRepository } from "./user.irepository";


export class UserService {
    constructor(private userRepository: IUserRepository) {}

    async getUsers(): Promise<Array<User>> {
        return this.userRepository.getUsers()
    }

    async getUser(id: string): Promise<User> {
        return this.userRepository.getUser(id)
    }

    async addUser(user: Omit<User, 'id'>): Promise<User> {
        return  this.userRepository.addUser(user)
    }

}
