# ADR-001: The `caf/` folder structure

## Status

Accepted.

## Context

Applications built with CAF need a clear place for Clean Architecture layers (domain, application, infrastructure) that:

1. Is **easy to find** and **consistent** across projects (React, Vue, Angular, etc.).
2. **Keeps framework and app shell separate** from business logic so the same `caf/` content can be reused or tested in isolation.
3. **Avoids naming clashes** with app-specific folders (e.g. `src/components`, `src/views`) and makes it obvious which code is “CAF-style” layered logic.
4. **Supports tooling** (e.g. CLI init, path aliases) with a single, predictable root folder.

Without a dedicated folder, domain/application/infrastructure code tends to scatter (e.g. next to components or inside `src/lib`), making dependency rules and onboarding harder.

## Decision

We adopt a **single root folder named `caf/`** at the application root (e.g. `src/caf/` or project root `caf/`) that contains:

- **`caf/domain/`** — Entities, repository interfaces (`I*Repository`), and domain services. No framework or infrastructure imports.
- **`caf/application/`** — Use cases (commands/queries), Plocs, and application-level types. Depends only on domain and `@c-a-f/core` (or equivalent); no UI or transport specifics.
- **`caf/infrastructure/`** — Implementations of domain/application interfaces: HTTP repos, GraphQL clients, WebSocket clients, validation adapters (Zod, Yup), etc. This is where framework and external APIs are plugged in.

Optional:

- **`caf/setup.ts`** (or equivalent) — Composition root: wires repositories, use cases, and Plocs and exposes a single entry (e.g. `setupUserPloc()`) for the app to use.
- **`caf/index.ts`** — Re-exports domain, application, and infrastructure (and optionally setup) so the app can import from `caf/` or `@/caf/`.

The name **`caf/`** is short, unique, and tied to the library so it’s clear this folder follows CAF conventions. Each example app (React, Vue, Angular, GraphQL, WebSocket) uses the same structure so developers can copy-paste and adapt.

## Consequences

**Positive:**

- One predictable place for all CAF-style layers; easier onboarding and documentation.
- Clear dependency direction: domain ← application ← infrastructure; easier to enforce with lint or reviews.
- Same structure across frameworks; examples and guides can refer to `caf/domain`, `caf/application`, `caf/infrastructure` without framework-specific paths.
- CLI and tooling can assume `caf/` exists and generate files there (e.g. `caf generate usecase GetUser`).

**Negative:**

- One more top-level concept (“the caf folder”); teams must learn the convention.
- Path depth increases (e.g. `caf/application/User/Ploc/UserPloc.ts`); path aliases (e.g. `@caf/domain`) are recommended.

**Mitigations:**

- Document the structure in the main README and in a dedicated “Project structure” or “Best practices” doc.
- Provide `caf-init` (or equivalent) that creates `caf/` with sample domain, application, and infrastructure so the layout is visible from day one.
