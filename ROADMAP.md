# CAF → Publishable Package: Roadmap

Turn CAF from a monorepo template into a **publishable frontend library** that others can install via npm (or a private registry).

---

## Scope

- **In scope:** `@caf/core` (architecture primitives) + optional infrastructure adapters. Publish, version, document.
- **Out of scope (for v1):** Extracting React UI into a separate package; that can be Phase 5+.
- **Decision:** Keep this repo as the “reference app” that consumes the published packages (so the repo both develops and demos the library).

---

## Phase 1 — Core as a domain-agnostic library

**Goal:** `@caf/core` exports only reusable primitives and interfaces. No User/Login (or any app-specific domain) in the core package.

| # | Task | Notes |
|---|------|--------|
| 1.1 | **Define the public API** | List exactly what `@caf/core` will export: `UseCase`, `Ploc`, `Pulse`, `pulse`, `ApiRequest`, `RouteManager`/`RouteRepository`, `RequestResult`, `IRequest`. Document in a `docs/API.md` or in README. |
| 1.2 | **Move example domain out of core** | Create a new workspace package, e.g. `packages/example-domain` (or `packages/demo`), and move there: `User`, `Login`, `IUserRepository`, `ILoginRepository`, `UserService`, `LoginService`, and all application use cases (`LoginUser`, `LogoutUser`, `GetUsers`, `AddUser`). Core only keeps shared primitives under `domain/shared` and `application/shared`. |
| 1.3 | **Wire example-domain into infra and apps** | Update `@caf/infrastructure` and presentation packages to depend on `@caf/example-domain` (or the chosen name) for User/Login types and use cases. Core stays dependency-free. |
| 1.4 | **Fix core leaks** | Remove or abstract any browser/API specifics from core (e.g. `localStorage`, axios response shape). If “save token” is needed for the example, it belongs in example-domain or infrastructure, not core. |
| 1.5 | **Typo and small cleanups** | Rename `saveTokenToLocaleStorage` → `saveTokenToLocalStorage` (and any similar). |
| 1.6 | **Version and entrypoint** | Ensure `@caf/core` has a single clear entrypoint (`main`/`module`/`types` in package.json) and a **0.x or 1.0.0** version for first publish. |

**Exit criteria:** Building the repo works; core has zero app-specific domain; public API is documented and minimal.

---

## Phase 2 — Package metadata and build

**Goal:** Each publishable package has correct `package.json` and a production build suitable for npm.

| # | Task | Notes |
|---|------|--------|
| 2.1 | **Publishable package.json** | For `@caf/core` (and later infra packages): set `"name"`, `"version"`, `"description"`, `"keywords"`, `"license"`, `"repository"`, `"main"`, `"module"`, `"types"`, `"files"` (e.g. `["*.js", "*.d.ts", ".build"]` or the actual output dir). Prefer not publishing as `"private": true` for packages you intend to publish. |
| 2.2 | **Build output** | Core already uses `tsc` → `.build`. Ensure output is **consumable** (ESM or CJS as desired; types included). Add a `prepublishOnly` script that runs `build` so `npm publish` always ships a fresh build. |
| 2.3 | **Root vs package versioning** | Decide: either (a) root `package.json` version is the “monorepo version” and each package has its own version, or (b) all packages share one version. For a library, per-package versioning is common. |
| 2.4 | **.npmignore or "files")** | Prevent shipping source, tests, and config files; only ship `.build` (or dist) and `package.json`. Use the `"files"` field in package.json for clarity. |

**Exit criteria:** `npm pack` (or `yarn pack`) for `@caf/core` produces a tarball that contains only what consumers need; another project can `npm install ./caf-core-0.1.0.tgz` and use it.

---

## Phase 3 — Publishing and registry

**Goal:** Publish `@caf/core` to a registry and consume it from this repo (or a test project).

| # | Task | Notes |
|---|------|--------|
| 3.1 | **Choose registry** | npm (public), or private (e.g. GitHub Packages, Verdaccio, GitLab npm, or your existing `nadindev.ir`). If scoped (`@caf/core`), ensure scope is configured (e.g. `npm config set @caf:registry ...` for private). |
| 3.2 | **First publish** | Run `yarn build` (or equivalent) in core, then from `packages/core`: `npm publish --access public` (or appropriate flags). Start with a pre-1.0 version (e.g. `0.1.0`) to signal early stage. |
| 3.3 | **Consume from registry (optional)** | In this monorepo you can keep using workspaces; for validation, create a small external app and install `@caf/core` from the registry to confirm install and types work. |
| 3.4 | **Changelog** | Add a `CHANGELOG.md` at repo root (or per package). Document what’s in v0.1.0 (e.g. “Initial release: UseCase, Ploc, Pulse, ApiRequest, RouteManager”). |

**Exit criteria:** `@caf/core` is installable via `npm install @caf/core` (or your registry URL); changelog exists.

---

## Phase 4 — Documentation and DX

**Goal:** New users can understand what CAF is, how to install it, and how to use the primitives.

| # | Task | Notes |
|---|------|--------|
| 4.1 | **README for core** | In `packages/core/README.md`: one-line description, install command, minimal “Usage” with a tiny example (e.g. defining a UseCase and a Ploc). Link to main repo README for full architecture explanation. |
| 4.2 | **Root README** | Expand `README.md`: “What is CAF”, “Packages” (core vs example vs apps), “Getting started” (install + link to core README), “Architecture” (domain / application / infrastructure), “Development” (how to run this repo). Optional: simple diagram (e.g. layers + dependency direction). |
| 4.3 | **API surface** | Document the public API (list of exports and their types). Can live in core README, or in `docs/API.md`, or generated (e.g. TypeDoc) later. |
| 4.4 | **Example / demo** | This repo’s apps (React/Vue/Angular) already serve as the “example”. In README, add a short “Example” section that points to this repo and the example-domain package. |

**Exit criteria:** A new developer can read the README(s), install `@caf/core`, and implement a minimal UseCase/Ploc flow without reading the repo source.

---

## Phase 5 — Optional: Infrastructure as separate packages

**Goal:** Publish optional adapter packages so consumers can use official implementations of RouteManager and HTTP.

| # | Task | Notes |
|---|------|--------|
| 5.1 | **Split infrastructure** | Optionally split `@caf/infrastructure` into e.g. `@caf/infrastructure-axios` (HTTP/repositories) and keep framework-specific route managers as `@caf/infrastructure-react`, `@caf/infrastructure-vue`, `@caf/infrastructure-angular`. Each has its own package.json and version. |
| 5.2 | **Publish and document** | Same as Phase 2–4: build, `files`, README, publish. Document in root README: “Official adapters: …”. |
| 5.3 | **Example-domain dependency** | Example-domain (or demo app) depends on core + these infra packages; no need to publish example-domain unless you want a “starter kit” package. |

**Exit criteria:** Consumers can `npm install @caf/core @caf/infrastructure-react` (and optionally axios adapter) and use them in their own app.

---

## Phase 6 — Future library features (from Todo)

Your `Todo.md` lists: Api, Validation, Permission, I18n, Workflow. These can become **optional library packages** or **patterns documented in the repo**:

| # | Topic | Suggestion |
|---|--------|------------|
| 6.1 | **Api** | Already partially in infra (Axios). Could become `@caf/infrastructure-axios` + a small “API client” helper in core (e.g. request/response DTO conventions). |
| 6.2 | **Validation** | Either a thin `@caf/validation` (schema-agnostic interfaces + maybe a small runner) or “how to plug Zod/Yup” in docs. |
| 6.3 | **Permission** | Define in core: interfaces (e.g. `IPermissionChecker`); implement in infra or app. Optional small package later. |
| 6.4 | **I18n** | Same: core interfaces for “translate(key)”; implement in infra (e.g. i18next). Document in README or separate package later. |
| 6.5 | **Workflow** | If you mean state machines or multi-step flows, could be a small package on top of Ploc/Pulse or a separate primitive. |

No commitment to implement all in v1; keep as a backlog and decide per item whether it’s core, optional package, or docs-only.

---

## Checklist summary

- [ ] **Phase 1:** Core domain-agnostic; example domain moved out; API documented.
- [ ] **Phase 2:** package.json and build ready for publish; `npm pack` works.
- [ ] **Phase 3:** Published to registry; changelog present.
- [ ] **Phase 4:** README(s) and minimal usage docs done.
- [ ] **Phase 5:** (Optional) Infrastructure packages split and published.
- [ ] **Phase 6:** (Backlog) Api / Validation / Permission / I18n / Workflow as needed.

---

## Suggested order

1. Do **Phase 1** first (core clean + example extracted).  
2. Then **Phase 2** (build + package.json).  
3. Then **Phase 3** (publish).  
4. Then **Phase 4** (docs).  
5. Add **Phase 5** when you want official adapters as separate packages.  
6. Use **Phase 6** as a backlog and tick off when you add those features.

If you want, next step can be a concrete list of file moves and code edits for Phase 1 (e.g. exact folders for `example-domain` and what to delete from core).
