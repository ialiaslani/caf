# CAF Troubleshooting Guide

This guide helps you fix common errors, performance issues, TypeScript issues, and testing issues when using CAF.

---

## 1. Common errors and solutions

### "Cannot read property 'subscribe' of undefined"

**Cause:** You're calling `usePloc(ploc)` or otherwise subscribing to a Ploc that is `undefined`. This usually happens when:

- `usePlocFromContext('key')` returns `undefined` because the key isn't registered in `CAFProvider`, or the component is rendered outside `CAFProvider`.
- You passed the wrong key (typo or different key than the one used in `plocs={{ ... }}`).

**Solution:**

1. Ensure the component is wrapped in `CAFProvider` with the Ploc registered:  
   `<CAFProvider plocs={{ user: userPloc }}>...</CAFProvider>`
2. Use the same string key: `usePlocFromContext('user')` must match `plocs={{ user: userPloc }}`.
3. Guard before using the Ploc:
   ```tsx
   const ploc = usePlocFromContext<UserPloc>('user');
   if (!ploc) return <div>Not available</div>; // or throw, or redirect
   const [state] = usePloc(ploc);
   ```

---

### "Cannot read property 'execute' of undefined"

**Cause:** You're calling `useUseCase(useCase)` or `useCase.execute(...)` when the UseCase is `undefined`. Typically:

- `useUseCaseFromContext('key')` returns `undefined` (key not in provider or used outside `CAFProvider`).
- Wrong key for the UseCase in `CAFProvider`'s `useCases` prop.

**Solution:**

1. Register the UseCase in `CAFProvider`:  
   `<CAFProvider useCases={{ createUser: createUserUseCase }}>...</CAFProvider>`
2. Use the same key: `useUseCaseFromContext('createUser')`.
3. Guard before using:
   ```tsx
   const createUser = useUseCaseFromContext<[CreateUserInput], User>('createUser');
   if (!createUser) return null;
   const { execute, loading } = useUseCase(createUser);
   ```

---

### "Can't perform a React state update on an unmounted component"

**Cause:** A subscription (Ploc or Pulse) is still active after the component unmounted. When the Ploc/Pulse updates, it calls a setState that no longer has a mounted component.

**Solution:**

- Prefer **`usePloc`** and **`useUseCase`**; they subscribe and unsubscribe automatically. If you use them, this error usually means you're also subscribing somewhere else (e.g. manual `ploc.subscribe()`).
- If you subscribe manually (`ploc.subscribe(listener)` or `pulse.subscribe(listener)`), unsubscribe in the cleanup of `useEffect`:
  ```tsx
  useEffect(() => {
    const listener = (state: State) => setState(state);
    ploc.subscribe(listener);
    return () => ploc.unsubscribe(listener);
  }, [ploc]);
  ```
- Ensure Plocs are not recreated on every render (create in setup or with `useMemo`), so you don't accumulate duplicate subscriptions.

---

### Error boundary doesn't show for failed UseCase / async errors

**Cause:** React error boundaries only catch errors during **render** and in **lifecycle methods**. They do not catch errors in async code (e.g. a rejected promise from `useCase.execute()`).

**Solution:**

- Handle async errors in the UI using the `error` from `useUseCase` or from Ploc state:
  ```tsx
  const { execute, loading, error } = useUseCase(createUserUseCase);
  if (error) return <ErrorMessage error={error} onRetry={() => execute(args)} />;
  ```
- Use `CAFErrorBoundary` for **synchronous** errors (e.g. in render or in event handlers that throw). For async errors, show a fallback UI based on `error` state and optionally report via `onError` or a logging service.

---

### Nested provider: child gets undefined for a key that exists in parent

**Cause:** Inner `CAFProvider` **replaces** the context value; it does not merge with the parent. So if the inner provider only passes `plocs={{ dashboard: dashboardPloc }}`, the child only has `dashboard`; it does not see the parent's `user` key.

**Solution:**

- Prefer a **single root** `CAFProvider` with all Plocs and UseCases:  
  `plocs={{ user: userPloc, dashboard: dashboardPloc }}`.
- If you need nested providers (e.g. feature scope), ensure the inner tree only uses keys provided by the inner provider, or pass through the parent's value when building the inner provider's value.

---

### useUseCase: loading/data/error never update after execute()

**Cause:** UseCase must return `Promise<RequestResult<T>>` with `loading`, `data`, and `error` as **Pulse** instances. If the UseCase returns a plain value or a different shape, the hook won't see updates.

**Solution:**

- Implement the UseCase like this:
  ```ts
  import { pulse, type RequestResult } from '@c-a-f/core';

  async execute(args: Args): Promise<RequestResult<T>> {
    const loading = pulse(true);
    const data = pulse(null as T);
    const error = pulse(null as unknown as Error);
    try {
      const result = await this.repo.doSomething(args);
      data.value = result;
      error.value = null as unknown as Error;
      return { loading, data, error };
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
      return { loading, data, error };
    } finally {
      loading.value = false;
    }
  }
  ```
- Ensure you're not returning a raw `T` or a Promise that resolves to something other than `RequestResult<T>`.

---

## 2. Performance issues

### Too many re-renders when using usePloc

**Symptom:** The component re-renders on every Ploc state change, even when only a small part of the state is used.

**Solutions:**

- **React.memo** the component and ensure parent isn't passing new object/function references every render.
- **Split state** into smaller Plocs so only the part of the tree that needs a subset of state subscribes to that Ploc.
- **Derive in the Ploc** and keep the state minimal; expose computed values via getters or methods so the component doesn't need to subscribe to raw state that changes often.
- Avoid creating a new Ploc (or new UseCase) on every render; use stable references from setup or `useMemo` so subscription identity doesn't change.

---

### Memory growth / subscription leak

**Symptom:** Memory usage grows over time (e.g. when navigating between screens or opening/closing modals).

**Solutions:**

- Use **`usePloc`** and **`useUseCase`**; they unsubscribe on unmount. Prefer them over manual `ploc.subscribe()`.
- If you subscribe manually, always **unsubscribe** in the cleanup of `useEffect` (or equivalent).
- Don't create new Plocs on every render without cleanup; if you do create per-screen Plocs, ensure they're disposed or that no one subscribes after the screen is gone (e.g. create inside a component that unmounts and use the hook there so cleanup runs).

---

### Slow first render or many state updates at once

**Symptom:** UI feels sluggish when a screen loads or when one action triggers many state updates.

**Solutions:**

- **Batch updates** in the Ploc: prefer one `changeState()` with the full new state instead of multiple small `changeState()` calls in a loop.
- **Debounce** or throttle high-frequency updates (e.g. search input) before calling the Ploc or UseCase.
- Use the framework's profiler (e.g. React DevTools Profiler) to find components that re-render often and apply memoization or state structure changes.

---

## 3. TypeScript issues

### usePlocFromContext / useUseCaseFromContext return type too broad

**Symptom:** TypeScript infers `Ploc<unknown>` or `UseCase<any[], any>` and you lose type safety for state or execute args/result.

**Solution:**

- Pass the **generic** explicitly:
  ```ts
  const userPloc = usePlocFromContext<UserPloc>('user');
  // UserPloc extends Ploc<UserState>
  const createUser = useUseCaseFromContext<[CreateUserInput], User>('createUser');
  ```
- Define your Ploc class and state type, and use them in the generic:  
  `usePlocFromContext<MyPloc>('key')` so `usePloc(ploc)` gives you the correct state type.

---

### UseCase execute args or result type wrong

**Symptom:** Type errors on `useCase.execute(...)` or on the result of `useUseCase(useCase)` (e.g. `data` or return type of `execute`).

**Solution:**

- Declare the UseCase with correct generics:  
  `UseCase<[Arg1, Arg2], Result>` for `execute(arg1, arg2)` returning `Promise<RequestResult<Result>>`.
- When using `useUseCaseFromContext`, pass the same generics:  
  `useUseCaseFromContext<[Arg1, Arg2], Result>('key')`.
- Ensure `RequestResult<T>` uses the same `T` as the UseCase result type.

---

### "Property 'X' does not exist on type 'unknown'" on ploc.state

**Symptom:** After `usePloc(ploc)`, `state` is inferred as `unknown` or too generic.

**Solution:**

- Type the Ploc when getting it from context:  
  `usePlocFromContext<UserPloc>('user')` where `UserPloc extends Ploc<UserState>`.
- Then `usePloc(userPloc)` will infer `UserState` for `state`. If the Ploc is still typed as `Ploc<unknown>`, the generic on `usePlocFromContext` is what drives the state type.

---

### Path alias @caf/* not resolving

**Symptom:** Imports like `@caf/domain` or `@caf/application` fail in the IDE or at build time.

**Solution:**

- In **tsconfig.json**, add:
  ```json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@caf/*": ["./caf/*"]
      }
    }
  }
  ```
- If using a bundler (Vite, Webpack, etc.), configure the same aliases there (e.g. Vite `resolve.alias`, Webpack `resolve.alias`). TypeScript only affects type-checking; the bundler must resolve the paths at build time.

---

## 4. Testing issues

### "Cannot read property 'subscribe' of undefined" in tests

**Cause:** The component under test uses `usePlocFromContext` or `usePloc(ploc)` but the test renders the component **without** CAF context, so `ploc` is undefined.

**Solution:**

- Use the testing helpers that provide context:
  - **React:** `renderWithCAF` from `@c-a-f/testing/react` with `plocs` and/or `useCases`.
  - **Vue:** `mountWithCAF` from `@c-a-f/testing/vue`.
  - **Angular:** `provideTestingCAF` from `@c-a-f/testing/angular` in `TestBed`.
- Example (React):
  ```tsx
  const ploc = createTestPloc({ count: 0 });
  renderWithCAF(<MyComponent />, { plocs: { counter: ploc } });
  ```

---

### Component passes in isolation but fails when rendered with real provider

**Cause:** Test uses a mock (e.g. `createTestPloc`) that doesn't behave like the real Ploc (e.g. missing methods or different state shape).

**Solution:**

- Align the test Ploc's state shape and methods with what the component expects (e.g. `changeState` to simulate user actions).
- For integration-style tests, use the real Ploc class with mock UseCases/repositories so behavior matches the app. Use `createTestPloc` when you only need controllable state and no logic.

---

### useUseCase or UseCase test: loading/error/data not updating

**Cause:** The mock UseCase doesn't return a proper `RequestResult` (with Pulse instances), or the test doesn't wait for async updates.

**Solution:**

- Use `createMockUseCaseSuccess`, `createMockUseCaseError`, or `createMockUseCase` that returns `createSuccessResult(data)` / `createErrorResult(error)` from `@c-a-f/testing/core`.
- In the test, **await** the execute and, if testing the hook, use `waitFor` (React Testing Library) or `waitForPlocState` to wait for state updates before asserting.

---

### Angular: "No provider for X" in tests

**Cause:** The component or a dependency injects a CAF-related token (e.g. Ploc, RouteHandler) that isn't provided in `TestBed`.

**Solution:**

- Add **`provideTestingCAF`** with the same keys and types the component expects:
  ```ts
  TestBed.configureTestingModule({
    imports: [MyComponent],
    providers: [
      provideTestingCAF({
        plocs: { user: userPloc },
        useCases: { createUser: mockUseCase.success({ id: '1' }) },
      }),
    ],
  });
  ```
- If the component uses routing, provide a mock `RouteHandler` or use the Angular testing utilities for the router.

---

### Snapshot or state history tests flaky

**Cause:** Async updates (UseCase execution, timers) complete at different times; or state is recreated each run so references change.

**Solution:**

- **Await** all async work before taking snapshots or asserting state history: use `waitFor`, `waitForPlocState`, or `flushPromises` as appropriate.
- Use **stable mocks** (e.g. same `createTestPloc` instance for the test) and avoid creating new Plocs inside the test body without controlling when they run.
- Prefer asserting on **observable outcome** (e.g. "button shows 5" after click) rather than internal state history if the order of intermediate states is not guaranteed.

---

## Quick reference

| Symptom | Likely cause | See section |
|--------|----------------|-------------|
| `subscribe` of undefined | Ploc/UseCase not from provider or wrong key | 1. Common errors |
| State update on unmounted component | Missing unsubscribe or duplicate subscription | 1. Common errors |
| Error boundary not catching async error | Boundaries don't catch promises | 1. Common errors |
| useUseCase never updates | UseCase didn't return RequestResult with Pulse | 1. Common errors |
| Too many re-renders | Large state or new Ploc every render | 2. Performance |
| Memory growth | Subscriptions not cleaned up | 2. Performance |
| Generic type lost | Missing generic on usePlocFromContext/useUseCaseFromContext | 3. TypeScript |
| Path alias not resolving | tsconfig paths and/or bundler alias | 3. TypeScript |
| Test: undefined ploc | Component not wrapped with renderWithCAF / provideTestingCAF | 4. Testing |
| Test: loading/data not updating | Mock UseCase or test not awaiting | 4. Testing |

For migration pitfalls, see [MIGRATION.md — Common pitfalls](MIGRATION.md#5-common-pitfalls-and-solutions). For patterns and structure, see [BEST_PRACTICES.md](BEST_PRACTICES.md).
