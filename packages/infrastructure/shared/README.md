# @caf/infrastructure

Shared infrastructure for CAF (LoginApi, LogoutApi, UserApi).

## Installation

```bash
npm install @caf/infrastructure @caf/infrastructure-axios
```

## Usage

### LoginApi

API wrapper for login use case:

```typescript
import { LoginApi } from '@caf/infrastructure';
import { RouteManager } from '@caf/core';

const routeManager = new RouteManager(routeRepository);
const loginApi = new LoginApi(routeManager);
await loginApi.login({ username: 'user', password: 'pass' });
```

### LogoutApi

API wrapper for logout use case:

```typescript
import { LogoutApi } from '@caf/infrastructure';
import { RouteManager } from '@caf/core';

const routeManager = new RouteManager(routeRepository);
const logoutApi = new LogoutApi(routeManager);
await logoutApi.logout();
```

### UserApi

API wrapper for user operations:

```typescript
import { UserApi } from '@caf/infrastructure';

const userApi = new UserApi();
const result = await userApi.getUsers();
```

## Exports

- `LoginApi` — Login use case wrapper
- `LogoutApi` — Logout use case wrapper
- `UserApi` — User operations wrapper

## Dependencies

- `@caf/core` — Core primitives
- `@caf/example-domain` — Example domain
- `@caf/infrastructure-axios` — Axios-based repositories
- `axios` — HTTP client (for creating repository instances)

## License

MIT
