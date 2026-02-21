---
title: ADR-001 — The caf/ folder structure
---

# ADR-001: The `caf/` folder structure

## Status

Accepted.

## Context

Applications built with CAF need a clear place for Clean Architecture layers (domain, application, infrastructure) that:

1. Is **easy to find** and **consistent** across projects (React, Vue, Angular, etc.).
2. **Keeps framework and app shell separate** from business logic so the same `caf/` content can be reused or tested in isolation.
3. **Avoids naming clashes** with app-specific folders (e.g. `src/components`, `src/views`) and makes it obvious which code is "CAF-style" layered logic.
4. **Supports tooling** (e.g. CLI init, path aliases) with a single, predictable root folder.

Without a dedicated folder, domain/application/infrastructure code tends to scatter, making dependency rules and onboarding harder.

## Decision

We adopt a **single root folder named `caf/`** that contains:

- **`caf/domain/`** — Entities, repository interfaces (`I*Repository`), and domain services. No framework or infrastructure imports.
- **`caf/application/`** — Use cases (commands/queries), Plocs, and application-level types. Depends only on domain and `@c-a-f/core`.
- **`caf/infrastructure/`** — Implementations: HTTP repos, GraphQL clients, WebSocket clients, validation adapters (Zod, Yup), etc.

Optional: **`caf/setup.ts`** (composition root) and **`caf/index.ts`** (re-exports).

## Consequences

**Positive:** One predictable place; clear dependency direction; same structure across frameworks; CLI and tooling can assume `caf/` exists.

**Negative:** One more top-level concept; path depth (use path aliases like `@caf/domain`).

**Mitigations:** Document in README and Best practices; provide `caf-init` that creates the folder structure.
