import { Pulse } from "../Pulse";


export type IRequest<T> = Promise<T>

export type RequestResult<T> = {
    loading: Pulse<boolean> & {
        value: boolean;
    };
    data: Pulse<T> & {
        value: T;
    };
    error: Pulse<Error> & {
        value: Error;
    };
}
