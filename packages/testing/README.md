# @c-a-f/testing

Testing utilities and helpers for CAF applications. Provides mocks, test helpers, and utilities for testing UseCase, Ploc, Pulse, Workflow, Permission, I18n, and Validation.

## Installation

```bash
npm install @c-a-f/testing --save-dev
```

## Usage

### Core Testing Utilities

#### Testing Ploc

```typescript
import { createPlocTester, waitForStateChange } from '@c-a-f/testing/core';
import { Ploc } from '@c-a-f/core';

class CounterPloc extends Ploc<number> {
  constructor() {
    super(0);
  }
  increment() {
    this.changeState(this.state + 1);
  }
}

describe('CounterPloc', () => {
  it('tracks state changes', () => {
    const ploc = new CounterPloc();
    const tester = createPlocTester(ploc);

    ploc.increment();
    ploc.increment();

    expect(tester.getStateChangeCount()).toBe(2);
    expect(tester.getStateHistory()).toEqual([0, 1, 2]);
    expect(tester.getLastStateChange()).toBe(2);

    tester.cleanup();
  });

  it('waits for state change', async () => {
    const ploc = new CounterPloc();
    
    setTimeout(() => ploc.increment(), 100);
    const finalState = await waitForStateChange(ploc, (state) => state === 1);

    expect(finalState).toBe(1);
  });
});
```

#### Testing Pulse

```typescript
import { createPulseTester, waitForPulseValue } from '@c-a-f/testing/core';
import { pulse } from '@c-a-f/core';

describe('Pulse', () => {
  it('tracks value changes', () => {
    const count = pulse(0);
    const tester = createPulseTester(count);

    count.value = 5;
    count.value = 10;

    expect(tester.getValueChangeCount()).toBe(2);
    expect(tester.getValueHistory()).toEqual([0, 5, 10]);
    expect(tester.getLastValueChange()).toBe(10);

    tester.cleanup();
  });

  it('waits for pulse value', async () => {
    const count = pulse(0);
    
    setTimeout(() => { count.value = 5; }, 100);
    const finalValue = await waitForPulseValue(count, (value) => value === 5);

    expect(finalValue).toBe(5);
  });
});
```

#### Testing UseCase

```typescript
import {
  createMockUseCase,
  createMockUseCaseSuccess,
  createMockUseCaseError,
  createUseCaseTester,
  createSuccessResult,
} from '@c-a-f/testing/core';
import { UseCase } from '@c-a-f/core';

describe('UseCase', () => {
  it('creates and tests mock use case', async () => {
    const mockUseCase = createMockUseCase<[], string>(() =>
      createSuccessResult('result')
    );
    const tester = createUseCaseTester(mockUseCase);

    const result = await tester.execute([]);
    expect(result.data.value).toBe('result');
    expect(result.error.value).toBeNull();
  });

  it('uses success shortcut', async () => {
    const useCase = createMockUseCaseSuccess([{ id: '1', name: 'John' }]);
    const result = await useCase.execute();
    expect(result.data.value).toEqual([{ id: '1', name: 'John' }]);
  });

  it('uses error shortcut', async () => {
    const useCase = createMockUseCaseError(new Error('Failed'));
    const result = await useCase.execute();
    expect(result.error.value?.message).toBe('Failed');
  });

  it('executes and gets data', async () => {
    const mockUseCase = createMockUseCase<[number], number>((count) =>
      createSuccessResult(count * 2)
    );
    const tester = createUseCaseTester(mockUseCase);

    const data = await tester.executeAndGetData([5]);
    expect(data).toBe(10);
  });
});
```

#### Mock Ploc and state history (snapshot)

```typescript
import {
  createMockPloc,
  createPlocTester,
  assertStateHistory,
  getStateHistorySnapshot,
} from '@c-a-f/testing/core';

it('mock Ploc and state history', () => {
  const ploc = createMockPloc({ count: 0 });
  const tester = createPlocTester(ploc);

  ploc.changeState({ count: 1 });
  ploc.changeState({ count: 2 });

  assertStateHistory(tester, [{ count: 0 }, { count: 1 }, { count: 2 }]);
  expect(getStateHistorySnapshot(tester)).toMatchSnapshot();
  tester.cleanup();
});
```

#### Mock Repository (domain I*Repository)

```typescript
import { createMockRepository, createMockRepositoryStub } from '@c-a-f/testing/core';
import type { IUserRepository } from '../domain';

it('mocks repository', async () => {
  const repo = createMockRepository<IUserRepository>({
    getUsers: async () => [{ id: '1', name: 'John' }],
    getUserById: async (id) => ({ id, name: 'User ' + id }),
  });

  expect(await repo.getUsers()).toHaveLength(1);
  expect((await repo.getUserById('2'))?.name).toBe('User 2');
});

it('stub and spy', async () => {
  const stub = createMockRepositoryStub<IUserRepository>();
  stub.getUsers = vi.fn().mockResolvedValue([]);
  await stub.getUsers();
  expect(stub.getUsers).toHaveBeenCalledTimes(1);
});
```

#### Integration test helpers

```typescript
import {
  createPlocUseCaseContext,
  flushPromises,
} from '@c-a-f/testing/core';

it('integration context', async () => {
  const { ploc, useCase } = createPlocUseCaseContext(
    { items: [], loading: false },
    [{ id: '1', name: 'Item' }]
  );
  // Use with CAFProvider or pass as props
  expect(ploc.state.loading).toBe(false);
  const result = await useCase.execute();
  expect(result.data.value).toHaveLength(1);
  await flushPromises();
});
```

### React Testing Utilities (`@c-a-f/testing/react`)

Use these when testing React components that use `usePlocFromContext`, `useUseCaseFromContext`, or `usePloc` / `useUseCase` with context-provided instances.

**Requirements:** `react` and `@testing-library/react` (peer dependencies). Install in your app:

```bash
npm install react @testing-library/react
```

#### renderWithCAF

Render a component wrapped in `CAFProvider` so Ploc/UseCase context is available:

```tsx
import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithCAF, createTestPloc, mockUseCase } from '@c-a-f/testing/react';
import { usePlocFromContext, usePloc } from '@c-a-f/infrastructure-react';

const Counter = () => {
  const ploc = usePlocFromContext('counter');
  if (!ploc) return null;
  const [state] = usePloc(ploc);
  return <span data-testid="count">{state.count}</span>;
};

it('renders with CAF context', () => {
  const ploc = createTestPloc({ count: 5 });
  renderWithCAF(<Counter />, { plocs: { counter: ploc } });
  expect(screen.getByTestId('count')).toHaveTextContent('5');
});
```

#### createTestPloc

Create a Ploc with controllable state (no business logic). Same idea as `createMockPloc` from core, for use in React tests:

```tsx
const ploc = createTestPloc({ count: 0 });
renderWithCAF(<Counter />, { plocs: { counter: ploc } });
ploc.changeState({ count: 1 });
expect(screen.getByTestId('count')).toHaveTextContent('1');
```

#### waitForPlocState

Wait for a Ploc to reach a state matching a predicate (e.g. after an async update):

```tsx
const ploc = createTestPloc({ loading: true, items: [] });
renderWithCAF(<List />, { plocs: { list: ploc } });
ploc.changeState({ loading: false, items: [{ id: '1' }] });
await waitForPlocState(ploc, (state) => !state.loading && state.items.length > 0);
expect(screen.getByText('1')).toBeInTheDocument();
```

#### mockUseCase

Create mock UseCases for context:

```tsx
const submit = mockUseCase.success({ id: '1' });
const load = mockUseCase.error(new Error('Network error'));
const search = mockUseCase.async([{ id: '1' }], 50); // resolves after 50ms

renderWithCAF(<Form />, { useCases: { submit, load, search } });
```

- `mockUseCase.success(data)` — always returns success with `data`
- `mockUseCase.error(error)` — always returns `error`
- `mockUseCase.async(data, delayMs?)` — resolves with `data` after optional delay
- `mockUseCase.fn(implementation)` — custom implementation (same as `createMockUseCase` from core)

### Vue Testing Utilities (`@c-a-f/testing/vue`)

Use these when testing Vue components that use `usePlocFromContext`, `useUseCaseFromContext`, or `useCAFContext`.

**Requirements:** `vue` and `@vue/test-utils` (peer dependencies). Install in your app:

```bash
npm install vue @vue/test-utils
```

#### mountWithCAF

Mount a component with CAF context (Plocs/UseCases) so inject works:

```ts
import { mount } from '@vue/test-utils';
import { mountWithCAF, createTestPloc, mockUseCase } from '@c-a-f/testing/vue';
import { usePlocFromContext, usePloc } from '@c-a-f/infrastructure-vue';

const Counter = defineComponent({
  setup() {
    const ploc = usePlocFromContext('counter');
    const [state] = usePloc(ploc!);
    return () => h('span', { 'data-testid': 'count' }, state.count);
  },
});

it('renders with CAF context', () => {
  const ploc = createTestPloc({ count: 5 });
  const wrapper = mountWithCAF(Counter, { plocs: { counter: ploc } });
  expect(wrapper.get('[data-testid="count"]').text()).toBe('5');
});
```

#### createTestPloc / waitForPlocState / mockUseCase

Same as React: use `createTestPloc`, `waitForPlocState`, and `mockUseCase` with `mountWithCAF` for Vue component tests.

### Angular Testing Utilities (`@c-a-f/testing/angular`)

Use these when testing Angular components that use `injectPlocFromContext`, `injectUseCaseFromContext`, or `injectCAFContext`.

**Requirements:** `@angular/core` and `@c-a-f/infrastructure-angular` (peer/dependency). Install in your app:

```bash
npm install @angular/core @c-a-f/infrastructure-angular
```

#### provideTestingCAF

Provide CAF context in `TestBed` so injection works:

```ts
import { TestBed } from '@angular/core/testing';
import { provideTestingCAF, createTestPloc, mockUseCase } from '@c-a-f/testing/angular';

const ploc = createTestPloc({ count: 0 });
await TestBed.configureTestingModule({
  imports: [MyComponent],
  providers: [
    provideTestingCAF({
      plocs: { counter: ploc },
      useCases: { submit: mockUseCase.success({ id: '1' }) },
    }),
  ],
}).compileComponents();

const fixture = TestBed.createComponent(MyComponent);
```

#### createTestPloc / waitForPlocState / mockUseCase

Same as React/Vue: use `createTestPloc`, `waitForPlocState`, and `mockUseCase` with `provideTestingCAF` in your Angular tests.

#### Testing RouteManager

```typescript
import { createMockRouteRepository, createRouteManagerTester } from '@c-a-f/testing/core';
import { RouteManager } from '@c-a-f/core';

describe('RouteManager', () => {
  it('tracks route changes', async () => {
    const mockRepo = createMockRouteRepository();
    const routeManager = new RouteManager(mockRepo);
    const tester = createRouteManagerTester(routeManager);

    await tester.changeRoute('/dashboard');
    expect(tester.getCurrentRoute()).toBe('/dashboard');
    expect(tester.getRouteHistory()).toContain('/dashboard');
  });
});
```

### Workflow Testing Utilities

```typescript
import { createWorkflowTester, waitForWorkflowState } from '@c-a-f/testing/workflow';
import { WorkflowManager, WorkflowDefinition } from '@c-a-f/workflow';

describe('Workflow', () => {
  it('tracks workflow state changes', async () => {
    const workflow = new WorkflowManager(definition);
    const tester = createWorkflowTester(workflow);

    await tester.dispatch('approve');
    await waitForWorkflowState(workflow, 'approved');

    expect(tester.getCurrentState()).toBe('approved');
    expect(tester.getStateHistory().length).toBeGreaterThan(1);

    tester.cleanup();
  });

  it('waits for final state', async () => {
    const workflow = new WorkflowManager(definition);
    
    await workflow.dispatch('complete');
    const finalState = await waitForFinalState(workflow);

    expect(finalState.isFinal).toBe(true);
  });
});
```

### Permission Testing Utilities

```typescript
import { createMockPermissionChecker, createPermissionTester } from '@c-a-f/testing/permission';
import { PermissionManager } from '@c-a-f/permission';

describe('Permission', () => {
  it('tests permission checking', async () => {
    const mockChecker = createMockPermissionChecker(['user.edit', 'post.create']);
    const manager = new PermissionManager(mockChecker);
    const tester = createPermissionTester(manager);

    expect(await tester.hasPermission('user.edit')).toBe(true);
    expect(await tester.hasPermission('user.delete')).toBe(false);
    expect(await tester.hasAnyPermission(['user.edit', 'user.delete'])).toBe(true);
  });

  it('modifies permissions dynamically', () => {
    const mockChecker = createMockPermissionChecker(['user.view']);
    
    mockChecker.addPermission('user.edit');
    expect(mockChecker.check('user.edit').granted).toBe(true);

    mockChecker.removePermission('user.view');
    expect(mockChecker.check('user.view').granted).toBe(false);
  });
});
```

### I18n Testing Utilities

```typescript
import { createMockTranslator, createTranslationTester } from '@c-a-f/testing/i18n';
import { TranslationManager } from '@c-a-f/i18n';

describe('I18n', () => {
  it('tests translation', () => {
    const mockTranslator = createMockTranslator({
      en: { greeting: 'Hello', welcome: 'Welcome {{name}}' },
      fa: { greeting: 'سلام', welcome: 'خوش آمدید {{name}}' },
    });
    const manager = new TranslationManager(mockTranslator);
    const tester = createTranslationTester(manager);

    expect(tester.t('greeting')).toBe('Hello');
    expect(tester.translateWithValues('welcome', { name: 'John' })).toBe('Welcome John');
  });

  it('tests language switching', async () => {
    const mockTranslator = createMockTranslator({
      en: { greeting: 'Hello' },
      fa: { greeting: 'سلام' },
    });
    const manager = new TranslationManager(mockTranslator);
    const tester = createTranslationTester(manager);

    expect(tester.getCurrentLanguage()).toBe('en');
    await tester.changeLanguage('fa');
    expect(tester.getCurrentLanguage()).toBe('fa');
    expect(tester.t('greeting')).toBe('سلام');
  });
});
```

### Validation Testing Utilities

```typescript
import { createMockValidator, createValidationTester } from '@c-a-f/testing/validation';

describe('Validation', () => {
  it('tests validation', async () => {
    const mockValidator = createMockValidator((data: any) => {
      return data.email && data.email.includes('@');
    });
    const tester = createValidationTester(mockValidator);

    const successResult = await tester.expectSuccess({ email: 'test@example.com' });
    expect(successResult.email).toBe('test@example.com');

    const errors = await tester.expectFailure({ email: 'invalid' });
    expect(errors.length).toBeGreaterThan(0);
  });
});
```

## Exports

### Core Testing (`@c-a-f/testing/core`)

- `PlocTester` — Tester for Ploc instances
- `createPlocTester` — Create a Ploc tester
- `createMockPloc` — Create a Ploc with controllable state (no logic)
- `MockPloc` — Concrete Ploc class for tests
- `waitForStateChange` — Wait for state change matching predicate
- `waitForStateChanges` — Wait for specific number of state changes
- `assertStateHistory` — Assert state history matches expected (snapshot-style)
- `getStateHistorySnapshot` / `getStateHistorySnapshotJson` — Snapshot state history
- `PulseTester` — Tester for Pulse instances
- `createPulseTester` — Create a Pulse tester
- `waitForPulseValue` — Wait for pulse value matching predicate
- `MockUseCase` — Mock UseCase implementation
- `createMockUseCase` — Create a mock UseCase
- `createMockUseCaseSuccess` — Mock UseCase that returns success with data
- `createMockUseCaseError` — Mock UseCase that returns an error
- `createMockUseCaseAsync` — Mock UseCase that resolves after optional delay
- `UseCaseTester` — Tester for UseCase instances
- `createUseCaseTester` — Create a UseCase tester
- `createSuccessResult` — Create successful RequestResult
- `createErrorResult` — Create failed RequestResult
- `createLoadingResult` — Create loading RequestResult
- `createMockRepository` — Generic stub for domain I*Repository interfaces
- `createMockRepositoryStub` — Empty repository stub (assign or spy methods)
- `flushPromises` — Resolve pending microtasks in integration tests
- `runWithFakeTimers` — Placeholder for running code with fake timers
- `createPlocUseCaseContext` — Minimal Ploc + UseCase context for integration tests
- `MockRouteRepository` — Mock RouteRepository implementation
- `createMockRouteRepository` — Create a mock RouteRepository
- `RouteManagerTester` — Tester for RouteManager instances
- `createRouteManagerTester` — Create a RouteManager tester

### Workflow Testing (`@c-a-f/testing/workflow`)

- `WorkflowTester` — Tester for WorkflowManager instances
- `createWorkflowTester` — Create a Workflow tester
- `waitForWorkflowState` — Wait for workflow to reach specific state
- `waitForFinalState` — Wait for workflow to reach final state

### Permission Testing (`@c-a-f/testing/permission`)

- `MockPermissionChecker` — Mock PermissionChecker implementation
- `createMockPermissionChecker` — Create a mock PermissionChecker
- `PermissionTester` — Tester for PermissionManager instances
- `createPermissionTester` — Create a Permission tester

### I18n Testing (`@c-a-f/testing/i18n`)

- `MockTranslator` — Mock Translator implementation
- `createMockTranslator` — Create a mock Translator
- `TranslationTester` — Tester for TranslationManager instances
- `createTranslationTester` — Create a Translation tester

### Validation Testing (`@c-a-f/testing/validation`)

- `MockValidator` — Mock Validator implementation
- `createMockValidator` — Create a mock Validator
- `ValidationTester` — Tester for Validator instances
- `createValidationTester` — Create a Validation tester
- `expectSuccess` — Validate and expect success
- `expectFailure` — Validate and expect failure

### React Testing (`@c-a-f/testing/react`)

- `renderWithCAF` — Render with CAFProvider (Ploc/UseCase context)
- `RenderWithCAFOptions` — Options for renderWithCAF (plocs, useCases, and RTL options)
- `createTestPloc` — Create a test Ploc with controllable state
- `waitForPlocState` — Wait for Ploc state to match a predicate
- `mockUseCase` — Mock UseCase helpers: `success`, `error`, `async`, `fn`

### Vue Testing (`@c-a-f/testing/vue`)

- `mountWithCAF` — Mount with CAF context (Ploc/UseCase provide)
- `MountWithCAFOptions` — Options for mountWithCAF (plocs, useCases, and Vue Test Utils options)
- `createTestPloc` — Create a test Ploc with controllable state
- `waitForPlocState` — Wait for Ploc state to match a predicate
- `mockUseCase` — Mock UseCase helpers: `success`, `error`, `async`, `fn`

### Angular Testing (`@c-a-f/testing/angular`)

- `provideTestingCAF` — Provide CAF context for TestBed (plocs, useCases)
- `ProvideTestingCAFConfig` — Config for provideTestingCAF
- `createTestPloc` — Create a test Ploc with controllable state
- `waitForPlocState` — Wait for Ploc state to match a predicate
- `mockUseCase` — Mock UseCase helpers: `success`, `error`, `async`, `fn`

## Dependencies

- `@c-a-f/core` — Core primitives
- `@c-a-f/infrastructure-react` — React provider (for `@c-a-f/testing/react`)
- `@c-a-f/infrastructure-vue` — Vue provider (for `@c-a-f/testing/vue`)
- `@c-a-f/infrastructure-angular` — Angular provider (for `@c-a-f/testing/angular`)
- `@c-a-f/workflow` — Workflow package (for workflow testing utilities)
- `@c-a-f/permission` — Permission package (for permission testing utilities)
- `@c-a-f/i18n` — I18n package (for i18n testing utilities)
- `@c-a-f/validation` — Validation package (for validation testing utilities)

**Framework testing:** Optional peer dependencies per entry point:
- `@c-a-f/testing/react`: `react`, `@testing-library/react`
- `@c-a-f/testing/vue`: `vue`, `@vue/test-utils`
- `@c-a-f/testing/angular`: `@angular/core`

## Dev Dependencies

- `vitest` — Testing framework (optional, works with any testing framework)

## License

MIT
