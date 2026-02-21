# Republishing with Windows Fix

## What Was Fixed

1. ✅ Added `dist/bin/caf-init.cmd` - Windows batch wrapper
2. ✅ Updated build script to auto-generate the `.cmd` file
3. ✅ Included `.cmd` file in published package
4. ✅ Updated documentation

## To Republish

```powershell
cd "d:\Web Projects\caf\caf\packages\cli"

# 1. Bump version
npm version patch  # 1.0.0 -> 1.0.1

# 2. Build (creates .cmd file automatically)
npm run build

# 3. Verify .cmd file exists
ls dist\bin\caf-init.cmd

# 4. Check what will be published
npm pack --dry-run

# 5. Publish
npm publish --access public
```

## Testing After Republish

```powershell
# Clear npx cache
npx clear-npx-cache

# Test npx (should work on Windows now)
npx "@c-a-f/cli"

# Or test globally
npm install -g "@c-a-f/cli@latest"
caf-init
```

## What the .cmd File Does

The `caf-init.cmd` file is a Windows batch script that:
- Calls Node.js with the `.js` file
- Passes all arguments through
- Works when npx extracts the package

This ensures Windows can execute the CLI even when npm's automatic wrapper creation doesn't work properly with npx.
