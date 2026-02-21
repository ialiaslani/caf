# Testing with @c-a-f/testing

This example shows how to test CAF apps using `@c-a-f/testing`: Ploc unit tests, UseCase tests, and Vue component integration tests.

## Running tests

```bash
npm run test:unit        # run once
npm run test:unit -- --watch  # watch mode
```

## 1. Testing a Ploc (unit)

**File:** `caf/application/User/__tests__/UserPloc.spec.ts`

- **Mock UseCases** with `createMockUseCaseSuccess`, `createMockUseCaseError`, or `createMockUseCase` so the Ploc doesn't hit real APIs.
- **Track state** with `createPlocTester(ploc)` to assert state history or current state.
- **Assert** after `loadUsers()` / `createUser()` for both success and error (e.g. validation errors).

```ts
const getUsers = createMockUseCaseSuccess(mockUsers);
const createUser = createMockUseCaseError(new Error('Network failed'));
const ploc = new UserPloc(getUsers, createUser);
const tester = createPlocTester(ploc);
await ploc.loadUsers();
expect(ploc.state.error).toBe('Network failed');
```

## 2. Testing a UseCase (unit)

**File:** `caf/application/User/__tests__/GetUsers.spec.ts`

- **Mock the repository** with `createMockRepository<IUserRepository>({ getUsers: async () => [...] })`.
- **Instantiate** domain service and UseCase with the mock, then call `execute()`.
- **Assert** on `result.data.value` and `result.error.value`.

```ts
const repo = createMockRepository<IUserRepository>({ getUsers: async () => mockUsers });
const getUsers = new GetUsers(new UserService(repo));
const result = await getUsers.execute();
expect(result.data.value).toEqual(mockUsers);
```

## 3. Testing a Vue component that uses Ploc/UseCase

**File:** `src/components/__tests__/UserListWithPloc.spec.ts`

- **Provide context** with `renderWithCAF(Component, { plocs: { user: ploc }, useCases: {} })` so `usePlocFromContext` / `useUseCaseFromContext` work.
- **Use a test Ploc** with `createMockPloc(initialState)` from `@c-a-f/testing/core` for controllable state, or a **real Ploc with mock UseCases** when you need methods like `loadUsers()`.
- **Wait for async updates** with `nextTick()` and short timeouts if needed.

```ts
const ploc = createMockPloc({ users: mockUsers, loading: false, error: null, ... });
const wrapper = renderWithCAF(UserListWithPloc, { plocs: { user: ploc } });
await nextTick();
expect(wrapper.find('[data-testid="count"]').text()).toBe('Count: 2');
```

## 4. Error handling in tests

- **UseCase errors:** use `createMockUseCaseError(error)` or `createMockUseCase(() => createErrorResult(error))`.
- **Validation errors:** return a `RequestResult` with `createErrorResult(new UserValidationError('...', { field: 'msg' }))` and assert on Ploc state (`validationErrors`, `error`).
- **Vue:** render with a Ploc that has error state or a mock UseCase that returns an error, then assert the UI shows the error (e.g. `data-testid="error"`).

## Best practices

1. **Keep Ploc tests focused** – mock UseCases so you only test Ploc state transitions and error mapping.
2. **Keep UseCase tests focused** – mock the repository (or service) and assert on `execute()` result only.
3. **Use `renderWithCAF` for any component that reads from CAF context** – otherwise you'll get "no ploc/use case" or undefined.
4. **Prefer `createMockPloc(initialState)` for presentational assertions** when you don't need to trigger async UseCase calls; use a real Ploc + mock UseCases when you need to test "click Refresh → load users".
5. **Use `data-testid`** for stable selectors in component tests.
6. **Clean up** – call `tester.cleanup()` in `afterEach` when using `createPlocTester` so subscriptions are removed.
