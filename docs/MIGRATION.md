# CAF Migration Guides

This document helps you migrate to CAF from Redux, Zustand, or React Query, or add CAF incrementally to an existing project. It also lists common pitfalls and solutions.

---

## Overview

| From              | Main CAF equivalent                          | Notes |
|-------------------|-----------------------------------------------|--------|
| **Redux**         | Ploc (state) + UseCase (side effects)          | One or more Plocs per “slice”; UseCases for async/API. |
| **Zustand**       | Ploc or Pulse                                 | Ploc for feature state; Pulse for a single reactive value. |
| **React Query**   | UseCase + `useUseCase` + RequestResult        | UseCase returns loading/data/error; no built-in server cache. |
| **Existing app**  | Add `caf/` and migrate one feature at a time   | Coexist with current state until you replace it. |

See [Best Practices](BEST_PRACTICES.md) and [ADRs](adr/README.md) for CAF patterns and rationale.

---

## 1. Migrating from Redux to CAF

### Mental model

- **Redux store / slice** → **Ploc** (or multiple Plocs per feature). State lives in `ploc.state`; updates via `ploc.changeState()`.
- **Redux actions** → **Ploc methods** (sync) or **UseCase** (async). No global action types; call methods on the Ploc or execute a UseCase.
- **Redux thunks / sagas** → **UseCase**. Use cases take dependencies (e.g. repository), return `Promise<RequestResult<T>>` with loading/data/error.
- **Selectors** → **State or derived values**. Read from `ploc.state` in the component or derive in the Ploc (e.g. getters or methods that return computed values).
- **Provider** → **CAFProvider**. Provide Plocs (and UseCases) by key; components use `usePlocFromContext('key')` instead of `useSelector` + `useDispatch`.

### Step-by-step

1. **Introduce the `caf/` folder**  
   Add `caf/domain/`, `caf/application/`, `caf/infrastructure/`. Define domain entities and repository interfaces for the data you currently fetch in thunks.

2. **Map one slice to one Ploc**  
   Create a Ploc whose state shape matches (or is close to) the slice state. Put initial state in the Ploc constructor; replace `dispatch(action)` with `ploc.someMethod()` that calls `this.changeState(...)`.

3. **Move async logic into UseCases**  
   For each thunk/saga that calls an API, create a UseCase that receives a repository (or API abstraction), calls it, and returns `RequestResult<T>`. The Ploc can call this UseCase and then update its state from the result (loading, data, error).

4. **Wire at root and provide via context**  
   In `caf/setup.ts`, create repositories, use cases, and Plocs. Wrap the app with `CAFProvider` and pass the Plocs (and UseCases if consumed directly). Remove the Redux `Provider` and store once the feature is migrated.

5. **Replace `useSelector` / `useDispatch` in components**  
   Use `usePlocFromContext('user')` (or the key you registered) and `usePloc(ploc)` to get `[state, ploc]`. Render from `state`; call `ploc.someMethod()` instead of `dispatch(action)`.

### Example: Redux slice → Ploc + UseCase

**Before (Redux):**
```typescript
// slice
const usersSlice = createSlice({
  name: 'users',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    setLoading: (s, { payload }) => { s.loading = payload; },
    setUsers: (s, { payload }) => { s.items = payload; s.loading = false; },
    setError: (s, { payload }) => { s.error = payload; s.loading = false; },
  },
});
// thunk
const fetchUsers = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await api.getUsers();
    dispatch(setUsers(res));
  } catch (e) {
    dispatch(setError(e));
  }
};
```

**After (CAF):**
```typescript
// caf/application/User/Ploc/UserPloc.ts
class UserPloc extends Ploc<UserState> {
  constructor(private getUsersUseCase: GetUsers) {
    super({ items: [], loading: false, error: null });
  }
  async loadUsers() {
    this.changeState({ ...this.state, loading: true });
    const result = await this.getUsersUseCase.execute();
    this.changeState({
      ...this.state,
      loading: result.loading.value,
      items: result.data.value ?? this.state.items,
      error: result.error.value ?? null,
    });
  }
}
```

Components then use `usePlocFromContext('user')` and `usePloc(ploc)`, and call `ploc.loadUsers()` instead of `dispatch(fetchUsers())`.

### What you lose / gain

- **No built-in Redux DevTools** — Use CAF DevTools (when available) or log Ploc state for debugging.
- **No single serializable store** — Each Ploc holds its own state; time-travel would need to be implemented per Ploc or via a separate layer.
- **Gains** — Framework-agnostic logic, clear layers (domain/application/infrastructure), testable UseCases and Plocs without the Redux runtime, no action type boilerplate.

---

## 2. Migrating from Zustand to CAF

### Mental model

- **Zustand store** → **Ploc** (for structured state + logic) or **Pulse** (for a single reactive value).
- **Store actions** → **Ploc methods** or **UseCase** (for async). No `getState()` / `setState()` in components; use `ploc.state` and `ploc.changeState()` or `ploc.someMethod()`.
- **Provider** → **CAFProvider** with Plocs (and UseCases) by key; **`usePlocFromContext`** + **`usePloc`** instead of `useStore`.

### Step-by-step

1. **Add `caf/`** and, for the feature you’re migrating, define domain entities and repository interfaces if you have server/API calls.
2. **One store → one Ploc**  
   Create a Ploc with the same state shape. Move sync updates into methods that call `this.changeState()`. Move async logic into UseCases and call them from the Ploc.
3. **Provide the Ploc**  
   In setup, create the Ploc (and its UseCases); pass it to `CAFProvider` with a key (e.g. `plocs={{ user: userPloc }}`).
4. **Replace `useStore`**  
   Use `const ploc = usePlocFromContext('user'); const [state, _] = usePloc(ploc);` and replace direct store actions with `ploc.methodName()`.

### Example: Zustand → Ploc

**Before (Zustand):**
```typescript
const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
  decrement: () => set((s) => ({ count: s.count - 1 })),
}));
// In component: const { count, increment } = useCounterStore();
```

**After (CAF):**
```typescript
// caf/application/Counter/Ploc/CounterPloc.ts
class CounterPloc extends Ploc<{ count: number }> {
  constructor() {
    super({ count: 0 });
  }
  increment() {
    this.changeState({ ...this.state, count: this.state.count + 1 });
  }
  decrement() {
    this.changeState({ ...this.state, count: this.state.count - 1 });
  }
}
// In component: const ploc = usePlocFromContext('counter'); const [state] = usePloc(ploc);
// ploc.increment(); ploc.decrement();
```

### What you lose / gain

- **No automatic selector re-render optimization** — Components re-render when `ploc.state` changes (via `usePloc`). Use React.memo or split into smaller Plocs if needed.
- **Gains** — Same as Redux: clear layers, testability, framework-agnostic core, no global store; optional UseCases for async and reuse.

---

## 3. Migrating from React Query to CAF

### Mental model

- **`useQuery`** → **UseCase** (query) + **`useUseCase`** or **Ploc that calls the UseCase**. Loading/data/error come from `RequestResult` (exposed by `useUseCase` as `loading`, `data`, `error`).
- **`useMutation`** → **UseCase** (command) + **`useUseCase`**. You call `execute(args)` when the user submits; handle loading/error/data in the component or in a Ploc.
- **Cache / refetch / invalidation** — CAF does not include a server cache. You can: (a) keep React Query for read-heavy screens and use CAF for commands and some features; (b) implement a simple cache in infrastructure (e.g. repository that caches by key and TTL); (c) put “last fetched” data in Ploc state and refetch by calling the UseCase again.

### Step-by-step

1. **Define UseCases for each query/mutation**  
   One UseCase per logical operation (e.g. `GetUser`, `CreatePost`). They should take a repository (or API abstraction) and return `Promise<RequestResult<T>>`.
2. **Use `useUseCase` in components**  
   You get `execute`, `loading`, `error`, `data`. For queries, call `execute()` in `useEffect` (or when the screen mounts). For mutations, call `execute(args)` on submit.
3. **Optional: wrap in a Ploc**  
   If you want a single place to hold list state, filters, and “current item,” create a Ploc that calls the UseCase and updates its state from the result; then use `usePloc` in the UI.
4. **Caching (if needed)**  
   Implement caching in the infrastructure layer (e.g. a repository that checks a cache before fetching and invalidates on mutation). Or keep React Query for specific data and use CAF for the rest.

### Example: React Query → useUseCase

**Before (React Query):**
```tsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['users'],
  queryFn: () => api.getUsers(),
});
const mutation = useMutation({
  mutationFn: (user: CreateUserInput) => api.createUser(user),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
});
```

**After (CAF):**
```tsx
const { execute: loadUsers, loading, error, data } = useUseCase(getUsersUseCase);
useEffect(() => { loadUsers(); }, []);

const { execute: createUser, loading: creating } = useUseCase(createUserUseCase);
const handleCreate = async (user: CreateUserInput) => {
  const result = await createUser(user);
  if (result) loadUsers(); // refetch list
};
```

You can also put `loadUsers` and list state in a Ploc and expose `loadUsers` and `state` from the Ploc so the component only talks to the Ploc.

### What you lose / gain

- **No built-in cache, refetchOnWindowFocus, or invalidation** — You refetch by re-executing the UseCase (or Ploc method). Add caching in infrastructure if needed.
- **Gains** — Same domain/application/infrastructure split; UseCases are easy to test and reuse; loading/error/data are explicit and framework-agnostic.

---

## 4. Adding CAF to an existing project

You don’t have to rewrite the app at once. Add CAF incrementally and migrate feature by feature.

### Strategy

1. **Install packages**  
   `npm install @c-a-f/core @c-a-f/infrastructure-react` (or Vue/Angular). Add `@c-a-f/testing` as dev dependency if you write tests.

2. **Create the `caf/` folder**  
   Add `caf/domain/`, `caf/application/`, `caf/infrastructure/` and a minimal `caf/index.ts` (and optionally `caf/setup.ts`). See [Best Practices — Folder structure](BEST_PRACTICES.md#1-folder-structure-best-practices).

3. **Pick one feature to migrate**  
   Choose a bounded feature (e.g. “user profile,” “settings”). Define domain entities and repository interfaces, implement one UseCase and one Ploc, and implement the repository in `caf/infrastructure/`.

4. **Wire and provide**  
   In your app entry, create the Ploc (and UseCase) for that feature and add `CAFProvider` with a key (e.g. `plocs={{ profile: profilePloc }}`). You can keep your existing Redux/Zustand/React Query provider next to it; the rest of the app is unchanged.

5. **Switch one screen to CAF**  
   In the screen that belongs to the migrated feature, use `usePlocFromContext('profile')` and `usePloc(ploc)` instead of the old state/query. Remove the old state/query for that feature when done.

6. **Repeat**  
   Migrate the next feature the same way. Over time, remove the old global state or query layer when no longer used.

### Coexistence

- **Redux + CAF** — Both providers can wrap the tree; some components use `useSelector`/`useDispatch`, others use `usePlocFromContext`/`usePloc`. No conflict.
- **React Query + CAF** — Use React Query for screens that heavily rely on cache/invalidation; use CAF for new features or commands. Share the same API client or repository implementation if useful.
- **Zustand + CAF** — Same idea: keep existing stores, add CAFProvider and migrate one store at a time to a Ploc.

### Where to put the `caf/` folder

- **Next to `src/`** — e.g. `src/caf/` so the app lives under `src/` and CAF under `src/caf/`.
- **At project root** — e.g. `caf/` at root if your app entry is at root. Adjust path aliases (`@caf/*`, etc.) in `tsconfig.json` accordingly.

---

## 5. Common pitfalls and solutions

### Pitfall: Creating a new Ploc on every render

**Symptom:** State resets on re-render; unnecessary re-subscriptions; tests flaky.

**Solution:** Create Plocs (and UseCases) once in `caf/setup.ts` or at module scope and provide them via `CAFProvider`. If you must create a Ploc inside a component, use `useMemo( () => new MyPloc(...), [deps] )` so the instance is stable.

---

### Pitfall: Forgetting to unsubscribe

**Symptom:** Memory leaks; “Can’t perform a React state update on an unmounted component” or similar.

**Solution:** Prefer `usePloc` and `useUseCase`; they subscribe and unsubscribe for you. If you call `ploc.subscribe()` or `pulse.subscribe()` manually, unsubscribe in the cleanup of `useEffect` (or equivalent in your framework).

---

### Pitfall: Putting framework imports in domain or application

**Symptom:** Domain/application code depends on React, Vue, or Angular; harder to test and reuse.

**Solution:** Keep `caf/domain` and `caf/application` free of framework and HTTP/GraphQL imports. Only `caf/infrastructure` (and your app shell) should import from React, Vue, Angular, Axios, etc. See [Best Practices — Folder structure](BEST_PRACTICES.md#1-folder-structure-best-practices).

---

### Pitfall: UseCase returning data without RequestResult

**Symptom:** Hooks or Plocs expect `loading`/`data`/`error` but get a raw value; type errors or missing loading state.

**Solution:** Use cases must return `Promise<RequestResult<T>>` with `loading`, `data`, and `error` (each a Pulse). Use `pulse()` from `@c-a-f/core` and set `.value` on each. See [@c-a-f/core README](../../packages/core/README.md) and the UseCase example above.

---

### Pitfall: Expecting CAFErrorBoundary to catch async errors

**Symptom:** Rejected promises (e.g. from UseCase) don’t show the error boundary UI.

**Solution:** Error boundaries only catch errors during render and in lifecycle methods. Handle async errors in the UI (check `error` from `useUseCase` or from Ploc state) and optionally call an error reporter. Use the boundary for sync/render errors; use loading/error state for async.

---

### Pitfall: Nested CAFProvider overwriting parent keys

**Symptom:** Child component gets `undefined` for `usePlocFromContext('user')` when nested under a second `CAFProvider`.

**Solution:** Inner provider does not merge with outer; it replaces. Either use a single root `CAFProvider` with all Plocs/UseCases, or ensure the nested tree only uses keys provided by the inner provider. Prefer one root provider with all keys.

---

### Pitfall: Using the wrong key for usePlocFromContext

**Symptom:** `usePlocFromContext('user')` returns `undefined` or the wrong Ploc.

**Solution:** The key must match exactly what you passed to `CAFProvider`: `plocs={{ user: userPloc }}` → `usePlocFromContext('user')`. Use constants for keys (e.g. `export const PLOC_USER = 'user'`) to avoid typos.

---

### Pitfall: Testing components without providing CAF context

**Symptom:** “Cannot read property 'subscribe' of undefined” or “context is null” in tests.

**Solution:** Wrap the component under test with the same provider you use in the app. Use `renderWithCAF` (React), `mountWithCAF` (Vue), or `provideTestingCAF` (Angular) from `@c-a-f/testing` and pass `plocs` and `useCases`. See [Best Practices — Testing](BEST_PRACTICES.md#4-testing-strategies) and [@c-a-f/testing README](../../packages/testing/README.md).

---

## Summary

| Goal                    | Action |
|-------------------------|--------|
| **Redux → CAF**         | Map slice to Ploc, thunks to UseCases; provide Plocs via CAFProvider; use usePlocFromContext + usePloc. |
| **Zustand → CAF**       | Map store to Ploc (or Pulse); provide via CAFProvider; replace useStore with usePlocFromContext + usePloc. |
| **React Query → CAF**    | Map query/mutation to UseCase; use useUseCase for loading/data/error; add caching in infrastructure if needed. |
| **Add CAF gradually**   | Add caf/ and one feature at a time; keep existing state/query; coexist then remove old code. |
| **Avoid pitfalls**      | Stable Ploc/UseCase references; unsubscribe or use hooks; keep domain/application free of framework; return RequestResult; handle async errors in UI; use testing helpers. |

For more patterns, see [Best Practices](BEST_PRACTICES.md) and the [ADR index](adr/README.md).
