import { RouteRepository } from "./RouteRepository";

/**
 * Optional auth configuration for route guards.
 * When provided, RouteManager can redirect unauthenticated users to a login path.
 * Implement isLoggedIn in your app or infrastructure (e.g. via a provided auth store).
 */
export interface RouteManagerAuthOptions {
    loginPath: string;
    isLoggedIn: () => boolean;
}

export class RouteManager {
    constructor(
        private routingSystem: RouteRepository,
        private authOptions?: RouteManagerAuthOptions
    ) {}

    /**
     * If auth options are set and the user is not logged in, redirects to login path.
     * No-op when current route is already the login path or when auth options are not provided.
     */
    checkForLoginRoute(): void {
        if (!this.authOptions) return;
        const { loginPath, isLoggedIn } = this.authOptions;
        if (this.routingSystem.currentRoute !== loginPath && !isLoggedIn()) {
            this.routingSystem.change(loginPath);
        }
    }

    /**
     * Returns whether the user is considered logged in.
     * When auth options are not provided, returns false.
     */
    isUserLoggedIn(): boolean {
        return this.authOptions ? this.authOptions.isLoggedIn() : false;
    }

    changeRoute(route: string): void {
        this.routingSystem.change(route);
    }
}
