import { Login } from './login.entities'

export interface ILoginRepository<T = any> {
    login: (user: Login) => Promise<T>
    logout: () => Promise<T>
}
