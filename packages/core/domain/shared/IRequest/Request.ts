import { pulse } from "../Pulse";
import type { IRequest } from "./IRequest";
import type { IRequestHandler } from "./IRequestHandler";
import { toRequestHandler } from "./IRequestHandler";

/**
 * ApiRequest wraps an async request and exposes reactive loading/data/error state.
 * 
 * Can accept either IRequest<T> (Promise<T>) or IRequestHandler<T> for flexibility.
 * This allows swapping implementations (real API, mocks, cached) without changing core.
 */
export class ApiRequest<T> {
    readonly loading = pulse(false);
    readonly data = pulse(null as T);
    readonly error = pulse(null! as Error);
    private handler: IRequestHandler<T>;
    
    constructor(
        service: IRequest<T> | IRequestHandler<T>
    ) {
        this.handler = toRequestHandler(service);
    }

    async mutate(options?: { onSuccess: (data: T) => void }) {
        this.loading.value = true;
        try {
            this.data.value = await this.handler.execute();
            options?.onSuccess?.(this.data.value);
        } catch (error) {
            this.error.value = error as Error;
        } finally {
            this.loading.value = false;
        }
        return {
            loading: this.loading,
            data: this.data,
            error: this.error,
        };
    }

    onSuccess(onSuccessFn: (data: T) => void): void {
        onSuccessFn(this.data.value);
    }
}