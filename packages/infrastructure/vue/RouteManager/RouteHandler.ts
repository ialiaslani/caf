import { RouteRepository } from "@caf/core";
import { useRoute, useRouter } from "vue-router";

export class RouteHandler implements  RouteRepository {
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
