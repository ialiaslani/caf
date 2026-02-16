# @c.a.f/cli

CLI tool to scaffold CAF (Clean Architecture Frontend) project structure.

## Installation

```bash
npm install -g @c.a.f/cli
# or
npx @c.a.f/cli
```

## Usage

### Initialize CAF structure in current directory

```bash
npx @c.a.f/cli
# or
caf-init
```

### Initialize CAF structure in a specific directory

```bash
npx @c.a.f/cli ./my-project
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
   npm install @c.a.f/core @c.a.f/infrastructure-react
   ```

2. Customize the generated files for your domain

3. Create your UI components in `src/`

4. Start building your application!
