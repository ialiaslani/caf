# @c.a.f/infrastructure

Shared infrastructure for CAF (LoginApi, LogoutApi, UserApi).

## Installation

```bash
npm install @c.a.f/infrastructure @c.a.f/infrastructure-axios
```

## Usage

### LoginApi

API wrapper for login use case:

```typescript
import { LoginApi } from '@c.a.f/infrastructure';
import { RouteManager } from '@c.a.f/core';

const routeManager = new RouteManager(routeRepository);
const loginApi = new LoginApi(routeManager);
await loginApi.login({ username: 'user', password: 'pass' });
```

### LogoutApi

API wrapper for logout use case:

```typescript
import { LogoutApi } from '@c.a.f/infrastructure';
import { RouteManager } from '@c.a.f/core';

const routeManager = new RouteManager(routeRepository);
const logoutApi = new LogoutApi(routeManager);
await logoutApi.logout();
```

### UserApi

API wrapper for user operations:

```typescript
import { UserApi } from '@c.a.f/infrastructure';

const userApi = new UserApi();
const result = await userApi.getUsers();
```

## Exports

- `LoginApi` — Login use case wrapper
- `LogoutApi` — Logout use case wrapper
- `UserApi` — User operations wrapper

## Dependencies

- `@c.a.f/core` — Core primitives
- `@c.a.f/example-domain` — Example domain
- `@c.a.f/infrastructure-axios` — Axios-based repositories
- `axios` — HTTP client (for creating repository instances)

## License

MIT
