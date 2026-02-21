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
- Use `npm publish --access public` for scoped packages (`@c.a.f/core`)
- For unscoped packages, `--access public` is optional

**Publishing:**
```bash
cd packages/core
npm publish --access public
```

**Installation:**
```bash
npm install @c.a.f/core
```

---

### Option 2: Private Registry (e.g., nadindev.ir, GitHub Packages, GitLab npm)

**Pros:**
- Private packages
- Custom domain/registry
- Integration with existing infrastructure

**Configuration for Scoped Packages:**

If using a private registry for scoped packages (`@c.a.f/core`), configure npm to use that registry for the scope:

```bash
# Set registry for @c.a.f scope
npm config set @c.a.f:registry https://your-registry-url

# Or add to .npmrc file in project root:
# @c.a.f:registry=https://your-registry-url
```

**Example for GitHub Packages:**
```bash
npm config set @c.a.f:registry https://npm.pkg.github.com
```

**Example for GitLab:**
```bash
npm config set @c.a.f:registry https://gitlab.com/api/v4/packages/npm
```

**Example for custom registry (nadindev.ir):**
```bash
npm config set @c.a.f:registry https://npm.nadindev.ir
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
npm install @c.a.f/core
# (will use configured registry for @c.a.f scope)
```

---

## Current Decision

**Registry:** To be determined based on project needs.

**Recommendation:**
- **For open source:** Use npm public registry (`npm publish --access public`)
- **For private/internal:** Use private registry (configure `@c.a.f:registry`)

**Note:** The repository URL (`https://github.com/ialiaslani/caf.git`) suggests a private Git server. If you have a corresponding npm registry at `nadindev.ir`, configure it as shown above.

---

## First Publish

### Pre-Publish Checklist

1. **Version Consideration:**
   - Current version: `1.0.0`
   - For early stage, consider starting with `0.1.0` to signal it's pre-1.0
   - To change version: `npm version 0.1.0` (or edit `package.json`)

2. **Build:**
   ```bash
   cd packages/core
   npm run build
   ```
   (Note: `prepublishOnly` script will also run this automatically)

3. **Verify Build Output:**
   ```bash
   # Check that .build directory exists and has files
   ls -la .build/
   ```

4. **Dry Run (Test):**
   ```bash
   npm publish --dry-run
   ```
   This shows what would be published without actually publishing.

### Publishing Steps

**For npm public registry:**
```bash
cd packages/core
npm publish --access public
```

**For private registry:**
```bash
cd packages/core
npm publish
```

### Post-Publish Verification

```bash
# Verify package is accessible
npm view @c.a.f/core

# Check version
npm view @c.a.f/core version

# Test installation (in a different directory)
npm install @c.a.f/core
```

---

## Consuming from Registry

After publishing, validate that the package can be consumed correctly.

### In This Monorepo

This monorepo uses **workspaces**, so packages continue to use local workspace references:

```json
// examples/example-angular/package.json (or any example)
{
  "dependencies": {
    "@c.a.f/core": "1.0.0"  // Uses workspace version
  }
}
```

No changes needed — workspaces will resolve to local packages.

### External Validation (Recommended)

To validate that the published package works correctly, create a small external test app:

**1. Create a test directory:**
```bash
mkdir test-caf-consumption
cd test-caf-consumption
```

**2. Initialize npm project:**
```bash
npm init -y
```

**3. Install @c.a.f/core from registry:**
```bash
# For npm public registry
npm install @c.a.f/core

# For private registry (ensure @c.a.f:registry is configured)
npm install @c.a.f/core
```

**4. Create a test file (`test.js` or `test.ts`):**
```typescript
// test.ts
import { 
  UseCase, 
  Ploc, 
  Pulse, 
  pulse, 
  ApiRequest, 
  RouteManager,
  RouteRepository 
} from '@c.a.f/core';

// Test Pulse
const count = pulse(0);
console.log('Pulse value:', count.value);
count.value = 5;
console.log('Updated Pulse value:', count.value);

// Test that types are available
const testPloc = class extends Ploc<number> {
  constructor() {
    super(0);
  }
};

console.log('✅ @c.a.f/core imported successfully');
console.log('✅ Types are working');
```

**5. Verify installation:**
```bash
# Check installed version
npm list @c.a.f/core

# Verify package.json has dependency
cat package.json | grep @c.a.f/core

# Check node_modules structure
ls -la node_modules/@c.a.f/core/
ls -la node_modules/@c.a.f/core/.build/
```

**6. Test TypeScript types (if using TypeScript):**
```bash
# Install TypeScript
npm install -D typescript

# Create tsconfig.json
echo '{"compilerOptions": {"module": "ESNext", "target": "ESNext", "moduleResolution": "node"}}' > tsconfig.json

# Compile test file
npx tsc test.ts --noEmit

# Should compile without errors if types are correct
```

**7. Test runtime (if using JavaScript):**
```bash
# Run test file
node test.js
# Should output: ✅ @c.a.f/core imported successfully
```

### Validation Checklist

- [ ] Package installs successfully (`npm install @c.a.f/core`)
- [ ] Package is listed in `node_modules/@c.a.f/core/`
- [ ] `.build` directory exists with compiled files
- [ ] `package.json` is present
- [ ] TypeScript types (`.d.ts` files) are available
- [ ] Imports work correctly (`import { ... } from '@c.a.f/core'`)
- [ ] Types are recognized by TypeScript compiler
- [ ] Runtime execution works (if testing JavaScript)

### Troubleshooting

**If installation fails:**
- Check registry configuration: `npm config get @c.a.f:registry`
- Verify package exists: `npm view @c.a.f/core`
- Check authentication (for private registries)

**If types don't work:**
- Verify `.build` directory contains `.d.ts` files
- Check `package.json` has `"types"` field pointing to `.build/index.d.ts`
- Ensure TypeScript can resolve the module

**If imports fail:**
- Check `package.json` has correct `"main"`, `"module"`, and `"exports"` fields
- Verify ESM/CJS compatibility matches your project setup

---

## Verification

After choosing and configuring a registry, verify with:

```bash
# Check current registry configuration
npm config get @c.a.f:registry

# Test publish (use --dry-run first)
cd packages/core
npm publish --dry-run

# Verify package is accessible
npm view @c.a.f/core
```
