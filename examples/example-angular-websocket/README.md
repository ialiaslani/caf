# Angular WebSocket Example (CAF)

Angular example using CAF with **WebSocket infrastructure**: same domain and application layer as the main Angular example, but data is fetched and updated over a **WebSocket** client with optional **real-time push** (e.g. `usersUpdated`).

## Structure

- **caf/domain** — User entity, `IUserRepository`, `UserService` (unchanged)
- **caf/application** — `GetUsers`, `CreateUser`, `UserPloc` (unchanged)
- **caf/infrastructure/websocket** — `UserWebSocketRepository` (implements `IUserRepository`), `MockWebSocketClient`, protocol types
- **Real-time** — `MockWebSocketClient` pushes `usersUpdated` after create/update/delete; the Ploc subscribes and updates state so the UI reflects changes without a manual refresh.

## Run

```bash
yarn install
yarn start
```

From repo root:

```bash
yarn example:angular-websocket:serve
```

## Approach

1. **Same contract** — `IUserRepository` is implemented by `UserWebSocketRepository`, which sends/receives messages over a WebSocket client.
2. **Mock client** — `MockWebSocketClient` simulates a server (in-memory user list, request/response, and optional `onUsersUpdated` callbacks).
3. **Real-time** — When the mock “server” updates the list (e.g. after create), it notifies subscribers; the setup wires this to the Ploc so the list updates in the UI.

Replace `MockWebSocketClient` with a real WebSocket connection to your backend to use this pattern in production.
