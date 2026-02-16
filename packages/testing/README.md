# @c.a.f/testing

Testing utilities and helpers for CAF applications. Provides mocks, test helpers, and utilities for testing UseCase, Ploc, Pulse, Workflow, Permission, I18n, and Validation.

## Installation

```bash
npm install @c.a.f/testing --save-dev
```

## Usage

### Core Testing Utilities

#### Testing Ploc

```typescript
import { createPlocTester, waitForStateChange } from '@c.a.f/testing/core';
import { Ploc } from '@c.a.f/core';

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
import { createPulseTester, waitForPulseValue } from '@c.a.f/testing/core';
import { pulse } from '@c.a.f/core';

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
import { createMockUseCase, createUseCaseTester, createSuccessResult } from '@c.a.f/testing/core';
import { UseCase } from '@c.a.f/core';

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

#### Testing RouteManager

```typescript
import { createMockRouteRepository, createRouteManagerTester } from '@c.a.f/testing/core';
import { RouteManager } from '@c.a.f/core';

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
import { createWorkflowTester, waitForWorkflowState } from '@c.a.f/testing/workflow';
import { WorkflowManager, WorkflowDefinition } from '@c.a.f/workflow';

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
import { createMockPermissionChecker, createPermissionTester } from '@c.a.f/testing/permission';
import { PermissionManager } from '@c.a.f/permission';

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
import { createMockTranslator, createTranslationTester } from '@c.a.f/testing/i18n';
import { TranslationManager } from '@c.a.f/i18n';

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
import { createMockValidator, createValidationTester } from '@c.a.f/testing/validation';

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

### Core Testing (`@c.a.f/testing/core`)

- `PlocTester` — Tester for Ploc instances
- `createPlocTester` — Create a Ploc tester
- `waitForStateChange` — Wait for state change matching predicate
- `waitForStateChanges` — Wait for specific number of state changes
- `PulseTester` — Tester for Pulse instances
- `createPulseTester` — Create a Pulse tester
- `waitForPulseValue` — Wait for pulse value matching predicate
- `MockUseCase` — Mock UseCase implementation
- `createMockUseCase` — Create a mock UseCase
- `UseCaseTester` — Tester for UseCase instances
- `createUseCaseTester` — Create a UseCase tester
- `createSuccessResult` — Create successful RequestResult
- `createErrorResult` — Create failed RequestResult
- `createLoadingResult` — Create loading RequestResult
- `MockRouteRepository` — Mock RouteRepository implementation
- `createMockRouteRepository` — Create a mock RouteRepository
- `RouteManagerTester` — Tester for RouteManager instances
- `createRouteManagerTester` — Create a RouteManager tester

### Workflow Testing (`@c.a.f/testing/workflow`)

- `WorkflowTester` — Tester for WorkflowManager instances
- `createWorkflowTester` — Create a Workflow tester
- `waitForWorkflowState` — Wait for workflow to reach specific state
- `waitForFinalState` — Wait for workflow to reach final state

### Permission Testing (`@c.a.f/testing/permission`)

- `MockPermissionChecker` — Mock PermissionChecker implementation
- `createMockPermissionChecker` — Create a mock PermissionChecker
- `PermissionTester` — Tester for PermissionManager instances
- `createPermissionTester` — Create a Permission tester

### I18n Testing (`@c.a.f/testing/i18n`)

- `MockTranslator` — Mock Translator implementation
- `createMockTranslator` — Create a mock Translator
- `TranslationTester` — Tester for TranslationManager instances
- `createTranslationTester` — Create a Translation tester

### Validation Testing (`@c.a.f/testing/validation`)

- `MockValidator` — Mock Validator implementation
- `createMockValidator` — Create a mock Validator
- `ValidationTester` — Tester for Validator instances
- `createValidationTester` — Create a Validation tester
- `expectSuccess` — Validate and expect success
- `expectFailure` — Validate and expect failure

## Dependencies

- `@c.a.f/core` — Core primitives
- `@c.a.f/workflow` — Workflow package (for workflow testing utilities)
- `@c.a.f/permission` — Permission package (for permission testing utilities)
- `@c.a.f/i18n` — I18n package (for i18n testing utilities)
- `@c.a.f/validation` — Validation package (for validation testing utilities)

## Dev Dependencies

- `vitest` — Testing framework (optional, works with any testing framework)

## License

MIT
