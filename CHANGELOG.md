# Changelog

All notable changes to CAF (Clean Architecture Frontend) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

## [Unreleased]

### Planned

- Additional infrastructure adapters (optional packages)
- Validation utilities
- Permission system interfaces
- I18n interfaces
- Workflow/state machine primitives

---

## Version History

- **1.0.0** — Initial release with core primitives and routing abstraction

---

**Note:** If starting with a pre-1.0 version (e.g., `0.1.0`), this changelog can be adjusted accordingly. The current version reflects the stable state of the core library.
