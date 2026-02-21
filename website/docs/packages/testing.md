---
title: "@c-a-f/testing"
sidebar_label: Testing
---

# @c-a-f/testing

Testing utilities and helpers for CAF applications. Mocks and test helpers for Ploc, Pulse, UseCase, repositories, RouteManager, and framework-specific rendering (React, Vue, Angular).

## Installation

```bash
npm install @c-a-f/testing --save-dev
```

## Features

### Core (`@c-a-f/testing/core`)

| Feature | Description |
|--------|-------------|
| **createPlocTester** | Track state changes; getStateChangeCount, getStateHistory, getLastStateChange. |
| **createMockPloc** | Ploc with controllable state (no business logic). |
| **waitForStateChange** | Wait for Ploc state to match a predicate. |
| **waitForStateChanges** | Wait for a specific number of state changes. |
| **assertStateHistory** | Assert state history matches expected. |
| **getStateHistorySnapshot** | Snapshot state history for tests. |
| **createPulseTester** | Track Pulse value changes. |
| **waitForPulseValue** | Wait for Pulse value to match predicate. |
| **createMockUseCase** | Mock UseCase with custom implementation. |
| **createMockUseCaseSuccess** | Mock that returns success with data. |
| **createMockUseCaseError** | Mock that returns error. |
| **createMockUseCaseAsync** | Mock that resolves after optional delay. |
| **createUseCaseTester** | Execute and assert on RequestResult. |
| **createSuccessResult, createErrorResult, createLoadingResult** | Build RequestResult for tests. |
| **createMockRepository** | Generic stub for I*Repository interfaces. |
| **createMockRepositoryStub** | Empty stub; assign or spy methods. |
| **createMockRouteRepository** | Mock RouteRepository. |
| **createRouteManagerTester** | Track route changes; getCurrentRoute, getRouteHistory. |
| **flushPromises** | Resolve pending microtasks. |
| **createPlocUseCaseContext** | Minimal Ploc + UseCase context for integration tests. |

### React (`@c-a-f/testing/react`)

| Feature | Description |
|--------|-------------|
| **renderWithCAF** | Render component wrapped in CAFProvider (plocs, useCases). |
| **createTestPloc** | Ploc with controllable state for component tests. |
| **waitForPlocState** | Wait for Ploc state to match predicate. |
| **mockUseCase** | mockUseCase.success(data), mockUseCase.error(error), mockUseCase.async(data, delayMs?), mockUseCase.fn(impl). |

### Vue (`@c-a-f/testing/vue`)

| Feature | Description |
|--------|-------------|
| **mountWithCAF** | Mount component with CAF context (plocs, useCases). |
| **createTestPloc** | Same as React. |
| **waitForPlocState** | Same as React. |
| **mockUseCase** | Same as React. |

### Angular (`@c-a-f/testing/angular`)

| Feature | Description |
|--------|-------------|
| **provideTestingCAF** | TestBed providers for plocs and useCases. |
| **createTestPloc** | Same as React. |
| **waitForPlocState** | Same as React. |
| **mockUseCase** | Same as React. |

### Optional subpackages

- **@c-a-f/testing/workflow** — createWorkflowTester, waitForWorkflowState, waitForFinalState  
- **@c-a-f/testing/permission** — createMockPermissionChecker, createPermissionTester  
- **@c-a-f/testing/i18n** — createMockTranslator, createTranslationTester  
- **@c-a-f/testing/validation** — createMockValidator, createValidationTester  

## Core: Ploc

```typescript
import { createPlocTester, waitForStateChange } from '@c-a-f/testing/core';

const ploc = new CounterPloc();
const tester = createPlocTester(ploc);
ploc.increment();
ploc.increment();
expect(tester.getStateChangeCount()).toBe(2);
expect(tester.getStateHistory()).toEqual([0, 1, 2]);
expect(tester.getLastStateChange()).toBe(2);
tester.cleanup();
```

## Core: Mock UseCase

```typescript
import { createMockUseCaseSuccess, createMockUseCaseError } from '@c-a-f/testing/core';

const useCase = createMockUseCaseSuccess([{ id: '1', name: 'John' }]);
const result = await useCase.execute();
expect(result.data.value).toHaveLength(1);

const errorUseCase = createMockUseCaseError(new Error('Failed'));
const errResult = await errorUseCase.execute();
expect(errResult.error.value?.message).toBe('Failed');
```

## Core: Mock repository

```typescript
import { createMockRepository, createMockRepositoryStub } from '@c-a-f/testing/core';

const repo = createMockRepository<IUserRepository>({
  getUsers: async () => [{ id: '1', name: 'John' }],
  getUserById: async (id) => ({ id, name: 'User ' + id }),
});
expect(await repo.getUsers()).toHaveLength(1);

const stub = createMockRepositoryStub<IUserRepository>();
stub.getUsers = vi.fn().mockResolvedValue([]);
```

## React: renderWithCAF

```tsx
import { renderWithCAF, createTestPloc } from '@c-a-f/testing/react';

const ploc = createTestPloc({ count: 5 });
renderWithCAF(<Counter />, { plocs: { counter: ploc } });
expect(screen.getByTestId('count')).toHaveTextContent('5');
```

## Angular: provideTestingCAF

```typescript
import { provideTestingCAF, createTestPloc, mockUseCase } from '@c-a-f/testing/angular';

TestBed.configureTestingModule({
  providers: [
    provideTestingCAF({
      plocs: { user: createTestPloc({ name: 'Test' }) },
      useCases: { createUser: mockUseCase.success({ id: '1' }) },
    }),
  ],
});
```

## Exports

- **@c-a-f/testing/core** — All core testers and mocks listed above  
- **@c-a-f/testing/react** — renderWithCAF, createTestPloc, waitForPlocState, mockUseCase  
- **@c-a-f/testing/vue** — mountWithCAF, createTestPloc, waitForPlocState, mockUseCase  
- **@c-a-f/testing/angular** — provideTestingCAF, createTestPloc, waitForPlocState, mockUseCase  

## Dependencies

- `@c-a-f/core` — Core primitives  
- Optional: @c-a-f/infrastructure-react, @c-a-f/infrastructure-vue, @c-a-f/infrastructure-angular for framework helpers  
- Optional: @c-a-f/workflow, @c-a-f/permission, @c-a-f/i18n, @c-a-f/validation for subpackage testers  
