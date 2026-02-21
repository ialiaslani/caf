# example-vue-graphql

Vue 3 + CAF + GraphQL example. Same **domain** and **application** as **example-react**; only the **infrastructure** layer uses GraphQL instead of REST.

## Approach

- **Domain / application** follow the same structure as **example-react** (each example has its own `caf/`; no separate package):
  - `caf/domain`: `User` (id, name, email), `IUserRepository`, `UserService`
  - `caf/application`: `GetUsers`, `CreateUser` (with validation), `UserPloc`
- **Infrastructure** in this app:
  - `caf/infrastructure/graphql/`: `UserGraphQLRepository` implements `IUserRepository` via GraphQL; `createGraphQLClient()` for real or mock client.
  - `caf/infrastructure/validation/`: Zod schemas (same as example-react).

You can swap REST for GraphQL by changing only the infrastructure layer.

## Project structure

```
caf/
  domain/           # Same as example-react (User, IUserRepository, UserService)
  application/      # Same as example-react (GetUsers, CreateUser, UserPloc)
  infrastructure/
    graphql/        # GraphQL implementation of IUserRepository
    validation/     # Zod schemas
  setup.ts          # setupUserPloc() with GraphQL repo
src/
  App.vue
  main.ts
```

## Running

From this directory:

```sh
npm install
npm run dev
```

Without a GraphQL backend, the app uses the **mock client** (in-memory users with id, name, email). To use a real API:

```env
VITE_GRAPHQL_URL=https://your-api/graphql
```

## GraphQL API contract

The repository expects:

- **Query `users`**: `{ users: [{ id, name, email }] }`
- **Query `user(id: ID!)`**: `{ user: { id, name, email } }`
- **Mutation `createUser(input: { name, email })`**: `{ createUser: { id, name, email } }`
- **Mutation `updateUser(id, input)`** / **Mutation `deleteUser(id)`** (optional for mock)

## CAF + Vue

- `@c.a.f/infrastructure-vue`: `CAFProvider`, `CAFErrorBoundary`, `usePloc`, `usePlocFromContext`
- Root is wrapped in `CAFErrorBoundary` and `CAFProvider` with plocs `{ user: userPloc }` and useCases `{ createUser }`, matching example-react.

See [@c.a.f/infrastructure-vue](../../packages/infrastructure/vue/README.md) for Vue infrastructure docs.

## Differences from example-react

Only the **infrastructure** layer differs; domain and application are the same.

| Layer          | example-react              | example-vue-graphql              |
|----------------|----------------------------|----------------------------------|
| **Domain**     | `User`, `IUserRepository`, `UserService` (same) | Same                             |
| **Application**| `GetUsers`, `CreateUser`, `UserPloc` (same)    | Same                             |
| **Infrastructure** | REST/mock API (`MockUserRepository`, `MockUserApi`) | GraphQL (`UserGraphQLRepository`, `createGraphQLClient`) |
| **Validation** | Zod in `infrastructure/validation`             | Same                             |

So you can switch from REST to GraphQL by replacing the repository implementation and wiring a GraphQL client in `caf/setup.ts`; no changes to domain or application code.
