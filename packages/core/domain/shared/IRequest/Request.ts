import { pulse } from "../Pulse";
import type { IRequest } from "./IRequest";

export class ApiRequest<T> {
    readonly loading = pulse(false)
    readonly data = pulse(null as T)
    readonly error = pulse(null! as Error)
    constructor(
        private service: IRequest<T>
    ) {
        this.loading.subscribe(console.log)
    }

    async mutate(options?: {onSuccess: (data: T) => void}) {
        this.loading.value = true;
        try {
            this.data.value = await this.service
            if('onSuccess' in (options ?? {})) {
                this.onSuccess(options!.onSuccess)
            }
        } catch (error) {
            this.error.value = error as Error;
        } finally {
            this.loading.value = false;
        }

        return {
            loading: this.loading,
            data: this.data,
            error: this.error,
        }
        
    }
    
    onSuccess(onSuccessFn: (data: T) => void) {
        onSuccessFn(this.data.value)
    }


}