# Publishing Guide

## Registry Options

CAF packages can be published to different registries depending on your needs:

### Option 1: npm (Public Registry) — Recommended for Open Source

**Pros:**
- Widely accessible
- No authentication needed for public packages
- Standard npm registry (`registry.npmjs.org`)
- Works with all npm/yarn/pnpm clients

**Configuration:**
- No special configuration needed for public scoped packages
- Use `npm publish --access public` for scoped packages (`@caf/core`)
- For unscoped packages, `--access public` is optional

**Publishing:**
```bash
cd packages/core
npm publish --access public
```

**Installation:**
```bash
npm install @caf/core
```

---

### Option 2: Private Registry (e.g., nadindev.ir, GitHub Packages, GitLab npm)

**Pros:**
- Private packages
- Custom domain/registry
- Integration with existing infrastructure

**Configuration for Scoped Packages:**

If using a private registry for scoped packages (`@caf/core`), configure npm to use that registry for the scope:

```bash
# Set registry for @caf scope
npm config set @caf:registry https://your-registry-url

# Or add to .npmrc file in project root:
# @caf:registry=https://your-registry-url
```

**Example for GitHub Packages:**
```bash
npm config set @caf:registry https://npm.pkg.github.com
```

**Example for GitLab:**
```bash
npm config set @caf:registry https://gitlab.com/api/v4/packages/npm
```

**Example for custom registry (nadindev.ir):**
```bash
npm config set @caf:registry https://npm.nadindev.ir
```

**Authentication:**
- Create `.npmrc` file with authentication token
- Or use `npm login` for the registry
- For CI/CD, use environment variables or secrets

**Publishing:**
```bash
cd packages/core
npm publish
```

**Installation:**
```bash
npm install @caf/core
# (will use configured registry for @caf scope)
```

---

## Current Decision

**Registry:** To be determined based on project needs.

**Recommendation:**
- **For open source:** Use npm public registry (`npm publish --access public`)
- **For private/internal:** Use private registry (configure `@caf:registry`)

**Note:** The repository URL (`https://git.nadindev.ir/aliaslani.mm/caf.git`) suggests a private Git server. If you have a corresponding npm registry at `nadindev.ir`, configure it as shown above.

---

## Verification

After choosing and configuring a registry, verify with:

```bash
# Check current registry configuration
npm config get @caf:registry

# Test publish (use --dry-run first)
cd packages/core
npm publish --dry-run

# Verify package is accessible
npm view @caf/core
```
