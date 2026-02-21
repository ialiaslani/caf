# Publishing @c-a-f/cli to npm

## Prerequisites

1. **npm account**: Make sure you have an npm account and are logged in
   ```bash
   npm login
   ```

2. **npm organization**: Since the package is scoped (`@c-a-f/cli`), you need to either:
   - Have access to the `@c-a-f` organization on npm, OR
   - Publish as a public scoped package (free)

## Step-by-Step Publishing Guide

### 1. Build the Package

First, build the TypeScript code:

```bash
cd packages/cli
npm run build
```

This will compile TypeScript to JavaScript in the `dist/` folder.

### 2. Verify the Build

Check that the `dist/` folder contains:
- `dist/bin/caf-init.js` (the executable)
- `dist/scaffold.js` (the scaffold logic)
- `dist/index.js` (if exists)

Make sure the shebang (`#!/usr/bin/env node`) is preserved in `dist/bin/caf-init.js`.

### 3. Test Locally (Optional)

Test the CLI locally before publishing:

```bash
# Link the package locally
npm link

# Test it
caf-init

# Or test with npx
npx caf-init
```

### 4. Check Package Contents

Verify what will be published:

```bash
npm pack --dry-run
```

This shows what files will be included in the package. It should include:
- `dist/` folder
- `README.md`
- `package.json`

### 5. Publish to npm

#### For Public Scoped Package (Free)

```bash
npm publish --access public
```

#### For Organization Package

If you have access to the `@c-a-f` organization:

```bash
npm publish
```

### 6. Verify Publication

After publishing, verify the package is available:

```bash
npm view @c-a-f/cli
```

Test installation:

```bash
npx @c-a-f/cli
```

## Updating the Package

When you need to publish a new version:

1. **Update version** in `package.json`:
   ```bash
   npm version patch   # for bug fixes (1.0.0 -> 1.0.1)
   npm version minor   # for new features (1.0.0 -> 1.1.0)
   npm version major   # for breaking changes (1.0.0 -> 2.0.0)
   ```

2. **Build**:
   ```bash
   npm run build
   ```

3. **Publish**:
   ```bash
   npm publish --access public
   ```

## Troubleshooting

### Error: "You do not have permission to publish"

- Make sure you're logged in: `npm login`
- For scoped packages, use `--access public` if you don't have org access
- Check if the package name is already taken

### Error: "Package name already exists"

- The package name `@c-a-f/cli` might already be published
- Check with: `npm view @c-a-f/cli`
- If it exists, you'll need to update the version

### Bin file not executable

The shebang (`#!/usr/bin/env node`) should be preserved. If not, make sure:
- TypeScript compilation preserves it
- Or manually add it after build

## Publishing from Monorepo Root

If publishing from the monorepo root, you can use:

```bash
# From root directory
cd packages/cli
npm publish --access public
```

Or add a script to the root `package.json`:

```json
{
  "scripts": {
    "cli:publish": "cd packages/cli && npm run build && npm publish --access public"
  }
}
```
