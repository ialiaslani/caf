export interface RouteRepository {
    currentRoute: string;
    change(route: string): void;
}
