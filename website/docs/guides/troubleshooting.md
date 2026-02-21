---
title: Troubleshooting
---

# CAF Troubleshooting Guide

Quick fixes for common errors, performance, TypeScript, and testing.

## Common errors

### "Cannot read property 'subscribe' of undefined"

**Cause:** `usePlocFromContext('key')` returned `undefined` (wrong key or outside CAFProvider).

**Fix:** Ensure the component is inside `CAFProvider` with that key (e.g. `plocs={{ user: userPloc }}` → `usePlocFromContext('user')`). Guard: `if (!ploc) return null;` before `usePloc(ploc)`.

### "Can't perform a React state update on an unmounted component"

**Cause:** Subscription still active after unmount.

**Fix:** Use **usePloc** / **useUseCase** (they unsubscribe). If you subscribe manually, unsubscribe in `useEffect` cleanup.

### Error boundary doesn't catch async errors

**Cause:** Error boundaries only catch render and lifecycle errors, not rejected promises.

**Fix:** Handle async errors in the UI with `error` from `useUseCase` or Ploc state. Use the boundary for sync/render errors only.

### useUseCase never updates

**Cause:** UseCase must return `Promise<RequestResult<T>>` with Pulse-backed `loading`, `data`, `error`.

**Fix:** Return an object with `loading`, `data`, `error` (each from `pulse(...)`) and set their `.value` in the UseCase.

## Performance

- **Too many re-renders** — Stable Ploc/UseCase references; React.memo; smaller Plocs.
- **Memory growth** — Rely on usePloc/useUseCase cleanup; unsubscribe manually if needed.

## TypeScript

- **Lost types** — Use generics: `usePlocFromContext<UserPloc>('user')`, `useUseCaseFromContext<[Arg], Result>('key')`.
- **Path alias not resolving** — Set `paths` in `tsconfig.json` and your bundler’s `resolve.alias`.

## Testing

- **subscribe of undefined in tests** — Use `renderWithCAF` (React), `mountWithCAF` (Vue), or `provideTestingCAF` (Angular) with `plocs` and `useCases`.
- **Mock UseCase** — Use `createMockUseCaseSuccess` / `createErrorResult` from `@c-a-f/testing`; await and use `waitFor` / `waitForPlocState` for async updates.

Full details: [TROUBLESHOOTING](https://github.com/ialiaslani/caf/blob/main/docs/TROUBLESHOOTING.md) in the repo.
