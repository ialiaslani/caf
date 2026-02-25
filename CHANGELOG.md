# Changelog

All notable changes to CAF (Clean Architecture Frontend) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### React infrastructure
- **CAFProvider** and **CAFContext** — Provision Ploc and UseCase to the tree
- **usePloc** and **useUseCase** hooks — Access Ploc/UseCase from context with improved type inference
- **CAFErrorBoundary** — Error boundary component for CAF applications

#### DevTools
- **DevTools integration** — Memory leak detection and performance profiling for Ploc and UseCase

#### CLI
- **CLI tool** (`@c-a-f/cli`) — Scaffold CAF project structure (`caf-init` / `npx @c-a-f/cli`), with Windows compatibility notes

#### Workflow
- **@c-a-f/workflow** — Workflow and state machine primitives built on Ploc (guards, actions, effects)

#### Validation
- **@c-a-f/validation** — Validation interfaces and Zod/Yup adapters; comprehensive testing

#### Permission & i18n
- **@c-a-f/permission** — Permission interfaces and adapters (RBAC, CASL, policy-based, etc.); testing and coverage
- **@c-a-f/i18n** — i18n interfaces and adapters (i18next, vue-i18n, ngx-translate, react-intl, next-intl); testing and coverage

#### Examples
- **example-react** — Full React example with routing, Ploc, user management
- **example-vue** — Vue example with Vue Router adapter
- **example-vue-graphql** — Vue + GraphQL example (same domain/application, GraphQL infrastructure)
- **example-angular** — Angular example with Angular Router adapter
- **example-angular-websocket** — Angular + WebSocket example with user management and routing

#### Testing
- **Vitest** — Unit tests for core (ApiRequest, Ploc, Pulse, RouteManager, UseCase), DevTools, workflow, validation, CLI, infrastructure-react, permission, i18n
- **Testing package** — Vue and Angular testing utilities
- **GitHub Actions** — Automated testing workflow

#### Documentation
- **Docusaurus documentation site** — Deployed on Vercel
- **Custom routing guide** — Use TanStack Router, Wouter, Next.js, etc. with CAF (`docs/guides/custom-routing.md`)
- **UseCase + TanStack Query** — Documentation and integration patterns
- **Setup guide** — Full project setup in `docs/SETUP.md`; main README shortened with table of contents and “Try online” StackBlitz links

#### Infrastructure
- **Scoped packages** — All packages use `@c-a-f/*` (replaced `@c.a.f`)
- **GitHub Actions** — Build and publish for core, workflow, validation, CLI, DevTools, infrastructure-react, infrastructure-vue, infrastructure-angular, permission, i18n
- **GitHub Packages** — Publishing workflow for `@ialiaslani/caf-*`
- **Vercel** — Node version and deployment configuration for docs

### Changed

- **Angular infrastructure** — New routing capabilities and context retrieval; **RouterService deprecated** in favor of `injectRouteManager` / `injectRouteRepository` / `RouteHandler`
- **Package naming** — Refactor from `@c.a.f` to `@c-a-f` across the project
- **Example structure** — Removed `example-domain` package; each example has its own `caf/` folder (domain, application, infrastructure)
- **Vitest** — Configuration and dependency handling updated; test cleanup and performance improvements
- **Node.js** — Version requirements and DevTools package updates documented

### Fixed

- Formatting and minor fixes in examples (e.g. UserPloc, image assets)
- Example workflow and React build/publish in CI

---

## [1.0.0] - 2026-02-16

### Added

#### Core Primitives
- **UseCase** — Interface for application use cases (commands/queries) returning `Promise<RequestResult<T>>`
- **Ploc** — Presentation Logic Component: abstract class for stateful blocs with structured state, built on Pulse
- **Pulse** — Single reactive value primitive with proxy-based `.value` access, subscribe/unsubscribe, and change detection
- **pulse** — Factory function for creating Pulse instances

#### Request Handling
- **ApiRequest** — Wraps async requests with reactive loading/data/error state (Pulse-backed)
- **RequestResult** — Type defining the shape of loading/data/error for use cases
- **IRequest** — Promise-like type for async requests

#### Routing
- **RouteRepository** — Framework-agnostic interface for routing systems (`currentRoute`, `change(route)`)
- **RouteManager** — Coordinates routing using RouteRepository with optional auth guard
- **RouteManagerAuthOptions** — Interface for optional auth configuration (login redirect, isLoggedIn check)

### Architecture

- **Framework-agnostic core** — All primitives work with any frontend framework (React, Vue, Angular, or future frameworks)
- **Clean Architecture** — Domain-agnostic core with clear separation of concerns
- **Reactive primitives** — Single reactive engine (Pulse) powers both Pulse and Ploc
- **Type-safe** — Full TypeScript support with declaration files

### Documentation

- **API Documentation** — Complete API reference in `docs/API.md`
- **Publishing Guide** — Publishing and consumption guide in `docs/PUBLISHING.md`
- **Versioning Strategy** — Per-package versioning documented in `docs/VERSIONING.md`

### Infrastructure

- **Build system** — TypeScript compilation to ESM with declaration files
- **Package configuration** — Ready for npm publishing with proper `package.json` fields
- **Pre-publish hooks** — Automatic build before publish via `prepublishOnly` script

---

## Version History

- **Unreleased** — CLI, React context/hooks/error boundary, DevTools, workflow, validation, permission, i18n, examples (React/Vue/Vue GraphQL/Angular/Angular WebSocket), testing, Docusaurus docs, setup guide, README DX improvements
- **1.0.0** (2026-02-16) — Initial release with core primitives and routing abstraction
