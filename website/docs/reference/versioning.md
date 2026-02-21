---
title: Versioning
---

# Versioning strategy

CAF uses **per-package versioning**: each package (`@c-a-f/core`, `@c-a-f/infrastructure-react`, etc.) has its own version and can evolve independently.

## Rationale

- **Independent evolution** — Breaking changes in one package don’t force bumps in others.
- **Consumer flexibility** — Consumers can update packages independently.
- **Library best practice** — Common for library monorepos (e.g. Babel, Jest).

## Guidelines

1. **Semantic Versioning** — Follow [SemVer](https://semver.org/):
   - **MAJOR** — Breaking changes
   - **MINOR** — New features (backward compatible)
   - **PATCH** — Bug fixes (backward compatible)

2. **Dependency versions** — Packages specify compatible versions of sibling packages (e.g. `"@c-a-f/core": "^1.0.0"` or exact as needed).

3. **Root version** — The root `package.json` version is a monorepo reference; it does not control published package versions.

## Example

- `@c-a-f/core` adds a new feature → core `1.0.0` → `1.1.0`; infrastructure can stay at `1.0.0`.
- `@c-a-f/infrastructure-react` fixes a bug → infrastructure-react `1.0.0` → `1.0.1`; core unchanged.

For the full strategy, see [VERSIONING.md](https://github.com/ialiaslani/caf/blob/main/docs/VERSIONING.md) in the repository.
