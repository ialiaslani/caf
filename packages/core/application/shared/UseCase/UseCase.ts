import { RequestResult } from "../../../domain/shared";

export interface UseCase<A extends any[], T> {
    execute: (...args: A) => Promise<RequestResult<T>>;
}

