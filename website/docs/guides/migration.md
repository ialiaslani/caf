---
title: Migration Guides
---

# CAF Migration Guides

How to migrate from Redux, Zustand, or React Query, or add CAF incrementally to an existing project.

## Overview

| From | CAF equivalent |
|------|----------------|
| **Redux** | Ploc (state) + UseCase (async); CAFProvider; usePlocFromContext + usePloc |
| **Zustand** | Ploc or Pulse; CAFProvider; usePlocFromContext + usePloc |
| **React Query** | UseCase + useUseCase (loading/data/error); optional cache in infrastructure |
| **Existing app** | Add `caf/`, migrate one feature at a time; coexist with current state |

## Redux → CAF

- **Store/slice** → One or more **Plocs**.
- **Actions** → **Ploc methods** (sync) or **UseCase** (async).
- **Thunks/sagas** → **UseCase** returning `RequestResult<T>`.
- **useSelector/useDispatch** → **usePlocFromContext** + **usePloc**; call `ploc.method()`.

## Zustand → CAF

- **Store** → **Ploc** (structured state) or **Pulse** (single value).
- **Actions** → **Ploc methods** or **UseCase**.
- **useStore** → **usePlocFromContext** + **usePloc**.

## React Query → CAF

- **useQuery** → **UseCase** + **useUseCase** (or Ploc that calls the UseCase). You get loading/data/error from the hook.
- **useMutation** → **UseCase** + **useUseCase**; call `execute(args)` on submit.
- **Caching**: CAF has no built-in server cache; refetch by re-executing the UseCase, or implement cache in infrastructure, or keep React Query for some data.

## Adding CAF to an existing project

1. Install `@c-a-f/core` and your framework adapter.
2. Create `caf/domain`, `caf/application`, `caf/infrastructure` and `caf/setup.ts`.
3. Migrate **one feature** first: define domain, UseCase, Ploc, repository.
4. Add **CAFProvider** at root with that feature’s Ploc; switch one screen to use `usePlocFromContext` / `usePloc`.
5. Coexist with Redux/Zustand/React Query; remove the old code for that feature when done.
6. Repeat for the next feature.

For **common pitfalls** (e.g. creating Ploc on every render, wrong key, testing without context), see [Troubleshooting](/docs/guides/troubleshooting) and the [MIGRATION](https://github.com/ialiaslani/caf/blob/main/docs/MIGRATION.md) file in the repo.
