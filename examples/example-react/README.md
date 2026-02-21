# @c-a-f/core Testing Demo

This project demonstrates how to use `@c-a-f/core` with a mock API implementation.

## Features Demonstrated

### Core Concepts

1. **UseCase Pattern**
   - `GetUsers` - Query use case for fetching users
   - `CreateUser` - Command use case for creating users

2. **Ploc (Presentation Logic Container)**
   - `UserPloc` - Manages presentation state and business logic
   - Demonstrates reactive state management using Pulse

3. **Pulse (Reactive State)**
   - Individual reactive values for `users`, `selectedUser`, and `error`
   - Subscriptions for UI updates

4. **ApiRequest**
   - Wraps async operations with loading/data/error state
   - Used for handling API calls with reactive state

5. **IRequestHandler Interface**
   - Mock API handlers implementing `IRequestHandler<T>`
   - Demonstrates how to swap between real API and mocks

## Project Structure

```
caf/
├── domain/              # Domain layer (entities, interfaces, services)
│   └── User/
├── application/        # Application layer (use cases, Ploc)
│   └── User/
│       ├── Commands/
│       ├── Queries/
│       └── Ploc/
└── infrastructure/     # Infrastructure layer (repositories, APIs)
    └── api/
        └── User/
            ├── UserRepository.ts      # Real API repository (uses Axios)
            ├── MockUserRepository.ts  # Mock repository
            └── MockUserApi.ts         # Mock API handlers using IRequestHandler
```

## Mock API Implementation

The mock API uses `IRequestHandler<T>` from `@c-a-f/core` to create mock implementations:

- `MockGetUsersHandler` - Returns mock user list
- `MockGetUserByIdHandler` - Returns a user by ID
- `MockCreateUserHandler` - Creates a new user
- `MockUpdateUserHandler` - Updates an existing user
- `MockDeleteUserHandler` - Deletes a user

All handlers simulate network delays (400-800ms) to demonstrate loading states.

## Usage

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the features:**
   - Click "Refresh Users" to load users using the `GetUsers` use case
   - Create new users using the form
   - Click on users to select them
   - Observe reactive state updates in the debug panel

## Key Files

- `caf/setup.ts` - Dependency injection setup
- `caf/application/User/Ploc/UserPloc.ts` - Presentation logic container
- `caf/infrastructure/api/User/MockUserApi.ts` - Mock API handlers
- `src/components/UserManagement.tsx` - React component demonstrating usage

## Switching Between Mock and Real API

To switch from mock to real API, simply change the repository in `caf/setup.ts`:

```typescript
// Mock implementation
const userRepository = new MockUserRepository();

// Real API implementation (requires Axios instance)
// const axiosInstance = axios.create({ baseURL: 'https://api.example.com' });
// const userRepository = new UserRepository(axiosInstance);
```

The rest of the application remains unchanged thanks to the `IUserRepository` interface and `IRequestHandler` abstraction.
