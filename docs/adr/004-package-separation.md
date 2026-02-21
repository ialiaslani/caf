# ADR-004: Package separation (monorepo and scoped packages)

## Status

Accepted.

## Context

CAF aims to be **framework-agnostic** and **layered**: domain and application logic should not depend on React, Vue, Angular, or a specific HTTP/GraphQL client. We need a packaging strategy that:

1. Keeps **core primitives and interfaces** in one place so they can be used by any framework and by other CAF packages.
2. Allows **framework-specific code** (hooks, composables, services) to live in separate packages so React apps don’t pull in Vue or Angular (and vice versa).
3. Supports **optional features** (validation, i18n, permission, workflow, devtools) without bloating the core.
4. Enables **versioning and publishing** per package (e.g. `@c-a-f/core` vs `@c-a-f/infrastructure-react`) so consumers can upgrade only what they use.

## Decision

We use a **monorepo** with **multiple npm packages** under the scope **`@c-a-f`**:

### Core and shared (framework-agnostic)

- **`@c-a-f/core`** — Primitives (UseCase, Ploc, Pulse, ApiRequest), interfaces (RouteRepository, IRequest, etc.), and RouteManager. No dependency on React, Vue, or Angular. This is the single source of truth for “what CAF is” at the primitive level.
- **`@c-a-f/validation`** — Validation interfaces and optional adapters (e.g. Zod, Yup); used by application layer, no UI dependency.
- **`@c-a-f/workflow`** — Workflow/state machine utilities built on Ploc; framework-agnostic.
- **`@c-a-f/permission`** — Permission interfaces and adapters (RBAC, CASL, etc.); framework-agnostic.
- **`@c-a-f/i18n`** — i18n interfaces and adapters; framework-agnostic.
- **`@c-a-f/devtools`** — DevTools protocol or utilities that infrastructure packages can plug into; no direct dependency on a specific UI framework in the core devtools package.

### Infrastructure (per-framework)

- **`@c-a-f/infrastructure-react`** — React hooks (`usePloc`, `useUseCase`), `CAFProvider`, `CAFErrorBoundary`, `useRouteManager`, `useRouteRepository`, DevTools integration. Depends on `@c-a-f/core` (and optionally validation, devtools).
- **`@c-a-f/infrastructure-vue`** — Vue composables and components; same idea as React.
- **`@c-a-f/infrastructure-angular`** — Angular services and injectors (`RouteHandler`, `injectRouteRepository`, `injectRouteManager`); same idea.

### Optional / tooling

- **`@c-a-f/testing`** — Test helpers (mock Ploc, mock UseCase, mock repository, `renderWithCAF`, etc.) for unit and integration tests.
- **`@c-a-f/cli`** — CLI for init, generate, etc.; not required at runtime.

### Examples (not published)

- Example apps (e.g. `example-react`, `example-vue-graphql`, `example-angular-websocket`) live in the monorepo and each contain their own `caf/` folder; they depend on `@c-a-f/core` and the relevant infrastructure package. They are not published to npm.

Dependency rules:

- **Core** does not depend on any infrastructure or framework package.
- **Infrastructure** packages depend only on `@c-a-f/core` (and optionally validation, devtools, etc.), not on each other.
- **Examples** depend on core + one (or more) infrastructure packages.

## Consequences

**Positive:**

- Clear separation: core stays small and stable; framework-specific code is isolated and can evolve per framework.
- Consumers install only what they need (e.g. `@c-a-f/core` + `@c-a-f/infrastructure-react`), avoiding Vue/Angular in a React app.
- Optional features (validation, i18n, permission, workflow) can be added without forcing them on every user.
- Independent versioning: we can bump `@c-a-f/infrastructure-react` without touching `@c-a-f/core` when only React bindings change.
- Monorepo simplifies cross-package refactors and shared tooling (build, lint, test).

**Negative:**

- More packages to maintain and publish; we mitigate with scripts and CI that build/test/publish all packages.
- Version alignment: we document which versions of core and infrastructure are compatible (e.g. in README or a compatibility matrix).
- Discovery: we document the full list of packages and their roles in the main README and in the docs.

**References:**

- Repository layout: `packages/core`, `packages/infrastructure-react`, `packages/infrastructure-vue`, `packages/infrastructure-angular`, `packages/validation`, `packages/testing`, `packages/cli`, etc.
- Main README: “Packages” section and installation instructions per framework.
