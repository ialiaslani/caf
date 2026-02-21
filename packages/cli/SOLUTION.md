# Windows npx Solution

## The Fix

I've added a Windows `.cmd` wrapper file that will be included in the published package. This ensures `npx` works on Windows.

## What Was Changed

1. **Created `dist/bin/caf-init.cmd`**: A Windows batch file that calls the Node.js script
2. **Updated build script**: Automatically creates the `.cmd` file during build
3. **Added to package**: The `.cmd` file is now included in the published package

## How It Works

When npm installs a package with a `bin` entry, it:
1. Looks for the file specified in `bin` (`.js` file)
2. Creates platform-specific wrappers in `node_modules/.bin/`
3. On Windows, creates `.cmd` files automatically

However, `npx` doesn't always do a full install, so having the `.cmd` file in the package ensures it's available.

## Testing

After republishing with the `.cmd` file:

```powershell
# Clear npx cache
npx clear-npx-cache

# Test
npx "@c-a-f/cli"
```

## If It Still Doesn't Work

If `npx` still has issues on Windows, the fallback is:

```powershell
npm install -g "@c-a-f/cli"
caf-init
```

This always works because npm creates the proper wrappers during global installation.
