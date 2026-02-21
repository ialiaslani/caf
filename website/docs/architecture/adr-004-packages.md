---
title: ADR-004 — Package separation
---

# ADR-004: Package separation (monorepo and scoped packages)

## Status

Accepted.

## Context

CAF aims to be framework-agnostic and layered. We need a packaging strategy that: keeps core primitives in one place; isolates framework-specific code; supports optional features; enables per-package versioning and publishing.

## Decision

We use a **monorepo** with **multiple npm packages** under the scope **`@c-a-f`**:

### Core and shared (framework-agnostic)

- **`@c-a-f/core`** — Primitives (UseCase, Ploc, Pulse, ApiRequest), interfaces, RouteManager. No framework dependency.
- **`@c-a-f/validation`**, **`@c-a-f/workflow`**, **`@c-a-f/permission`**, **`@c-a-f/i18n`**, **`@c-a-f/devtools`** — Optional, framework-agnostic.

### Infrastructure (per-framework)

- **`@c-a-f/infrastructure-react`** — React hooks, CAFProvider, CAFErrorBoundary, useRouteManager, useRouteRepository, DevTools.
- **`@c-a-f/infrastructure-vue`** — Vue composables and components.
- **`@c-a-f/infrastructure-angular`** — Angular services and injectors.

### Optional / tooling

- **`@c-a-f/testing`** — Test helpers.
- **`@c-a-f/cli`** — CLI for init, generate.

**Dependency rules:** Core depends on nothing. Infrastructure depends only on core (and optional shared packages). Examples depend on core + one or more infrastructure packages.

## Consequences

**Positive:** Clear separation; consumers install only what they need; optional features; independent versioning; monorepo simplifies refactors.

**Negative:** More packages to maintain and publish; version alignment and discovery need documentation.
