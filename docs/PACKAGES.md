# Package wiring (Phase 1)

After Phase 1, the dependency graph for User/Login and use cases is:

## @caf/core
- **Exports:** Primitives only (UseCase, Ploc, Pulse, pulse, ApiRequest, RouteManager, RouteRepository, RequestResult, IRequest). No User/Login.
- **Depends on:** Nothing (dependency-free).

## @caf/example-domain
- **Exports:** User, Login, IUserRepository, ILoginRepository, UserService, LoginService, and use cases (LoginUser, LogoutUser, GetUsers, AddUsers), plus type `ILoginUseCase`.
- **Depends on:** `@caf/core` (for UseCase, Ploc, RouteManager, ApiRequest).

## @caf/infrastructure (shared)
- **Exports:** UserApi, LoginApi, LogoutApi, LoginRepository, etc.
- **Depends on:** `@caf/core` (RouteManager), `@caf/example-domain` (User, Login, repositories, services, use cases).
- **Imports:** User/Login types and use cases from `@caf/example-domain`; routing from `@caf/core`.

## Presentation packages (React, Vue, Angular)
- **Depend on:** `@caf/core`, `@caf/example-domain`, and their framework-specific `@caf/infrastructure-*`.
- **Imports:** `Login`, `ILoginUseCase`, etc. from `@caf/example-domain`; routing and primitives from `@caf/core`.

**Task 1.3:** Infra and presentation packages use `@caf/example-domain` for all User/Login types and use cases; core stays free of app-specific domain.
