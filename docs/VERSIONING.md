# Versioning Strategy

## Decision: Per-Package Versioning

CAF uses **per-package versioning**: each package (`@c-a-f/core`, `@c-a-f/infrastructure-react`, etc.) has its own version number and can evolve independently.

## Rationale

- **Independent evolution**: Breaking changes in one package (e.g. `@c-a-f/infrastructure-react`) don't force version bumps in others (e.g. `@c-a-f/core`)
- **Consumer flexibility**: Consumers can update packages independently (e.g. update core without updating infrastructure adapters)
- **Library best practice**: Common pattern for library monorepos (e.g. Babel, Jest, React Router)

## Current State

- **Root `package.json`**: Version `1.0.0` (monorepo reference version; not published)
- **All packages**: Currently at `1.0.0` (initial release)
- **Going forward**: Each package increments its version independently based on changes

## Versioning Guidelines

1. **Semantic Versioning**: Follow [SemVer](https://semver.org/) (MAJOR.MINOR.PATCH)
   - **MAJOR**: Breaking changes
   - **MINOR**: New features (backward compatible)
   - **PATCH**: Bug fixes (backward compatible)

2. **Dependency versions**: Packages specify exact versions of sibling packages (e.g. `"@c-a-f/core": "1.0.0"`) to ensure compatibility

3. **Root version**: The root `package.json` version can be updated to reflect the "monorepo milestone" but doesn't control package versions

## Example

If `@c-a-f/core` adds a new feature (non-breaking):
- `@c-a-f/core`: `1.0.0` → `1.1.0`
- `@c-a-f/infrastructure-react`: Stays at `1.0.0` (no changes)
- Consumers can update core independently

If `@c-a-f/infrastructure-react` fixes a bug:
- `@c-a-f/infrastructure-react`: `1.0.0` → `1.0.1`
- `@c-a-f/core`: Stays at `1.1.0` (no changes)
