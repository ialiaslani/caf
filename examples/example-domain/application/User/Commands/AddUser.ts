import { UserService } from "../../../domain";
import { User } from "../../../domain/User/user.entities";
import { Ploc } from "@caf/core";


export class AddUsers extends Ploc<'beforeLoad' | 'loaded' | 'loading' | 'error'>  {
    constructor(private useService: UserService) {
        super('beforeLoad')
    }

    async execute(user: Omit<User, 'id'>): Promise<User> {

        this.changeState('loading')
        try{
            const addUser = await this.useService.addUser(user)

            this.changeState('loaded')
            return addUser

        } catch (e) {

            this.changeState('error')
            throw e
        }
    }
}
