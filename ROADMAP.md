# CAF ??? Clean Architecture Frontend: Roadmap

## Vision

CAF is a **core** that you can use to implement whatever you want using **implementable interfaces** that are compatible with **any frontend library** that exists today or may appear tomorrow.

To achieve that:

- **Pulse** ??? A proxy-based reactive primitive (like refs/reactive in Vue core). It gives the core a single, framework-agnostic way to hold state and notify subscribers, so any UI layer (React, Vue, Angular, or future frameworks) can bind to it.
- **Request** ??? Every frontend has a connection with the server. The core defines interfaces and a default implementation (e.g. loading/data/error as Pulse-backed values) so infrastructure can plug in any HTTP or transport.
- **Routing** ??? Every frontend has routing. The core defines a routing interface (e.g. current route, change route) so each framework implements it once; application and domain code depend only on the interface.

**Goal:** This core can be a **library** (primitives + interfaces + optional default implementations). With conventions and a thin app shell, it can grow into a small **framework**. The same domain and use cases can run in React, Vue, Angular, or a future framework by swapping adapters.

---

## Current state vs vision

| Piece | Status |
|-------|--------|
| **Pulse** | Implemented: proxy, `.value`, subscribe/unsubscribe, no notify when value unchanged. Used inside `ApiRequest` and tested. |
| **Ploc** | Abstract state container with subscribe/changeState. Used in example-domain. Built on Pulse (one reactive engine). Use Ploc for stateful blocs; use Pulse for a single value. Documented in API.md. ??when to use which?? docs. |
| **Request** | `IRequest`, `RequestResult` (Pulse-based loading/data/error), `ApiRequest`. Fits ??connection with server??; framework-agnostic. |
| **Routing** | `RouteRepository` + `RouteManager` in core. React, Vue, and Angular infra all implement `RouteRepository`; Angular uses `RouteHandler` + `RouterService` (same contract as React/Vue). |
| **UseCase** | Interface returning `Promise<RequestResult<T>>`; use cases depend only on core types. |

**Gaps to close so the codebase matches the vision:**

- ~~Unify **routing**: Angular should implement the same `RouteRepository`~~ ??? Done (2.1).
- Fix **React routing**: `RouteHandler` must not call `useNavigate`/`useLocation` inside a class constructor (breaks rules of hooks). Use a hook that returns an object implementing `RouteRepository` and pass it into `RouteManager`.
- ~~**Pulse vs Ploc**: Either build Ploc on top of Pulse or document when to use which~~ ??? Done (2.3).
- ~~**Core cleanups**: Remove debug code in `ApiRequest`; tidy `onSuccess` in `ApiRequest.mutate`~~ ??? Done (2.4).
- **Request interface (optional):** Consider an `IRequestHandler` (or similar) interface so `ApiRequest` is one implementation and others (mock, cached) can be swapped without tying core to one implementation.

---

## Scope

- **In scope:** `@caf/core` as the framework-agnostic library (Pulse, Ploc, UseCase, RouteRepository, RouteManager, IRequest, ApiRequest, RequestResult). Publish, version, document. Optional infrastructure adapters per framework.
- **Out of scope (for v1):** Extracting React UI into a separate package; that can be Phase 5+.
- **Decision:** Keep this repo as the ??reference app?? that consumes the published packages (the repo both develops and demos the library).

---

## Phase 1 ??? Core as a domain-agnostic library

**Goal:** `@caf/core` exports only reusable primitives and interfaces. No User/Login (or any app-specific domain) in the core package.

| # | Task | Notes |
|---|------|--------|
| 1.1 | **Define the public API** | ??? Done. See [docs/API.md](docs/API.md). Exports: `UseCase`, `Ploc`, `Pulse`, `pulse`, `ApiRequest`, `RouteManager`/`RouteRepository`/`RouteManagerAuthOptions`, `RequestResult`, `IRequest`. |
| 1.2 | **Move example domain out of core** | ??? Done. `packages/example-domain` exists with `User`, `Login`, `IUserRepository`, `ILoginRepository`, `UserService`, `LoginService`, and use cases (`LoginUser`, `LogoutUser`, `GetUsers`, `AddUsers`). Core keeps only `domain/shared` and `application/shared`. Root scripts: `example-domain:build`, `example-domain:serve`. |
| 1.3 | **Wire example-domain into infra and apps** | ??? Done. `@caf/infrastructure` (shared), `@caf/infrastructure-react`, `@caf/infrastructure-vue`, and `@caf/infrastructure-angular` depend on `@caf/example-domain`. Vue, React, and Angular presentation depend on `@caf/example-domain` and import `Login`, `ILoginUseCase`, etc. from it. Core has no dependency on example-domain. |
| 1.4 | **Fix core leaks** | ??? Done. Removed debug code from core (`ApiRequest`: `this.loading.subscribe(console.log)`). Simplified `onSuccess` in `ApiRequest.mutate`. Route comment no longer mentions `localStorage`. Core has no browser/API specifics; save token remains in example-domain/infrastructure. |
| 1.5 | **Typo and small cleanups** | ??? Done. No typo found: method is already `saveTokenToLocalStorage` in example-domain (`login.service.ts`); call site in `LoginUser.ts` matches. |
| 1.6 | **Version and entrypoint** | ??? Done. `@caf/core` has `main`, `module`, `types` ??? `./.build/index.js` / `index.d.ts`; `exports` for ESM; `files`: `[".build"]`; version `1.0.0`; `prepublishOnly` runs build. |

**Exit criteria:** Building the repo works; core has zero app-specific domain; public API is documented and minimal.

---

## Phase 2 ??? Align with vision (routing, Pulse, cleanups)

**Goal:** All frameworks use the same core interfaces; no hooks in constructors; core is clean and consistent.

| # | Task | Notes |
|---|------|--------|
| 2.1 | **Unify routing interface** | ??? Done. Core contract is `RouteRepository` (`currentRoute`, `change(route)`). Angular now implements it via `RouteHandler` (Angular Router adapter); `RouterService` provides core `RouteManager` with auth options ??? same pattern as React/Vue. Removed old `IRouteManager`-based Angular RouteManager. |
| 2.2 | **Fix React RouteHandler** | ??? Done. Created `useRouteRepository()` hook that properly calls `useNavigate`/`useLocation` at hook level (not in constructor). Created `useRouteManager()` hook that uses `useRouteRepository()` and returns core `RouteManager`. Updated React app (`useLogin`, `useLogout`, `useRouterManager`) to use the new hooks. Old `RouteHandler` class and `RouterService` marked as deprecated. |
| 2.3 | **Pulse vs Ploc** | Either implement Ploc on top of Pulse (one reactive primitive) or document clearly: ??Use Pulse for a single reactive value; use Ploc for a stateful bloc with structured state.?? |
| 2.4 | **Core cleanups** | ??? Done. No debug code in `ApiRequest` (no `subscribe(console.log)`). `mutate` already calls `options?.onSuccess?.(this.data.value)` after success; tidied formatting and return/semicolons. |

**Exit criteria:** React, Vue, and Angular all use the same routing abstraction from core; core has no debug code and a clear story for Pulse/Ploc.

---

## Phase 3 ??? Package metadata and build

**Goal:** Each publishable package has correct `package.json` and a production build suitable for npm.

| # | Task | Notes |
|---|------|--------|
| 3.1 | **Publishable package.json** | ??? Done. `@caf/core` has all required fields: `name`, `version`, `description`, `keywords`, `license`, `repository`, `main`, `module`, `types`, `files` (`[".build"]`), `exports` (ESM), `prepublishOnly`. Not set to `"private": true`. Ready for publishing. |
| 3.2 | **Build output** | Core already uses `tsc` ??? `.build`. Ensure output is **consumable** (ESM or CJS as desired; types included). Add a `prepublishOnly` script that runs `build` so `npm publish` always ships a fresh build. |
| 3.3 | **Root vs package versioning** | ? Done. **Per-package versioning** chosen: each package (`@caf/core`, `@caf/infrastructure-react`, etc.) has its own version and evolves independently. Root `package.json` version (`1.0.0`) is a monorepo reference but doesn't control package versions. Documented in `docs/VERSIONING.md`. Fixed inconsistent version in `@caf/presentation-react` (`0.0.0` ? `1.0.0`). |
| 3.4 | **.npmignore or "files"** | ? Done. `"files": [".build"]` in `@caf/core` package.json ensures only build output is shipped. npm automatically includes `package.json`. Source files (`.ts`), tests (`__tests__/`, `*.spec.ts`), and config files (`tsconfig.json`, `vitest.config.ts`) are excluded. No `.npmignore` needed ? `files` field is clearer and preferred. |

**Exit criteria:** `npm pack` (or `yarn pack`) for `@caf/core` produces a tarball that contains only what consumers need; another project can `npm install ./caf-core-0.1.0.tgz` and use it.

---

## Phase 4 ??? Publishing and registry

**Goal:** Publish `@caf/core` to a registry and consume it from this repo (or a test project).

| # | Task | Notes |
|---|------|--------|
| 4.1 | **Choose registry** | ? Done. Registry options documented in `docs/PUBLISHING.md`: npm (public) recommended for open source; private registry (nadindev.ir, GitHub Packages, GitLab) for private packages. Configuration instructions provided for scoped packages (`@caf/core`). Decision can be made when ready to publish. |
| 4.2 | **First publish** | ? Done. First publish steps documented in `docs/PUBLISHING.md`: pre-publish checklist (version consideration, build, dry-run), publishing commands for public/private registries, post-publish verification. Current version is `1.0.0`; guide notes option to start with `0.1.0` for early stage. Ready to publish when registry is chosen. |
| 4.3 | **Consume from registry (optional)** | ? Done. Consumption guide added to `docs/PUBLISHING.md`: monorepo continues using workspaces (no changes needed); external validation steps documented (create test app, install from registry, verify imports/types work). Includes validation checklist and troubleshooting. |
| 4.4 | **Changelog** | Add a `CHANGELOG.md` at repo root (or per package). Document what???s in v0.1.0 (e.g. ??Initial release: UseCase, Ploc, Pulse, ApiRequest, RouteManager??). |

**Exit criteria:** `@caf/core` is installable via `npm install @caf/core` (or your registry URL); changelog exists.

---

## Phase 5 ??? Documentation and DX

**Goal:** New users can understand what CAF is, how to install it, and how to use the primitives.

| # | Task | Notes |
|---|------|--------|
| 5.1 | **README for core** | In `packages/core/README.md`: one-line description, install command, minimal ??Usage?? with a tiny example (e.g. defining a UseCase and a Ploc). Link to main repo README for full architecture explanation. |
| 5.2 | **Root README** | Expand `README.md`: ??What is CAF??, ??Vision?? (core + interfaces + Pulse + request + routing, any frontend), ??Packages?? (core vs example vs apps), ??Getting started?? (install + link to core README), ??Architecture?? (domain / application / infrastructure), ??Development?? (how to run this repo). Optional: simple diagram (e.g. layers + dependency direction). |
| 5.3 | **API surface** | Document the public API (list of exports and their types). Can live in core README, or in `docs/API.md`, or generated (e.g. TypeDoc) later. |
| 5.4 | **Example / demo** | This repo???s apps (React/Vue/Angular) already serve as the ??example??. In README, add a short ??Example?? section that points to this repo and the example-domain package. |

**Exit criteria:** A new developer can read the README(s), install `@caf/core`, and implement a minimal UseCase/Ploc flow without reading the repo source.

---

## Phase 6 ??? Optional: Infrastructure as separate packages

**Goal:** Publish optional adapter packages so consumers can use official implementations of RouteManager and HTTP.

| # | Task | Notes |
|---|------|--------|
| 6.1 | **Split infrastructure** | Optionally split `@caf/infrastructure` into e.g. `@caf/infrastructure-axios` (HTTP/repositories) and keep framework-specific route managers as `@caf/infrastructure-react`, `@caf/infrastructure-vue`, `@caf/infrastructure-angular`. Each has its own package.json and version. |
| 6.2 | **Publish and document** | Same as Phase 3???5: build, `files`, README, publish. Document in root README: ??Official adapters: ????. |
| 6.3 | **Example-domain dependency** | Example-domain (or demo app) depends on core + these infra packages; no need to publish example-domain unless you want a ??starter kit?? package. |

**Exit criteria:** Consumers can `npm install @caf/core @caf/infrastructure-react` (and optionally axios adapter) and use them in their own app.

---

## Phase 7 ??? Future library features (backlog)

Api, Validation, Permission, I18n, Workflow can become **optional library packages** or **patterns documented in the repo**:

| # | Topic | Suggestion |
|---|--------|------------|
| 7.1 | **Api** | Already partially in infra (Axios). Could become `@caf/infrastructure-axios` + a small ??API client?? helper in core (e.g. request/response DTO conventions). |
| 7.2 | **Validation** | Either a thin `@caf/validation` (schema-agnostic interfaces + maybe a small runner) or ??how to plug Zod/Yup?? in docs. |
| 7.3 | **Permission** | Define in core: interfaces (e.g. `IPermissionChecker`); implement in infra or app. Optional small package later. |
| 7.4 | **I18n** | Same: core interfaces for ??translate(key)??; implement in infra (e.g. i18next). Document in README or separate package later. |
| 7.5 | **Workflow** | If you mean state machines or multi-step flows, could be a small package on top of Ploc/Pulse or a separate primitive. |
| 7.6 | **Request interface** | Optional: formalize `IRequestHandler` (or similar) so `ApiRequest` is one implementation; mocks or cached implementations can be swapped without tying core to one. |

No commitment to implement all in v1; keep as a backlog and decide per item whether it???s core, optional package, or docs-only.

---

## Checklist summary

- [ ] **Phase 1:** Core domain-agnostic; example domain moved out; API documented.
- [x] **Phase 2:** Routing unified (2.1 ???); React RouteHandler fixed (2.2 ???); Pulse/Ploc unified (2.3 ???); core cleanups (2.4 ???).
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
