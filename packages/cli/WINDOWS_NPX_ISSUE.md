# Windows npx Issue - Explanation and Solutions

## The Problem

On Windows, when you run:
```powershell
npx "@c.a.f/cli"
```

You get the error:
```
'caf-init' is not recognized as an internal or external command
```

## Why This Happens

1. **Windows needs `.cmd` wrapper files**: Windows CMD/PowerShell can't execute `.js` files directly - it needs `.cmd` or `.bat` wrapper files
2. **npx temporary installation**: When `npx` downloads a package, it does a temporary installation, but on Windows it may not properly create the `.cmd` wrapper files for bin commands
3. **Scoped packages**: This issue is more common with scoped packages (`@scope/package`) because the package name doesn't match the command name

## Solutions

### Solution 1: Use Node directly (Works Everywhere)

```powershell
# Install the package temporarily and run with node
npx --yes "@c.a.f/cli" node dist/bin/caf-init.js
```

Actually, better approach - use npx to get the path:

```powershell
# Get the package path and run directly
$pkgPath = (npm pack "@c.a.f/cli" --dry-run 2>&1 | Select-String "Tarball").ToString()
# Or simpler:
node -e "const {execSync} = require('child_process'); const path = execSync('npm pack @c.a.f/cli --dry-run 2>&1 | findstr Tarball', {encoding:'utf8'}); console.log(path)"
```

### Solution 2: Install Globally (Recommended for Windows)

```powershell
npm install -g "@c.a.f/cli"
caf-init
```

This properly installs the package and creates the `.cmd` wrapper files.

### Solution 3: Use npm exec (Alternative to npx)

```powershell
npm exec -- "@c.a.f/cli" caf-init
```

### Solution 4: Create a PowerShell Wrapper Script

Create a file `caf-init.ps1`:

```powershell
#!/usr/bin/env pwsh
$package = "@c.a.f/cli"
$tempDir = Join-Path $env:TEMP "npx-$(New-Guid)"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
try {
    Push-Location $tempDir
    npm install $package --no-save --silent | Out-Null
    node ".\node_modules\@c.a.f\cli\dist\bin\caf-init.js" $args
} finally {
    Pop-Location
    Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
}
```

## Recommended Approach

For Windows users, we recommend:

1. **Install globally** (one-time setup):
   ```powershell
   npm install -g "@c.a.f/cli"
   ```

2. **Then use normally**:
   ```powershell
   caf-init
   caf-init ./my-project
   ```

## Update Documentation

We should update the README to show Windows-specific instructions:

```markdown
## Installation

### Windows Users (Recommended)

```powershell
npm install -g "@c.a.f/cli"
caf-init
```

### Unix/Mac Users

```bash
npx "@c.a.f/cli"
# or
npm install -g "@c.a.f/cli"
caf-init
```
```

## Long-term Fix

This is a known npm/npx issue on Windows. Potential fixes:
1. Wait for npm/npx to fix Windows bin handling for scoped packages
2. Use a different package name format (not scoped)
3. Provide a Windows-specific installation method

For now, **installing globally is the most reliable solution on Windows**.
