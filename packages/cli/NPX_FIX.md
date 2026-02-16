# Fix for npx with Scoped Packages on Windows

## The Problem

When using `npx "@c.a.f/cli"` on Windows, you get the error:
```
'caf-init' is not recognized as an internal or external command
```

## The Solution

For scoped packages, `npx` requires you to explicitly specify both the package AND the command name.

### Option 1: Use `-p` flag (Recommended)

```powershell
npx -p "@c.a.f/cli" caf-init
```

This tells npx:
- `-p "@c.a.f/cli"` = install this package
- `caf-init` = run this command from the package

### Option 2: Use the full command format

```powershell
npx "@c.a.f/cli" caf-init
```

Some versions of npx support this format.

### Option 3: Install globally first

```powershell
npm install -g "@c.a.f/cli"
caf-init
```

## Why This Happens

Scoped packages (`@scope/package`) with bin commands require explicit command specification because:
1. Windows needs `.cmd` wrapper files for bin commands
2. npx doesn't always auto-detect the bin command name for scoped packages
3. The package name (`@c.a.f/cli`) doesn't match the command name (`caf-init`)

## Update Documentation

We should update the README to show the correct usage:

```markdown
## Usage

### With npx (Recommended)

```bash
# Explicitly specify package and command
npx -p "@c.a.f/cli" caf-init

# Or with a target directory
npx -p "@c.a.f/cli" caf-init ./my-project
```

### Install Globally

```bash
npm install -g "@c.a.f/cli"
caf-init
```
```
