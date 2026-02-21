# Fix for npx with Scoped Packages on Windows

## The Problem

When using `npx "@c-a-f/cli"` on Windows, you may get:
```
'cli' is not recognized as an internal or external command
```

## The Solution

The package uses a **root-level `cli.js`** so the bin path is simple and works with npm’s Windows stub.

### Option 1: npx (try first)

```powershell
npx "@c-a-f/cli"
npx "@c-a-f/cli" ./my-project
```

### Option 2: Force npx to use the package (ignore system “cli”)

```powershell
npx --ignore-existing "@c-a-f/cli"
```

### Option 3: Run with node (when the package is already installed, e.g. in a monorepo)

```powershell
node node_modules/@c-a-f/cli/cli.js
node node_modules/@c-a-f/cli/cli.js ./my-project
```

### Option 4: Install globally

```powershell
npm install -g "@c-a-f/cli"
cli
cli ./my-project
```

## Monorepo / workspace

From a subfolder (e.g. `examples/test`), the bin may not be on PATH. Use Option 3, or run from repo root:

```powershell
cd path\to\caf
npx "@c-a-f/cli"
```
