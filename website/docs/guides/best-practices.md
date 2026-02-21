---
title: Best Practices
---

# CAF Best Practices Guide

Recommended patterns: folder structure, dependency injection, error handling, testing, and performance.

## 1. Folder structure best practices

Use a dedicated **`caf/`** folder. See [ADR-001: The caf/ folder structure](/docs/architecture/adr-001-folder-structure) for the rationale.

### Do

- **Keep all CAF-style code under `caf/`** — Use `caf/domain/`, `caf/application/`, `caf/infrastructure/`.
- **Respect dependency direction** — domain (no framework); application (domain + core only); infrastructure (implements interfaces).
- **Group by feature** — e.g. `caf/domain/User/`, `caf/application/User/`, `caf/infrastructure/api/User/`.
- **Use a composition root** — `caf/setup.ts` that wires repositories, use cases, and Plocs.
- **Re-export via `caf/index.ts`** — So the app can use path aliases like `@caf/domain`.

### Don't

- Don't put framework or UI code inside `caf/`.
- Don't import infrastructure into domain, or application into domain.
- Don't scatter CAF logic outside `caf/`.

### Path aliases

```json
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

## 2. Dependency injection patterns

Use **constructor injection** and **composition at the root**.

1. In `caf/setup.ts`, create repositories, use cases, and Plocs.
2. Wrap the app with **CAFProvider** and pass `plocs` and `useCases`.
3. In components, use `usePlocFromContext('user')` and `useUseCaseFromContext('createUser')`.

Create Plocs and UseCases **once** (in setup or with `useMemo`); avoid `new UserPloc()` on every render.

## 3. Error handling patterns

- **UseCase**: Return `RequestResult<T>` (loading, data, error). In the UI, use `useUseCase` and show loading/error states.
- **Ploc**: Optionally hold an `error` field in state; keep one source of truth.
- **CAFErrorBoundary** (React): Catches **synchronous** render/lifecycle errors. Use for fallback UI and "Try again". Handle **async** errors via `error` from `useUseCase` or Ploc state.
- Normalize errors (e.g. `normalizeApiError` from core) in one place.

## 4. Testing strategies

- **Unit**: Test Ploc and UseCase with mocks (`createMockPloc`, `createMockUseCaseSuccess`, `createMockRepository`).
- **Integration**: Use `renderWithCAF` (React), `mountWithCAF` (Vue), or `provideTestingCAF` (Angular) with `plocs` and `useCases`; use `createTestPloc` and `mockUseCase`.
- Test domain, application, infrastructure, and UI with the same provider pattern as the app.

## 5. Performance optimization

- Prefer **usePloc** and **useUseCase** (they clean up subscriptions).
- Keep **Ploc/UseCase references stable** (setup or `useMemo`).
- Minimize state; use React.memo or smaller Plocs if re-renders are an issue.

For full detail, see the [BEST_PRACTICES](https://github.com/ialiaslani/caf/blob/main/docs/BEST_PRACTICES.md) file in the repo.
