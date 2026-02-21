# @c-a-f/devtools

Development tools and debugging utilities for CAF applications. Provides state tracking, time-travel debugging, logging, and inspection utilities for Ploc, Pulse, UseCase, ApiRequest, and Workflow.

**Documentation:** [@c-a-f/devtools docs](https://docs-caf.vercel.app/docs/packages/devtools)

## Installation

```bash
npm install @c-a-f/devtools --save-dev
```

## Usage

### Ploc DevTools

Track state changes and enable time-travel debugging for Ploc instances:

```typescript
import { createPlocDevTools } from '@c-a-f/devtools/core';
import { Ploc } from '@c-a-f/core';

class CounterPloc extends Ploc<number> {
  constructor() {
    super(0);
  }
  increment() {
    this.changeState(this.state + 1);
  }
}

const ploc = new CounterPloc();
const devTools = createPlocDevTools(ploc, {
  name: 'CounterPloc',
  enabled: true,
});

// State changes are automatically tracked and logged
ploc.increment();
ploc.increment();

// Get state history
const history = devTools.getStateHistory();
console.log('State history:', history);

// Time-travel debugging
devTools.jumpToState(1); // Jump to second state
devTools.previousState(); // Go to previous state
devTools.nextState(); // Go to next state
devTools.reset(); // Reset to initial state

// Cleanup
devTools.cleanup();
```

### Pulse DevTools

Track value changes for Pulse instances:

```typescript
import { createPulseDevTools } from '@c-a-f/devtools/core';
import { pulse } from '@c-a-f/core';

const count = pulse(0);
const devTools = createPulseDevTools(count, {
  name: 'count',
  enabled: true,
});

count.value = 5;
count.value = 10;

// Get value history
const history = devTools.getValueHistory();
console.log('Value history:', history);

// Time-travel debugging
devTools.jumpToValue(1); // Jump to second value
devTools.previousValue(); // Go to previous value
devTools.nextValue(); // Go to next value
```

### UseCase DevTools

Track UseCase execution with timing and error logging:

```typescript
import { createUseCaseDevTools, wrapUseCase } from '@c-a-f/devtools/core';
import { UseCase } from '@c-a-f/core';

class GetUsers implements UseCase<[], User[]> {
  async execute(): Promise<RequestResult<User[]>> {
    // Implementation
  }
}

const useCase = new GetUsers();
const devTools = createUseCaseDevTools({
  name: 'GetUsers',
  enabled: true,
  logExecutionTime: true,
});

// Wrap use case with DevTools
const wrappedUseCase = wrapUseCase(useCase, devTools);

// Execute (will be logged)
await wrappedUseCase.execute();

// Get execution history
const history = devTools.getExecutionHistory();
console.log('Execution history:', history);

// Get statistics
const stats = devTools.getStatistics();
console.log('Statistics:', stats);
// {
//   totalExecutions: 5,
//   successfulExecutions: 4,
//   failedExecutions: 1,
//   averageDuration: 150.5
// }
```

### ApiRequest DevTools

Track network requests, loading states, errors, and performance:

```typescript
import { createApiRequestDevTools, wrapApiRequest } from '@c-a-f/devtools/core';
import { ApiRequest } from '@c-a-f/core';

const apiRequest = new ApiRequest(
  fetch('/api/users').then(r => r.json())
);

const devTools = createApiRequestDevTools(apiRequest, {
  name: 'GetUsers',
  enabled: true,
  logExecutionTime: true,
});

// Wrap request with DevTools tracking
const wrappedRequest = wrapApiRequest(apiRequest, devTools);

// Execute request (will be tracked)
await wrappedRequest.mutate();

// Get request history
const history = devTools.getRequestHistory();
console.log('Request history:', history);

// Get statistics
const stats = devTools.getStatistics();
console.log('Statistics:', stats);
// {
//   totalRequests: 5,
//   successfulRequests: 4,
//   failedRequests: 1,
//   averageDuration: 250.5,
//   currentLoading: false,
//   lastRequestTime: 1234567890
// }

// Get current state
const state = devTools.getCurrentState();
console.log('Current state:', state);
// {
//   loading: false,
//   data: [...],
//   error: null
// }

// Cleanup
devTools.cleanup();
```

### Memory Leak Detection

Detect and prevent memory leaks from subscriptions that aren't cleaned up:

```typescript
import { createMemoryLeakDetector } from '@c-a-f/devtools/core';

// Create a leak detector
const leakDetector = createMemoryLeakDetector({
  enabled: true,
  warnThreshold: 10000, // Warn after 10 seconds
  errorThreshold: 60000, // Error after 60 seconds
  checkInterval: 5000, // Check every 5 seconds
  includeStackTraces: true,
});

// Track a subscription
const cleanup = leakDetector.trackSubscription(
  'Ploc',
  'UserPloc',
  () => {
    ploc.unsubscribe(listener);
  },
  { component: 'UserProfile' }
);

// Later, check for leaks manually
const leaks = leakDetector.detectLeaks();
if (leaks.length > 0) {
  console.warn('Memory leaks detected:', leaks);
  leaks.forEach(leak => {
    console.warn(`Leak: ${leak.subscription.type} "${leak.subscription.name}" (${leak.age}ms old)`);
  });
}

// Get statistics
const stats = leakDetector.getStatistics();
console.log('Active subscriptions:', stats.totalActive);
console.log('By type:', stats.byType);

// Cleanup when done
cleanup();
leakDetector.cleanup();
```

#### Integration with DevTools

You can enable leak detection in DevTools:

```typescript
import { createPlocDevTools, createMemoryLeakDetector } from '@c-a-f/devtools/core';

const leakDetector = createMemoryLeakDetector({
  enabled: true,
  warnThreshold: 10000,
});

const plocDevTools = createPlocDevTools(myPloc, {
  name: 'UserPloc',
  enabled: true,
  enableLeakDetection: true,
  leakDetector: leakDetector,
});
```

### Performance Profiler

Track execution times, render times, and identify performance bottlenecks:

```typescript
import { createPerformanceProfiler, measureExecution, measureSync } from '@c-a-f/devtools/core';

// Create a profiler
const profiler = createPerformanceProfiler({
  enabled: true,
  trackSlowOperations: true,
  slowThreshold: 100, // Warn if operation takes > 100ms
  maxMeasurements: 1000,
});

// Measure async execution
const users = await measureExecution('fetchUsers', async () => {
  return await fetch('/api/users').then(r => r.json());
}, profiler);

// Measure sync execution
const result = measureSync('processData', () => {
  return data.map(item => transform(item));
}, profiler);

// Manual measurement
const endMeasure = profiler.startMeasure('customOperation', 'execution');
// ... do work ...
endMeasure();

// Measure render time (for React components)
const endRender = profiler.measureRender('UserProfile');
// ... render component ...
endRender();

// Get performance report
const report = profiler.getReport();
console.log('Total measurements:', report.totalMeasurements);
console.log('Average duration:', report.averageDuration, 'ms');
console.log('Slow operations:', report.slowOperations);

// Get statistics for specific operation
const stats = profiler.getStatisticsFor('fetchUsers');
if (stats) {
  console.log('fetchUsers stats:', {
    count: stats.count,
    average: stats.averageDuration,
    min: stats.minDuration,
    max: stats.maxDuration,
  });
}

// Get slow operations
const slowOps = profiler.getSlowOperations(200); // Operations > 200ms
console.log('Slow operations:', slowOps);
```

#### Integration with DevTools

You can integrate the profiler with existing DevTools:

```typescript
import { createUseCaseDevTools, createApiRequestDevTools, createPerformanceProfiler } from '@c-a-f/devtools/core';

const profiler = createPerformanceProfiler({
  enabled: true,
  slowThreshold: 100,
});

// UseCase DevTools with profiling
const useCaseDevTools = createUseCaseDevTools({
  name: 'GetUsers',
  enabled: true,
  profiler: profiler,
});

// ApiRequest DevTools with profiling
const apiRequestDevTools = createApiRequestDevTools(myApiRequest, {
  name: 'GetUsers',
  enabled: true,
  profiler: profiler,
});
```

#### React Component Profiling

For React components, you can measure render times:

```typescript
import { useEffect } from 'react';
import { createPerformanceProfiler } from '@c-a-f/devtools/core';

const profiler = createPerformanceProfiler({ enabled: true });

function UserProfile({ user }: { user: User }) {
  useEffect(() => {
    const endRender = profiler.measureRender('UserProfile', {
      userId: user.id,
    });
    
    return () => {
      endRender();
    };
  });

  return <div>{user.name}</div>;
}
```

### Workflow DevTools

Track workflow state transitions:

```typescript
import { createWorkflowDevTools } from '@c-a-f/devtools/workflow';
import { WorkflowManager, WorkflowDefinition } from '@c-a-f/workflow';

const workflow = new WorkflowManager(definition);
const devTools = createWorkflowDevTools(workflow, {
  name: 'OrderWorkflow',
  enabled: true,
});

// Transitions are automatically tracked
await workflow.dispatch('approve');
await workflow.dispatch('ship');

// Get transition history
const history = devTools.getTransitionHistory();
console.log('Transition history:', history);

// Get workflow statistics
const stats = devTools.getStatistics();
console.log('Statistics:', stats);
// {
//   totalTransitions: 3,
//   currentState: 'shipped',
//   isFinal: false,
//   stateVisits: { approved: 1, shipped: 1 }
// }

// Get available transitions
const transitions = devTools.getAvailableTransitions();
console.log('Available transitions:', transitions);
```

### DevTools Logger

Centralized logging with different log levels:

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

// Change log level
logger.setLevel(LogLevel.WARN); // Only warnings and errors will be logged

// Enable/disable
logger.enable();
logger.disable();
```

### State Inspector

Inspect and compare application state:

```typescript
import { StateInspector, createStateInspector } from '@c-a-f/devtools/inspector';

const inspector = createStateInspector();

// Inspect states
inspector.inspect('CounterPloc', ploc.state);
inspector.inspect('UserPulse', userPulse.value);
inspector.inspect('WorkflowState', workflow.getState());

// Get all inspected states
const states = inspector.getAllStates();
console.log('Inspected states:', states);

// Compare states
const comparison = inspector.compare('CounterPloc', 'UserPulse');
console.log('Comparison:', comparison);

// Get state names
const names = inspector.getStateNames();
console.log('State names:', names);

// Remove state
inspector.removeState('CounterPloc');

// Clear all
inspector.clear();
```

## Integration Example

Complete example integrating all DevTools:

```typescript
import { createPlocDevTools, createPulseDevTools, createUseCaseDevTools, createApiRequestDevTools, createMemoryLeakDetector, createPerformanceProfiler } from '@c-a-f/devtools/core';
import { createWorkflowDevTools } from '@c-a-f/devtools/workflow';
import { DevToolsLogger, LogLevel } from '@c-a-f/devtools/logger';
import { StateInspector } from '@c-a-f/devtools/inspector';

// Create logger
const logger = new DevToolsLogger({
  level: LogLevel.DEBUG,
  enabled: process.env.NODE_ENV === 'development',
});

// Create inspector
const inspector = new StateInspector();

// Create memory leak detector
const leakDetector = createMemoryLeakDetector({
  enabled: process.env.NODE_ENV === 'development',
  warnThreshold: 10000, // 10 seconds
  errorThreshold: 60000, // 60 seconds
  checkInterval: 5000, // Check every 5 seconds
});

// Create performance profiler
const profiler = createPerformanceProfiler({
  enabled: process.env.NODE_ENV === 'development',
  trackSlowOperations: true,
  slowThreshold: 100, // 100ms
});

// Setup DevTools for Ploc (with leak detection)
const plocDevTools = createPlocDevTools(myPloc, {
  name: 'MyPloc',
  enabled: true,
  logger: logger.info.bind(logger),
  enableLeakDetection: true,
  leakDetector: leakDetector,
});

// Setup DevTools for Pulse
const pulseDevTools = createPulseDevTools(myPulse, {
  name: 'MyPulse',
  enabled: true,
  logger: logger.info.bind(logger),
});

// Setup DevTools for UseCase (with profiling)
const useCaseDevTools = createUseCaseDevTools({
  name: 'MyUseCase',
  enabled: true,
  logExecutionTime: true,
  logger: logger.info.bind(logger),
  profiler: profiler,
});

// Setup DevTools for ApiRequest (with profiling)
const apiRequestDevTools = createApiRequestDevTools(myApiRequest, {
  name: 'MyApiRequest',
  enabled: true,
  logExecutionTime: true,
  logger: logger.info.bind(logger),
  profiler: profiler,
});

// Setup DevTools for Workflow
const workflowDevTools = createWorkflowDevTools(myWorkflow, {
  name: 'MyWorkflow',
  enabled: true,
  logger: logger.info.bind(logger),
});

// Inspect states periodically
setInterval(() => {
  inspector.inspect('Ploc', plocDevTools.getCurrentState());
  inspector.inspect('Pulse', pulseDevTools.getCurrentValue());
  inspector.inspect('ApiRequest', apiRequestDevTools.getCurrentState());
  inspector.inspect('Workflow', workflowDevTools.getCurrentState());
}, 1000);
```

## Exports

### Core DevTools (`@c-a-f/devtools/core`)

- `PlocDevTools` — DevTools for Ploc instances
- `createPlocDevTools` — Create Ploc DevTools
- `PulseDevTools` — DevTools for Pulse instances
- `createPulseDevTools` — Create Pulse DevTools
- `UseCaseDevTools` — DevTools for UseCase execution
- `createUseCaseDevTools` — Create UseCase DevTools
- `wrapUseCase` — Wrap UseCase with DevTools tracking
- `ApiRequestDevTools` — DevTools for ApiRequest instances
- `createApiRequestDevTools` — Create ApiRequest DevTools
- `wrapApiRequest` — Wrap ApiRequest with DevTools tracking
- `MemoryLeakDetector` — Memory leak detection for subscriptions
- `createMemoryLeakDetector` — Create a memory leak detector
- `defaultMemoryLeakDetector` — Default memory leak detector instance
- `PerformanceProfiler` — Performance profiling for execution and render times
- `createPerformanceProfiler` — Create a performance profiler
- `measureExecution` — Measure async function execution time
- `measureSync` — Measure synchronous function execution time
- `defaultPerformanceProfiler` — Default performance profiler instance

### Workflow DevTools (`@c-a-f/devtools/workflow`)

- `WorkflowDevTools` — DevTools for WorkflowManager instances
- `createWorkflowDevTools` — Create Workflow DevTools

### Logger (`@c-a-f/devtools/logger`)

- `DevToolsLogger` — Centralized logger with log levels
- `createDevToolsLogger` — Create a logger instance
- `LogLevel` — Enum for log levels (DEBUG, INFO, WARN, ERROR, NONE)
- `defaultLogger` — Default logger instance

### Inspector (`@c-a-f/devtools/inspector`)

- `StateInspector` — State inspector for debugging
- `createStateInspector` — Create an inspector instance
- `defaultInspector` — Default inspector instance

## Features

- **State Tracking** — Track all state changes with timestamps
- **Time-Travel Debugging** — Jump to any previous state/value
- **Execution Tracking** — Track UseCase execution with timing
- **Request Tracking** — Track ApiRequest network calls, loading states, and errors
- **Transition History** — Track workflow state transitions
- **Logging** — Centralized logging with different log levels
- **State Inspection** — Inspect and compare application state
- **Performance Monitoring** — Track execution times and statistics
- **Memory Leak Detection** — Detect subscriptions that aren't cleaned up
- **Performance Profiling** — Track execution times, render times, identify bottlenecks

## Dependencies

- `@c-a-f/core` — Core primitives
- `@c-a-f/workflow` — Workflow package (for workflow DevTools)

## License

MIT
