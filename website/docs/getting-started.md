---
sidebar_position: 2
title: Getting Started
---

# Getting Started

Get CAF running in a new or existing project in a few steps.

## Install

Install the core package and the infrastructure adapter for your framework.

```bash
# Core (required)
npm install @c-a-f/core

# Framework adapter (choose one)
npm install @c-a-f/infrastructure-react    # React
# OR
npm install @c-a-f/infrastructure-vue      # Vue
# OR
npm install @c-a-f/infrastructure-angular  # Angular

# Optional
npm install @c-a-f/validation             # Form validation (Zod, Yup)
npm install @c-a-f/testing --save-dev     # Test helpers
```

## Quick start with the CLI

The fastest way to scaffold a CAF project is the CLI:

**Windows:**

```powershell
npm install -g "@c-a-f/cli"
caf-init
npm install @c-a-f/core @c-a-f/infrastructure-react
```

**Unix / Mac:**

```bash
npx "@c-a-f/cli"
npm install @c-a-f/core @c-a-f/infrastructure-react
```

This creates the `caf/` folder with example domain, application, and infrastructure code.

## Manual setup

1. **Create the `caf/` folder** with:
   - `caf/domain/` — Entities and repository interfaces (`I*Repository`)
   - `caf/application/` — Use cases and Plocs
   - `caf/infrastructure/` — Repository implementations (API, mocks)
   - `caf/setup.ts` — Wire repositories, use cases, and Plocs; export a function that returns the Plocs you need
   - `caf/index.ts` — Re-export domain, application, infrastructure, and setup

2. **At app root**, create your Plocs and wrap the app with the provider:

```tsx
// React example
import { CAFProvider } from '@c-a-f/infrastructure-react';
import { setupUserPloc } from './caf/setup';

const userPloc = setupUserPloc();

export default function App() {
  return (
    <CAFProvider plocs={{ user: userPloc }}>
      <YourApp />
    </CAFProvider>
  );
}
```

3. **In components**, read state and call methods:

```tsx
import { usePlocFromContext, usePloc } from '@c-a-f/infrastructure-react';

function UserList() {
  const ploc = usePlocFromContext('user');
  if (!ploc) return null;
  const [state] = usePloc(ploc);
  return (
    <ul>
      {state.users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

## Next

- [Install & packages](/docs/install) — All packages and options
- [Quick start (code)](/docs/quick-start) — Minimal Ploc + UseCase example
- [Best practices](/docs/guides/best-practices) — Structure and patterns
