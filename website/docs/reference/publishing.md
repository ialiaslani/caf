---
title: Publishing
---

# Publishing guide

CAF packages can be published to npm (public) or a private registry.

## npm (public) — recommended for open source

```bash
cd packages/core
npm publish --access public
```

For scoped packages (`@c-a-f/core`), `--access public` is required for the first publish. Installation: `npm install @c-a-f/core`.

## Private registry

Configure the scope to use your registry:

```bash
npm config set @c-a-f:registry https://your-registry-url
```

Or in `.npmrc`:

```
@c-a-f:registry=https://your-registry-url
```

Then run `npm publish` from each package directory (or use a publish script).

## Versioning

CAF uses **per-package versioning**: each package has its own version. Follow [SemVer](https://semver.org/) (MAJOR.MINOR.PATCH). See [Versioning](/docs/reference/versioning) for guidelines.

For registry options, authentication, and CI, see [PUBLISHING.md](https://github.com/ialiaslani/caf/blob/main/docs/PUBLISHING.md) in the repository.
