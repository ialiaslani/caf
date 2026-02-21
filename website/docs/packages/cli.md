---
title: "@c-a-f/cli"
sidebar_label: CLI
---

# @c-a-f/cli

CLI tool to scaffold CAF (Clean Architecture Frontend) project structure. Creates the `caf/` folder with domain, application, and infrastructure layers and example files.

## Installation

**Global (recommended on Windows):**

```bash
npm install -g @c-a-f/cli
```

**Run with npx (all platforms):**

```bash
npx @c-a-f/cli
```

Windows users: if `npx` has issues with scoped packages, install globally and use `caf-init`.

## Usage

### Initialize in current directory

```bash
npx @c-a-f/cli
# or
caf-init
```

### Initialize in a specific directory

```bash
npx @c-a-f/cli ./my-project
# or
caf-init ./my-project
```

## What it creates

The CLI creates the following structure:

```
my-project/
├── caf/
│   ├── domain/           # Domain layer (entities, repository interfaces, services)
│   │   ├── User/
│   │   │   ├── user.entities.ts
│   │   │   ├── user.irepository.ts
│   │   │   ├── user.service.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── application/      # Application layer (use cases)
│   │   ├── User/
│   │   │   ├── Commands/
│   │   │   │   └── CreateUser.ts
│   │   │   ├── Queries/
│   │   │   │   └── GetUsers.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── infrastructure/   # Infrastructure layer (API, mocks)
│   │   ├── api/
│   │   │   ├── User/
│   │   │   │   ├── UserRepository.ts
│   │   │   │   ├── UserApi.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts
└── src/                  # Your UI code
```

## Default content

- **Domain:** User entity, `IUserRepository` interface, UserService.  
- **Application:** GetUsers query and CreateUser command.  
- **Infrastructure:** UserRepository and UserApi implementations.  

All files include proper imports and follow CAF conventions.

## Next steps

After running the CLI:

1. Install CAF dependencies:
   ```bash
   npm install @c-a-f/core @c-a-f/infrastructure-react
   ```
2. Customize the generated files for your domain.  
3. Create your UI components in `src/`.  
4. Wire Plocs and UseCases at app root with `CAFProvider` (see [Infrastructure React](/docs/packages/infrastructure-react)).  

## Platform notes

- **Windows:** Package includes `caf-init.cmd` for compatibility; global install is recommended if npx fails.  
- **Unix/Mac/Linux:** Uses the `.js` file with shebang; `npx @c-a-f/cli` or global `caf-init` both work.  

## Exports

CLI is a runnable package; no library exports. Commands: init (default), optionally with target directory.
