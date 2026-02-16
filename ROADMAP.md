# CAF — Clean Architecture Frontend: Roadmap

## Vision

CAF is a **core** that you can use to implement whatever you want using **implementable interfaces** that are compatible with **any frontend library** that exists today or may appear tomorrow.

To achieve that:

- **Pulse** — A proxy-based reactive primitive (like refs/reactive in Vue core). It gives the core a single, framework-agnostic way to hold state and notify subscribers, so any UI layer (React, Vue, Angular, or future frameworks) can bind to it.
- **Request** — Every frontend has a connection with the server. The core defines interfaces and a default implementation (e.g. loading/data/error as Pulse-backed values) so infrastructure can plug in any HTTP or transport.
- **Routing** — Every frontend has routing. The core defines a routing interface (e.g. current route, change route) so each framework implements it once; application and domain code depend only on the interface.

**Goal:** This core can be a **library** (primitives + interfaces + optional default implementations). With conventions and a thin app shell, it can grow into a small **framework**. The same domain and use cases can run in React, Vue, Angular, or a future framework by swapping adapters.

---

## Current state vs vision

| Piece | Status |
|-------|--------|
| **Pulse** | Implemented: proxy, `.value`, subscribe/unsubscribe, no notify when value unchanged. Used inside `ApiRequest` and tested. |
| **Ploc** | Abstract state container with subscribe/changeState. Used in example-domain. Can be unified with Pulse later (e.g. Ploc built on Pulse) or kept as a second primitive with clear “when to use which” docs. |
| **Request** | `IRequest`, `RequestResult` (Pulse-based loading/data/error), `ApiRequest`. Fits “connection with server”; framework-agnostic. |
| **Routing** | `RouteRepository` + `RouteManager` in core. React and Vue infra implement `RouteRepository`. Angular currently uses a different interface (`IRouteManager`) not aligned with core — should be unified. |
| **UseCase** | Interface returning `Promise<RequestResult<T>>`; use cases depend only on core types. |

**Gaps to close so the codebase matches the vision:**

- Unify **routing**: Angular should implement the same `RouteRepository` (or a single routing interface defined in core) so all frameworks speak one contract.
- Fix **React routing**: `RouteHandler` must not call `useNavigate`/`useLocation` inside a class constructor (breaks rules of hooks). Use a hook that returns an object implementing `RouteRepository` and pass it into `RouteManager`.
- **Pulse vs Ploc**: Either build Ploc on top of Pulse (one reactive engine) or document when to use Pulse (single value) vs Ploc (stateful bloc).
- **Core cleanups**: Remove debug code (e.g. `this.loading.subscribe(console.log)` in `ApiRequest`); tidy `onSuccess` in `ApiRequest.mutate`.
- **Request interface (optional):** Consider an `IRequestHandler` (or similar) interface so `ApiRequest` is one implementation and others (mock, cached) can be swapped without tying core to one implementation.

---

## Scope

- **In scope:** `@caf/core` as the framework-agnostic library (Pulse, Ploc, UseCase, RouteRepository, RouteManager, IRequest, ApiRequest, RequestResult). Publish, version, document. Optional infrastructure adapters per framework.
- **Out of scope (for v1):** Extracting React UI into a separate package; that can be Phase 5+.
- **Decision:** Keep this repo as the “reference app” that consumes the published packages (the repo both develops and demos the library).

---

## Phase 1 — Core as a domain-agnostic library

**Goal:** `@caf/core` exports only reusable primitives and interfaces. No User/Login (or any app-specific domain) in the core package.

| # | Task | Notes |
|---|------|--------|
| 1.1 | **Define the public API** | ✅ Done. See [docs/API.md](docs/API.md). Exports: `UseCase`, `Ploc`, `Pulse`, `pulse`, `ApiRequest`, `RouteManager`/`RouteRepository`/`RouteManagerAuthOptions`, `RequestResult`, `IRequest`. |
| 1.2 | **Move example domain out of core** | ✅ Done. `packages/example-domain` exists with `User`, `Login`, `IUserRepository`, `ILoginRepository`, `UserService`, `LoginService`, and use cases (`LoginUser`, `LogoutUser`, `GetUsers`, `AddUsers`). Core keeps only `domain/shared` and `application/shared`. Root scripts: `example-domain:build`, `example-domain:serve`. |
| 1.3 | **Wire example-domain into infra and apps** | ✅ Done. `@caf/infrastructure` (shared), `@caf/infrastructure-react`, `@caf/infrastructure-vue`, and `@caf/infrastructure-angular` depend on `@caf/example-domain`. Vue, React, and Angular presentation depend on `@caf/example-domain` and import `Login`, `ILoginUseCase`, etc. from it. Core has no dependency on example-domain. |
| 1.4 | **Fix core leaks** | Remove or abstract any browser/API specifics from core (e.g. `localStorage`, axios response shape). If “save token” is needed for the example, it belongs in example-domain or infrastructure, not core. |
| 1.5 | **Typo and small cleanups** | Rename `saveTokenToLocaleStorage` → `saveTokenToLocalStorage` (and any similar). |
| 1.6 | **Version and entrypoint** | Ensure `@caf/core` has a single clear entrypoint (`main`/`module`/`types` in package.json) and a **0.x or 1.0.0** version for first publish. |

**Exit criteria:** Building the repo works; core has zero app-specific domain; public API is documented and minimal.

---

## Phase 2 — Align with vision (routing, Pulse, cleanups)

**Goal:** All frameworks use the same core interfaces; no hooks in constructors; core is clean and consistent.

| # | Task | Notes |
|---|------|--------|
| 2.1 | **Unify routing interface** | Define in core a single routing contract (e.g. `RouteRepository`: `currentRoute`, `change(route)`). Ensure Angular implements this same interface (or an adapter that wraps Angular Router) so `RouteManager` from core works everywhere. |
| 2.2 | **Fix React RouteHandler** | Do not call `useNavigate`/`useLocation` inside a class constructor. Provide a hook (e.g. `useRouteRepository()`) that returns an object implementing `RouteRepository`; pass that into `RouteManager` or app bootstrap. |
| 2.3 | **Pulse vs Ploc** | Either implement Ploc on top of Pulse (one reactive primitive) or document clearly: “Use Pulse for a single reactive value; use Ploc for a stateful bloc with structured state.” |
| 2.4 | **Core cleanups** | Remove `this.loading.subscribe(console.log)` from `ApiRequest` constructor. Simplify `onSuccess` handling in `ApiRequest.mutate` (e.g. `options?.onSuccess?.(this.data.value)` after success). |

**Exit criteria:** React, Vue, and Angular all use the same routing abstraction from core; core has no debug code and a clear story for Pulse/Ploc.

---

## Phase 3 — Package metadata and build

**Goal:** Each publishable package has correct `package.json` and a production build suitable for npm.

| # | Task | Notes |
|---|------|--------|
| 3.1 | **Publishable package.json** | For `@caf/core` (and later infra packages): set `"name"`, `"version"`, `"description"`, `"keywords"`, `"license"`, `"repository"`, `"main"`, `"module"`, `"types"`, `"files"` (e.g. `["*.js", "*.d.ts", ".build"]` or the actual output dir). Prefer not publishing as `"private": true` for packages you intend to publish. |
| 3.2 | **Build output** | Core already uses `tsc` → `.build`. Ensure output is **consumable** (ESM or CJS as desired; types included). Add a `prepublishOnly` script that runs `build` so `npm publish` always ships a fresh build. |
| 3.3 | **Root vs package versioning** | Decide: either (a) root `package.json` version is the “monorepo version” and each package has its own version, or (b) all packages share one version. For a library, per-package versioning is common. |
| 3.4 | **.npmignore or "files"** | Prevent shipping source, tests, and config files; only ship `.build` (or dist) and `package.json`. Use the `"files"` field in package.json for clarity. |

**Exit criteria:** `npm pack` (or `yarn pack`) for `@caf/core` produces a tarball that contains only what consumers need; another project can `npm install ./caf-core-0.1.0.tgz` and use it.

---

## Phase 4 — Publishing and registry

**Goal:** Publish `@caf/core` to a registry and consume it from this repo (or a test project).

| # | Task | Notes |
|---|------|--------|
| 4.1 | **Choose registry** | npm (public), or private (e.g. GitHub Packages, Verdaccio, GitLab npm, or your existing `nadindev.ir`). If scoped (`@caf/core`), ensure scope is configured (e.g. `npm config set @caf:registry ...` for private). |
| 4.2 | **First publish** | Run `yarn build` (or equivalent) in core, then from `packages/core`: `npm publish --access public` (or appropriate flags). Start with a pre-1.0 version (e.g. `0.1.0`) to signal early stage. |
| 4.3 | **Consume from registry (optional)** | In this monorepo you can keep using workspaces; for validation, create a small external app and install `@caf/core` from the registry to confirm install and types work. |
| 4.4 | **Changelog** | Add a `CHANGELOG.md` at repo root (or per package). Document what’s in v0.1.0 (e.g. “Initial release: UseCase, Ploc, Pulse, ApiRequest, RouteManager”). |

**Exit criteria:** `@caf/core` is installable via `npm install @caf/core` (or your registry URL); changelog exists.

---

## Phase 5 — Documentation and DX

**Goal:** New users can understand what CAF is, how to install it, and how to use the primitives.

| # | Task | Notes |
|---|------|--------|
| 5.1 | **README for core** | In `packages/core/README.md`: one-line description, install command, minimal “Usage” with a tiny example (e.g. defining a UseCase and a Ploc). Link to main repo README for full architecture explanation. |
| 5.2 | **Root README** | Expand `README.md`: “What is CAF”, “Vision” (core + interfaces + Pulse + request + routing, any frontend), “Packages” (core vs example vs apps), “Getting started” (install + link to core README), “Architecture” (domain / application / infrastructure), “Development” (how to run this repo). Optional: simple diagram (e.g. layers + dependency direction). |
| 5.3 | **API surface** | Document the public API (list of exports and their types). Can live in core README, or in `docs/API.md`, or generated (e.g. TypeDoc) later. |
| 5.4 | **Example / demo** | This repo’s apps (React/Vue/Angular) already serve as the “example”. In README, add a short “Example” section that points to this repo and the example-domain package. |

**Exit criteria:** A new developer can read the README(s), install `@caf/core`, and implement a minimal UseCase/Ploc flow without reading the repo source.

---

## Phase 6 — Optional: Infrastructure as separate packages

**Goal:** Publish optional adapter packages so consumers can use official implementations of RouteManager and HTTP.

| # | Task | Notes |
|---|------|--------|
| 6.1 | **Split infrastructure** | Optionally split `@caf/infrastructure` into e.g. `@caf/infrastructure-axios` (HTTP/repositories) and keep framework-specific route managers as `@caf/infrastructure-react`, `@caf/infrastructure-vue`, `@caf/infrastructure-angular`. Each has its own package.json and version. |
| 6.2 | **Publish and document** | Same as Phase 3–5: build, `files`, README, publish. Document in root README: “Official adapters: …”. |
| 6.3 | **Example-domain dependency** | Example-domain (or demo app) depends on core + these infra packages; no need to publish example-domain unless you want a “starter kit” package. |

**Exit criteria:** Consumers can `npm install @caf/core @caf/infrastructure-react` (and optionally axios adapter) and use them in their own app.

---

## Phase 7 — Future library features (backlog)

Api, Validation, Permission, I18n, Workflow can become **optional library packages** or **patterns documented in the repo**:

| # | Topic | Suggestion |
|---|--------|------------|
| 7.1 | **Api** | Already partially in infra (Axios). Could become `@caf/infrastructure-axios` + a small “API client” helper in core (e.g. request/response DTO conventions). |
| 7.2 | **Validation** | Either a thin `@caf/validation` (schema-agnostic interfaces + maybe a small runner) or “how to plug Zod/Yup” in docs. |
| 7.3 | **Permission** | Define in core: interfaces (e.g. `IPermissionChecker`); implement in infra or app. Optional small package later. |
| 7.4 | **I18n** | Same: core interfaces for “translate(key)”; implement in infra (e.g. i18next). Document in README or separate package later. |
| 7.5 | **Workflow** | If you mean state machines or multi-step flows, could be a small package on top of Ploc/Pulse or a separate primitive. |
| 7.6 | **Request interface** | Optional: formalize `IRequestHandler` (or similar) so `ApiRequest` is one implementation; mocks or cached implementations can be swapped without tying core to one. |

No commitment to implement all in v1; keep as a backlog and decide per item whether it’s core, optional package, or docs-only.

---

## Checklist summary

- [ ] **Phase 1:** Core domain-agnostic; example domain moved out; API documented.
- [ ] **Phase 2:** Routing unified across frameworks; React RouteHandler fixed; Pulse/Ploc decided; core cleanups done.
- [ ] **Phase 3:** package.json and build ready for publish; `npm pack` works.
- [ ] **Phase 4:** Published to registry; changelog present.
- [ ] **Phase 5:** README(s) and minimal usage docs done.
- [ ] **Phase 6:** (Optional) Infrastructure packages split and published.
- [ ] **Phase 7:** (Backlog) Api / Validation / Permission / I18n / Workflow / Request interface as needed.

---

## Suggested order

1. Do **Phase 1** first (core clean + example extracted).
2. Then **Phase 2** (align with vision: routing, React fix, Pulse/Ploc, cleanups).
3. Then **Phase 3** (build + package.json).
4. Then **Phase 4** (publish).
5. Then **Phase 5** (docs).
6. Add **Phase 6** when you want official adapters as separate packages.
7. Use **Phase 7** as a backlog and tick off when you add those features.
