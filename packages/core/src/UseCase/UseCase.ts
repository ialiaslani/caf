import { RequestResult } from "..";

export interface UseCase<A extends any[], T> {
    execute: (...args: A) => Promise<RequestResult<T>>;
}

