import { User } from './user.entities'

export interface IUserRepository {
    
    getUsers(): Promise<Array<User>>,

    getUser(id: string): Promise<User>,

    addUser(user: Omit<User, 'id'>): Promise<User>
}
