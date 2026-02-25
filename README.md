# CAF — Clean Architecture Frontend

**Clean Architecture Frontend** — domain-agnostic primitives for building frontend applications with Clean Architecture. Works with React, Vue, Angular, or any future framework. [npm](https://www.npmjs.com/search?q=%40c-a-f) · [GitHub](https://github.com/ialiaslani/caf) · [**Documentation**](https://docs-caf.vercel.app/)

---

## Contents

- [Try online](#try-online)
- [What is CAF?](#what-is-caf)
- [Packages](#packages)
- [Getting started](#getting-started)
- [Setting up a project](#setting-up-a-project)
- [Architecture](#architecture)
- [Development](#development)
- [Docs & examples](#docs--examples)

---

## Try online

| Example | Link |
|--------|------|
| **React** | [Open in StackBlitz](https://stackblitz.com/github/ialiaslani/caf/tree/main/examples/example-react?file=README.md) |
| **Angular + WebSocket** | [Open in StackBlitz](https://stackblitz.com/github/ialiaslani/caf/tree/main/examples/example-angular-websocket) |
| **Vue + GraphQL** | [Open in StackBlitz](https://stackblitz.com/github/ialiaslani/caf/tree/main/examples/example-vue-graphql) |

---

## What is CAF?

CAF is a **core library** of framework-agnostic primitives and interfaces for Clean Architecture on the frontend. Same domain and use cases can run in React, Vue, or Angular by swapping adapters.

- **Framework-agnostic** — Write business logic once, use in any framework  
- **Clean Architecture** — Domain, application, infrastructure layers  
- **Reactive primitives** — Pulse for state; Ploc for presentation logic  
- **Pluggable adapters** — Routing, HTTP, UI per framework  
- **TypeScript** — Full type support  

**Vision:** Pulse (reactive state), Request (server connection), and Routing are defined as interfaces in the core; each framework implements them. So domain and use cases stay framework-free.

---

## Packages

| Package | Description |
|---------|-------------|
| **`@c-a-f/core`** | Primitives: `UseCase`, `Ploc`, `Pulse`, `ApiRequest`, `RouteManager`. [README](packages/core/README.md) |
| **`@c-a-f/workflow`** | Workflow/state machine on top of Ploc. [README](packages/workflow/README.md) |
| **`@c-a-f/infrastructure-react`** | React: `useRouteManager`, `useRouteRepository` |
| **`@c-a-f/infrastructure-vue`** | Vue: same composables |
| **`@c-a-f/infrastructure-angular`** | Angular: `injectRouteManager`, `injectRouteRepository`, `RouteHandler` |
| **`@c-a-f/validation`** | Validation interfaces + Zod/Yup adapters |
| **`@c-a-f/permission`** | Permission interfaces (RBAC, CASL, etc.) |
| **`@c-a-f/i18n`** | i18n interfaces and adapters |

Examples (not published): `examples/example-react`, `example-vue`, `example-vue-graphql`, `example-angular`, `example-angular-websocket`. Each has its own `caf/` folder (domain, application, infrastructure).

---

## Getting started

**Quick start (CLI)**  
Windows: `npm install -g @c-a-f/cli` then `caf-init`.  
Unix/Mac: `npx @c-a-f/cli`.  
Then: `npm install @c-a-f/core @c-a-f/infrastructure-react` (or `-vue` / `-angular`).  
[Windows npx note](packages/cli/WINDOWS_NPX_ISSUE.md)

**Install manually**

```bash
npm install @c-a-f/core
npm install @c-a-f/infrastructure-react   # or -vue, -angular
# optional: @c-a-f/validation, zod or yup
```

**Minimal usage**

```typescript
import { UseCase, Ploc, pulse } from '@c-a-f/core';

class GetUsers implements UseCase<[], User[]> {
  async execute(): Promise<RequestResult<User[]>> {
    // ... return { loading, data, error } with pulse()
  }
}

class UsersPloc extends Ploc<User[]> {
  constructor(private getUsers: GetUsers) { super([]); }
  async loadUsers() {
    const result = await this.getUsers.execute();
    this.changeState(result.data.value);
  }
}
```

Full usage: [documentation](https://docs-caf.vercel.app/) and [packages/core/README.md](packages/core/README.md).

---

## Setting up a project

Project layout: `caf/` (domain, application, infrastructure) + `src/` (framework-specific UI). Step-by-step guide with code: **[docs/SETUP.md](docs/SETUP.md)**.

---

## Architecture

```
Presentation (React/Vue/Angular) → Application (UseCase, Ploc) → Domain (entities, interfaces)
                                       ↑
Infrastructure (repositories, HTTP, routing adapters) ─────────┘
```

Dependencies point inward. Domain has zero framework dependencies. See [docs/API.md](docs/API.md) and [docs/PACKAGES.md](docs/PACKAGES.md).

---

## Development

Monorepo (Yarn workspaces). Node 18+.

```bash
yarn install
yarn core:build
# Examples
yarn example:react:dev    # or vue, vue-graphql, angular
```

Tests: `yarn test`. Individual: `yarn core:test`, `yarn workspace @c-a-f/workflow test`, etc.

---

## Docs & examples

| Resource | Link |
|----------|------|
| **Docs site** | [docs-caf.vercel.app](https://docs-caf.vercel.app/) |
| **Core usage** | [packages/core/README.md](packages/core/README.md) |
| **Setup guide** | [docs/SETUP.md](docs/SETUP.md) |
| **API** | [docs/API.md](docs/API.md) |
| **Custom routing** | [docs/guides/custom-routing.md](docs/guides/custom-routing.md) |
| **Publishing / versioning** | [docs/PUBLISHING.md](docs/PUBLISHING.md), [docs/VERSIONING.md](docs/VERSIONING.md) |
| **Changelog** | [CHANGELOG.md](CHANGELOG.md) |

**Examples** — Run locally: `yarn example:react:dev`, `yarn example:vue:dev`, `yarn example:vue-graphql:dev`, `yarn example:angular:dev`. Or use the [Try online](#try-online) StackBlitz links above.

---

## License

MIT · [github.com/ialiaslani/caf](https://github.com/ialiaslani/caf)

---

<details>
<summary>For maintainers: discoverability (GitHub, npm)</summary>

- **GitHub:** Description: `Clean Architecture Frontend (CAF) — framework-agnostic primitives for React, Vue, Angular. Domain, application, infrastructure layers.` Topics: `clean-architecture`, `clean-architecture-frontend`, `frontend`, `react`, `vue`, `angular`, `typescript`, `architecture`, `domain-driven-design`, `usecase`, `ploc`
- **npm:** Packages use keywords/descriptions with "clean-architecture-frontend". Re-publish to refresh.
- **GitHub Packages:** Workflow "Publish to GitHub Packages" publishes `@ialiaslani/caf-*`. Install with `@ialiaslani:registry=https://npm.pkg.github.com` in `.npmrc`.
</details>
