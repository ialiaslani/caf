# CAF Best Practices Guide

This guide covers recommended patterns for building applications with CAF (Clean Architecture Frontend): folder structure, dependency injection, error handling, testing, and performance.

---

## 1. Folder structure best practices

CAF uses a dedicated **`caf/`** folder for Clean Architecture layers. See [ADR-001: The caf/ folder structure](adr/001-caf-folder-structure.md) for the rationale.

### Do

- **Keep all CAF-style code under `caf/`**  
  Use `caf/domain/`, `caf/application/`, and `caf/infrastructure/` so the boundary between “app shell + UI” and “business logic” is clear.

- **Respect dependency direction**  
  - **domain** — No imports from application, infrastructure, or framework. Only entities, repository interfaces (`I*Repository`), and pure domain services.  
  - **application** — Depends only on domain and `@c-a-f/core`. Use cases, Plocs, and application types. No `react`, `vue`, `@angular/*`, or HTTP/GraphQL clients.  
  - **infrastructure** — Implements domain/application interfaces. This is where you import React Router, Axios, Zod, etc.

- **Group by feature or aggregate**  
  Inside each layer, organize by feature (e.g. `User`, `Order`) rather than by type only:
  - `caf/domain/User/` — `user.entities.ts`, `user.irepository.ts`, `user.service.ts`, `index.ts`
  - `caf/application/User/` — `Commands/`, `Queries/`, `Ploc/`, `index.ts`
  - `caf/infrastructure/api/User/` — `UserRepository.ts`, `UserApi.ts`, `MockUserRepository.ts`

- **Use a composition root**  
  Prefer a single `caf/setup.ts` (or `caf/composition.ts`) that instantiates repositories, use cases, and Plocs and exposes one or a few entry points (e.g. `setupUserPloc()`, `setupApp()`). The app shell then imports from `caf/setup` and passes provided instances to `CAFProvider` or equivalent.

- **Re-export via `caf/index.ts`**  
  Export domain, application, and infrastructure (and optionally setup) from `caf/index.ts` so the rest of the app can use path aliases like `@/caf` or `@caf/domain`.

### Don’t

- **Don’t put framework or UI code inside `caf/`**  
  React/Vue/Angular components, hooks that depend on router or DOM, and app-specific pages belong in your app’s `src/` (e.g. `src/components`, `src/pages`), not under `caf/`.

- **Don’t import infrastructure into domain**  
  Domain must not depend on concrete APIs, databases, or UI. It only defines interfaces (e.g. `IUserRepository`); infrastructure implements them.

- **Don’t import application into domain**  
  Domain is the innermost layer; application depends on domain, not the other way around.

- **Don’t scatter CAF logic**  
  Avoid mixing CAF layers into random `src/lib` or feature folders. Keeping everything under `caf/` makes dependencies and testing predictable.

### Path aliases

Use TypeScript path aliases to keep imports short:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@caf/*": ["./caf/*"],
      "@caf/domain": ["./caf/domain"],
      "@caf/application": ["./caf/application"],
      "@caf/infrastructure": ["./caf/infrastructure"]
    }
  }
}
```

---

## 2. Dependency injection patterns

CAF does not ship a DI container. Use **constructor injection** and **composition at the root** so that domain and application depend on interfaces, and infrastructure provides implementations.

### Wiring at app root (recommended)

1. **Create implementations in one place**  
  In `caf/setup.ts` (or your app’s bootstrap), instantiate repositories (e.g. `UserRepository` with real API or `MockUserRepository` for dev/tests), then domain services, validators, use cases, and finally Plocs.

2. **Provide via CAFProvider (React) or equivalent**  
  At the root of your React app, wrap the tree with `CAFProvider` and pass the Plocs and UseCases you created in setup:

```tsx
// App.tsx or main.tsx
import { CAFProvider } from '@c-a-f/infrastructure-react';
import { setupUserPloc, setupRouteManager } from './caf/setup';

const userPloc = setupUserPloc();
const routeManager = setupRouteManager();

<CAFProvider plocs={{ user: userPloc }} useCases={{ createUser: createUserUseCase }}>
  <App />
</CAFProvider>
```

3. **Consume in descendants**  
  Use `usePlocFromContext('user')`, `useUseCaseFromContext('createUser')` (or Vue/Angular equivalents) so children don’t receive Plocs/UseCases via props. This avoids prop drilling and keeps components decoupled from creation details.

### Single vs multiple providers

- **Single root provider**  
  Register all Plocs and UseCases needed by the app in one `CAFProvider`. Simplest and recommended for most apps.

- **Nested providers (optional)**  
  You can nest `CAFProvider` for feature-specific Plocs (e.g. a dashboard scope). Inner provider does not merge with outer; children only see the nearest provider’s keys. Prefer a single provider with all keys unless you have a clear need for scoped instances.

### UseCase and Ploc creation

- **Stable references**  
  Create Plocs and UseCases once (e.g. in setup or in a module that runs once) and pass the same instance to the provider. Avoid creating new instances on every render (e.g. don’t `new UserPloc()` inside a component without `useMemo`), or you will get new state and unnecessary re-subscriptions.

- **React: useMemo when creating in component tree**  
  If you must create a Ploc inside a component (e.g. for a screen that owns its Ploc), use `useMemo` so the instance is stable across renders:

```tsx
const userPloc = useMemo(
  () => new UserPloc(getUsersUseCase, createUserUseCase),
  [getUsersUseCase, createUserUseCase]
);
```

### Testing

In tests, provide test doubles via the same mechanism: use `renderWithCAF` (React), `mountWithCAF` (Vue), or `provideTestingCAF` (Angular) with `plocs` and `useCases` so components receive mock Plocs and UseCases from context. See [Testing strategies](#4-testing-strategies) below.

---

## 3. Error handling patterns

### UseCase: RequestResult (loading / data / error)

Use cases return `Promise<RequestResult<T>>`, where `RequestResult<T>` has reactive `loading`, `data`, and `error` (each is a Pulse). The infrastructure hook (`useUseCase`) subscribes to these and exposes `loading`, `error`, and `data` to the UI.

- **In the UseCase**  
  Set `result.loading.value`, `result.data.value`, and `result.error.value` appropriately. On success: set data, clear error, set loading to false. On failure: set error, clear data (or leave previous), set loading to false.

- **In the UI**  
  Use the hook’s `loading` and `error` to show spinners and error messages. Check `error` before rendering primary content; optionally show a retry or reset action.

```tsx
const { execute, loading, error, data } = useUseCase(createUserUseCase);

if (loading) return <Spinner />;
if (error) return <ErrorMessage error={error} onRetry={() => execute(args)} />;
return <SuccessView data={data} />;
```

### Ploc state and errors

Plocs often hold a structured state that includes an error field (e.g. `{ users: [], loading: false, error: string | null }`). When a UseCase fails, the Ploc can set `changeState({ ...state, error: err.message })` so the UI bound to Ploc state can show the error. Prefer one source of truth: either the UseCase result (via `useUseCase`) or the Ploc state, and keep the other in sync or derived to avoid duplication.

### CAFErrorBoundary (React)

Use `CAFErrorBoundary` to catch React errors (e.g. from render or from uncaught errors in event handlers) so the app doesn’t white-screen. Wrap the app (or a large subtree) and provide a `fallback` for a consistent error UI and a “Try again” (reset) action.

```tsx
<CAFErrorBoundary
  fallback={(error, errorInfo, resetError) => (
    <div>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={resetError}>Try again</button>
    </div>
  )}
  onError={(error, errorInfo) => logErrorToService(error, errorInfo)}
>
  <App />
</CAFErrorBoundary>
```

- **fallback** — Renders when an error is caught; use it to show a message and a way to recover (e.g. reset state and re-render).
- **onError** — Use for logging or reporting to an error service.

Error boundaries do not catch async errors (e.g. rejected promises) unless you explicitly forward them into state or trigger a re-render that throws. So: handle UseCase/RequestResult errors in the UI (loading/error/data) and use the boundary for synchronous render and lifecycle errors.

### Centralizing error shape

For consistency, normalize API or UseCase errors to a single shape (e.g. `{ message: string; code?: string }`) in infrastructure or in a small shared helper, and use that in Ploc state and in the error boundary fallback. The core `normalizeApiError` (from `@c-a-f/core`) can help for API responses.

---

## 4. Testing strategies

### Unit tests: Ploc and UseCase in isolation

- **Ploc**  
  Instantiate the Ploc with real or mock UseCases. Call methods (e.g. `loadUsers()`), then assert on `ploc.state`. Use `@c-a-f/testing` helpers: `createPlocTester`, `waitForStateChange`, `createMockPloc` for controllable state, `assertStateHistory` for history/snapshot.

- **UseCase**  
  Use `createMockUseCase`, `createMockUseCaseSuccess`, `createMockUseCaseError`, `createUseCaseTester`, `createSuccessResult` / `createErrorResult` to mock UseCases and assert on `RequestResult` (loading, data, error) without hitting real APIs.

- **Repository**  
  Use `createMockRepository` or `createMockRepositoryStub` to implement `I*Repository` with stub implementations or spies, so domain and application tests don’t depend on real HTTP or DB.

### Integration tests: components with CAF context

When testing components that use `usePlocFromContext` or `useUseCaseFromContext`, provide Plocs and UseCases through the same provider mechanism used in the app:

- **React**  
  Use `renderWithCAF` from `@c-a-f/testing/react` with `plocs` and `useCases`. Use `createTestPloc` for a Ploc with controllable state and `mockUseCase.success` / `mockUseCase.error` / `mockUseCase.async` for UseCases. Use `waitForPlocState` when waiting for async state updates.

- **Vue**  
  Use `mountWithCAF` from `@c-a-f/testing/vue` with the same options.

- **Angular**  
  Use `provideTestingCAF` in `TestBed` with `plocs` and `useCases`, then `createTestPloc` and `mockUseCase` as needed.

This keeps tests close to real usage and avoids bypassing the context API.

### What to test

- **Domain** — Pure logic, entities, validation rules; no framework or infrastructure.
- **Application** — Use cases (with mock repositories) and Ploc methods (with mock UseCases); assert state and side effects.
- **Infrastructure** — Integration tests or contract tests for repositories (e.g. against a real or mocked API).
- **UI** — Component tests that render with CAF context and assert on loading/error/data and user actions (click, submit); use mocks so tests are fast and stable.

See the [@c-a-f/testing README](../../packages/testing/README.md) for full API and examples.

---

## 5. Performance optimization

### Subscription cleanup

Ploc and Pulse use subscribe/unsubscribe. If you subscribe in a component (e.g. via `usePloc` or manual `ploc.subscribe()`), always unsubscribe on unmount to avoid leaks and updates on unmounted components. The built-in `usePloc` and `useUseCase` hooks already clean up; if you subscribe manually, use `useEffect`’s cleanup or equivalent.

### Stable Ploc and UseCase references

Avoid creating a new Ploc or UseCase on every render. Prefer creating them once in setup or at module scope and providing via context. If you create them inside a component, use `useMemo` (React) or the framework’s equivalent so the instance is stable; otherwise you risk unnecessary re-subscriptions and lost state.

### Minimize state and re-renders

- **Ploc state**  
  Keep Ploc state minimal and serializable when possible. Avoid putting large objects or frequently changing values in state if only a small part is used for rendering; consider deriving values or splitting into smaller Plocs.

- **RequestResult**  
  The same applies to UseCase results: the hook re-renders when loading, data, or error change. That is by design; if you need to avoid re-renders in a specific child, use React.memo / computed refs / selectors as you would with any React state.

### Batching and Pulse

The core Pulse implementation notifies subscribers synchronously on `value` set. If you update many Pulses in a tight loop, you may get many notifications in one tick; that’s usually acceptable. For very heavy updates, consider batching state updates in the Ploc (e.g. one `changeState` with the full new state) rather than multiple small updates.

### DevTools and profiling

Use CAF DevTools (when available for your framework) to inspect Ploc state and UseCase executions. Use the framework’s profiler (e.g. React DevTools Profiler) to find unnecessary re-renders and optimize with memoization or state structure changes.

---

## Summary

| Area              | Recommendation |
|-------------------|----------------|
| **Folder structure** | Keep all CAF layers under `caf/`; respect domain ← application ← infrastructure; use a composition root and path aliases. |
| **Dependency injection** | Wire repositories, use cases, and Plocs in `caf/setup.ts`; provide via `CAFProvider` (or equivalent); consume via `usePlocFromContext` / `useUseCaseFromContext`. |
| **Error handling** | Use RequestResult (loading/data/error) in the UI; put errors in Ploc state when needed; use CAFErrorBoundary for render errors; normalize errors in one place. |
| **Testing**        | Unit-test Ploc and UseCase with mocks; use `renderWithCAF` / `mountWithCAF` / `provideTestingCAF` and `createTestPloc` / `mockUseCase` for component tests. |
| **Performance**    | Clean up subscriptions; keep Ploc/UseCase references stable; minimize and shape state to avoid unnecessary re-renders. |

For architectural rationale, see the [Architecture Decision Records](adr/README.md).
