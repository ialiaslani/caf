# @c-a-f/cli

CLI tool to scaffold CAF (Clean Architecture Frontend) project structure.

**Documentation:** [@c-a-f/cli docs](https://docs-caf.vercel.app/docs/packages/cli)

## Installation

### Quick Start (All Platforms)

```bash
# Using npx (works on Windows, Mac, Linux)
npx "@c-a-f/cli"

# Or install globally
npm install -g "@c-a-f/cli"
caf-init
```

**Windows Users**: The package now includes a `.cmd` wrapper file, so `npx` should work. If you encounter issues, install globally as a fallback.

### Platform-Specific Notes

- **Windows**: The package includes `caf-init.cmd` wrapper for Windows compatibility
- **Unix/Mac/Linux**: Uses the `.js` file with shebang (`#!/usr/bin/env node`)

Both methods work on all platforms!

## Usage

### Initialize CAF structure in current directory

```bash
npx @c-a-f/cli
# or
caf-init
```

### Initialize CAF structure in a specific directory

```bash
npx @c-a-f/cli ./my-project
# or
caf-init ./my-project
```

## What it creates

The CLI creates the following folder structure:

```
my-project/
│
├── caf/                    # CAF Architecture Layers
│   ├── domain/            # Domain Layer (Pure Business Logic)
│   │   ├── User/
│   │   │   ├── user.entities.ts
│   │   │   ├── user.irepository.ts
│   │   │   ├── user.service.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── application/       # Application Layer (Use Cases)
│   │   ├── User/
│   │   │   ├── Commands/
│   │   │   │   └── CreateUser.ts
│   │   │   ├── Queries/
│   │   │   │   └── GetUsers.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── infrastructure/    # Infrastructure Layer
│   │   ├── api/
│   │   │   ├── User/
│   │   │   │   ├── UserRepository.ts
│   │   │   │   ├── UserApi.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── index.ts
│
└── src/                    # Presentation Layer (UI)
    └── (your UI code here)
```

## Default Content

The CLI creates example files with:

- **Domain Layer**: User entity, repository interface, and service
- **Application Layer**: GetUsers query and CreateUser command
- **Infrastructure Layer**: UserRepository and UserApi implementations

All files include proper imports and follow CAF conventions.

## Next Steps

After running the CLI:

1. Install CAF dependencies:
   ```bash
   npm install @c-a-f/core @c-a-f/infrastructure-react
   ```

2. Customize the generated files for your domain

3. Create your UI components in `src/`

4. Start building your application!
