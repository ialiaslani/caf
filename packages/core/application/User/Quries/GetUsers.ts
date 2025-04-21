import { UserService } from "../../../domain";
import { User } from "../../../domain/User/user.entities";


export class GetUsers {
    constructor(private useService: UserService) {}

    execute(): Promise<Array<User>> {
        return this.useService.getUsers()
    }
}

