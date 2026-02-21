import { RouteRepository } from "@c-a-f/core";
import { useRoute, useRouter } from "vue-router";

/**
 * @deprecated This class calls Vue composables (useRouter, useRoute) in constructor and methods,
 * which violates Vue Composition API rules. Composables must be called at the top level.
 * Use `useRouteRepository()` composable instead, which properly calls Vue composables at the composable level.
 */
export class RouteHandler implements RouteRepository {
    private router = useRouter()

    constructor() {
        this.watchCurrentRoute()
    }

    currentRoute: string = ''

    change(route: string) {
        this.router.push(route)
    }

    watchCurrentRoute() {
        const { fullPath } = useRoute()
        this.currentRoute = fullPath
    }

}
