#!/usr/bin/env bash
# Usage: ./publish-to-github-packages.sh <package-dir> <github-package-name>
# Example: ./publish-to-github-packages.sh packages/core @ialiaslani/caf-core
#
# Patches package.json name and publishConfig for GitHub Packages, then runs npm publish.
# Run from repo root. Restores package.json after publish so the repo is left clean.

set -e

PKG_DIR="$1"
GITHUB_NAME="$2"

if [ -z "$PKG_DIR" ] || [ -z "$GITHUB_NAME" ]; then
  echo "Usage: $0 <package-dir> <github-package-name>"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [ ! -f "$PKG_DIR/package.json" ]; then
  echo "Not found: $PKG_DIR/package.json"
  exit 1
fi

# Patch package.json for GitHub Packages (scope must match repo owner)
node -e "
const fs = require('fs');
const path = require('path');
const pkgPath = path.join('$PKG_DIR', 'package.json');
const p = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
p.name = '$GITHUB_NAME';
p.publishConfig = p.publishConfig || {};
p.publishConfig.registry = 'https://npm.pkg.github.com';
fs.writeFileSync(pkgPath, JSON.stringify(p, null, 2));
"

cd "$PKG_DIR"
npm publish
cd "$ROOT"

# Restore package.json (git checkout so we don't leave it modified)
git checkout -- "$PKG_DIR/package.json"
