# @caf/infrastructure-axios

Axios-based HTTP and repository implementations for CAF.

## Installation

```bash
npm install @caf/infrastructure-axios axios
```

## Usage

### LoginRepository

Axios-based implementation of `ILoginRepository`:

```typescript
import Axios from 'axios';
import { LoginRepository } from '@caf/infrastructure-axios';

const loginRepository = new LoginRepository(Axios);
await loginRepository.login({ username: 'user', password: 'pass' });
await loginRepository.logout();
```

### UserRepository

Axios-based implementation of `IUserRepository`:

```typescript
import Axios from 'axios';
import { UserRepository } from '@caf/infrastructure-axios';

const userRepository = new UserRepository(Axios);
const users = await userRepository.getUsers();
const user = await userRepository.addUser({ name: 'John' });
const userById = await userRepository.getUser('123');
```

## Exports

- `LoginRepository` — Axios-based login/logout repository
- `UserRepository` — Axios-based user CRUD repository

## Dependencies

- `@caf/core` — Core primitives
- `@caf/example-domain` — Domain interfaces (ILoginRepository, IUserRepository)
- `axios` — HTTP client

## License

MIT
