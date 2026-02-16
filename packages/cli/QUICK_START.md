# Quick Start: Publishing @c.a.f/cli

## Quick Commands

### 1. Build the CLI
```bash
cd packages/cli
npm run build
```

### 2. Test Locally (Optional)
```bash
npm link
caf-init
```

### 3. Publish to npm
```bash
npm publish --access public
```

## Or Use the Root Script

From the monorepo root:
```bash
npm run cli:publish
```

## First Time Setup

1. **Login to npm**:
   ```bash
   npm login
   ```

2. **Verify you're logged in**:
   ```bash
   npm whoami
   ```

3. **Check if package exists**:
   ```bash
   npm view @c.a.f/cli
   ```
   (If it doesn't exist, you're good to publish. If it exists, you'll need to bump the version)

4. **Publish**:
   ```bash
   cd packages/cli
   npm run build
   npm publish --access public
   ```

## Updating Version

```bash
cd packages/cli
npm version patch   # 1.0.0 -> 1.0.1
npm run build
npm publish --access public
```

## Verify Publication

```bash
npm view @c.a.f/cli
npx @c.a.f/cli
```
