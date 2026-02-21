---
title: "@c-a-f/devtools"
sidebar_label: DevTools
---

# @c-a-f/devtools

Development tools and debugging utilities for CAF. State tracking, time-travel debugging, logging, performance profiling, memory leak detection, and inspection for Ploc, Pulse, UseCase, ApiRequest, and Workflow.

## Installation

```bash
npm install @c-a-f/devtools --save-dev
```

## Features

| Feature | Description |
|--------|-------------|
| **Ploc DevTools** | Track state changes, state history, time-travel (previousState, nextState, jumpToState), reset. |
| **Pulse DevTools** | Track value changes, value history, time-travel. |
| **UseCase DevTools** | Track execution history, timing, errors; wrap UseCase; get statistics (totalExecutions, averageDuration). |
| **ApiRequest DevTools** | Track requests, loading/data/error, request history, statistics. |
| **Workflow DevTools** | Track state transitions, transition history, available transitions, statistics. (`@c-a-f/devtools/workflow`) |
| **Memory leak detection** | Track subscriptions; warn/error after threshold; detectLeaks(), getStatistics(). |
| **Performance profiler** | measureExecution, measureSync, measureRender; slow operation tracking; getReport(), getSlowOperations(). |
| **DevTools logger** | Centralized logger with levels (DEBUG, INFO, WARN, ERROR). (`@c-a-f/devtools/logger`) |
| **State inspector** | Inspect and compare application state. (`@c-a-f/devtools/inspector`) |

## Ploc DevTools

```typescript
import { createPlocDevTools } from '@c-a-f/devtools/core';
import { Ploc } from '@c-a-f/core';

const ploc = new CounterPloc();
const devTools = createPlocDevTools(ploc, { name: 'CounterPloc', enabled: true });

ploc.increment();
ploc.increment();

const history = devTools.getStateHistory();
devTools.jumpToState(1);
devTools.previousState();
devTools.nextState();
devTools.reset();
devTools.cleanup();
```

## Pulse DevTools

```typescript
import { createPulseDevTools } from '@c-a-f/devtools/core';
import { pulse } from '@c-a-f/core';

const count = pulse(0);
const devTools = createPulseDevTools(count, { name: 'count', enabled: true });
count.value = 5;
count.value = 10;
const history = devTools.getValueHistory();
devTools.jumpToValue(1);
devTools.previousValue();
devTools.nextValue();
```

## UseCase DevTools

```typescript
import { createUseCaseDevTools, wrapUseCase } from '@c-a-f/devtools/core';

const devTools = createUseCaseDevTools({ name: 'GetUsers', enabled: true, logExecutionTime: true });
const wrappedUseCase = wrapUseCase(useCase, devTools);
await wrappedUseCase.execute();

const history = devTools.getExecutionHistory();
const stats = devTools.getStatistics();
// { totalExecutions, successfulExecutions, failedExecutions, averageDuration }
```

## ApiRequest DevTools

```typescript
import { createApiRequestDevTools, wrapApiRequest } from '@c-a-f/devtools/core';

const devTools = createApiRequestDevTools(apiRequest, { name: 'GetUsers', enabled: true, logExecutionTime: true });
const wrappedRequest = wrapApiRequest(apiRequest, devTools);
await wrappedRequest.mutate();

const history = devTools.getRequestHistory();
const stats = devTools.getStatistics();
const state = devTools.getCurrentState();
devTools.cleanup();
```

## Memory leak detection

```typescript
import { createMemoryLeakDetector } from '@c-a-f/devtools/core';

const leakDetector = createMemoryLeakDetector({
  enabled: true,
  warnThreshold: 10000,
  errorThreshold: 60000,
  checkInterval: 5000,
  includeStackTraces: true,
});

const cleanup = leakDetector.trackSubscription('Ploc', 'UserPloc', () => ploc.unsubscribe(listener), { component: 'UserProfile' });

const leaks = leakDetector.detectLeaks();
const stats = leakDetector.getStatistics();
cleanup();
leakDetector.cleanup();
```

Can be passed to `createPlocDevTools(ploc, { enableLeakDetection: true, leakDetector })`.

## Performance profiler

```typescript
import { createPerformanceProfiler, measureExecution, measureSync } from '@c-a-f/devtools/core';

const profiler = createPerformanceProfiler({
  enabled: true,
  trackSlowOperations: true,
  slowThreshold: 100,
  maxMeasurements: 1000,
});

const users = await measureExecution('fetchUsers', async () => fetch('/api/users').then(r => r.json()), profiler);
const result = measureSync('processData', () => data.map(transform), profiler);

const endMeasure = profiler.startMeasure('customOperation', 'execution');
// ... do work ...
endMeasure();

const endRender = profiler.measureRender('UserProfile');
// ... render ...
endRender();

const report = profiler.getReport();
const stats = profiler.getStatisticsFor('fetchUsers');
const slowOps = profiler.getSlowOperations(200);
```

Can be passed to UseCase DevTools and ApiRequest DevTools for automatic execution timing.

## Workflow DevTools

```typescript
import { createWorkflowDevTools } from '@c-a-f/devtools/workflow';

const devTools = createWorkflowDevTools(workflow, { name: 'OrderWorkflow', enabled: true });
await workflow.dispatch('approve');
await workflow.dispatch('ship');

const history = devTools.getTransitionHistory();
const stats = devTools.getStatistics();
const transitions = devTools.getAvailableTransitions();
```

## Logger

```typescript
import { DevToolsLogger, LogLevel } from '@c-a-f/devtools/logger';

const logger = new DevToolsLogger({
  level: LogLevel.DEBUG,
  enabled: true,
  includeTimestamp: true,
  includeLevel: true,
});

logger.debug('Debug message', { data: 'value' });
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
logger.setLevel(LogLevel.WARN);
logger.enable();
logger.disable();
```

## State inspector

```typescript
import { createStateInspector } from '@c-a-f/devtools/inspector';

const inspector = createStateInspector();
inspector.inspect('CounterPloc', ploc.state);
inspector.inspect('UserPulse', userPulse.value);
inspector.inspect('WorkflowState', workflow.getState());

const states = inspector.getAllStates();
const comparison = inspector.compare('CounterPloc', 'UserPulse');
const names = inspector.getStateNames();
inspector.removeState('CounterPloc');
inspector.clear();
```

## Exports

- **@c-a-f/devtools/core:** createPlocDevTools, createPulseDevTools, createUseCaseDevTools, wrapUseCase, createApiRequestDevTools, wrapApiRequest, createMemoryLeakDetector, createPerformanceProfiler, measureExecution, measureSync
- **@c-a-f/devtools/workflow:** createWorkflowDevTools
- **@c-a-f/devtools/logger:** DevToolsLogger, LogLevel, createDevToolsLogger
- **@c-a-f/devtools/inspector:** StateInspector, createStateInspector

## Dependencies

- `@c-a-f/core` — Core primitives  
- `@c-a-f/workflow` — For workflow DevTools
