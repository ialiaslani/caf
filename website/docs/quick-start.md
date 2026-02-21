---
sidebar_position: 2
title: Quick start (code)
---

# Quick start (code)

Minimal example: a counter with a Ploc and a UseCase-style update.

## 1. Domain (optional for a counter)

For a simple counter you can skip domain. For real apps, define entities and `I*Repository` in `caf/domain/`.

## 2. Application: Ploc

```typescript
// caf/application/Counter/Ploc/CounterPloc.ts
import { Ploc } from '@c-a-f/core';

export interface CounterState {
  count: number;
}

export class CounterPloc extends Ploc<CounterState> {
  constructor() {
    super({ count: 0 });
  }

  increment() {
    this.changeState({ ...this.state, count: this.state.count + 1 });
  }

  decrement() {
    this.changeState({ ...this.state, count: this.state.count - 1 });
  }
}
```

## 3. Setup and provide (React)

```tsx
// caf/setup.ts
import { CounterPloc } from './application/Counter/Ploc/CounterPloc';

export function setupCounterPloc() {
  return new CounterPloc();
}

// App.tsx
import { CAFProvider } from '@c-a-f/infrastructure-react';
import { usePlocFromContext, usePloc } from '@c-a-f/infrastructure-react';
import { setupCounterPloc } from './caf/setup';

const counterPloc = setupCounterPloc();

function Counter() {
  const ploc = usePlocFromContext('counter');
  if (!ploc) return null;
  const [state] = usePloc(ploc);
  return (
    <div>
      <span>{state.count}</span>
      <button onClick={() => ploc.increment()}>+</button>
      <button onClick={() => ploc.decrement()}>-</button>
    </div>
  );
}

export default function App() {
  return (
    <CAFProvider plocs={{ counter: counterPloc }}>
      <Counter />
    </CAFProvider>
  );
}
```

## 4. With a UseCase (async)

When you need async work (e.g. API), define a UseCase that returns `RequestResult<T>` and call it from the Ploc or from the component via `useUseCase`. See [Best practices](/docs/guides/best-practices) and the main repo [packages/core README](https://github.com/ialiaslani/caf/blob/main/packages/core/README.md).
