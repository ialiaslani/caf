# @caf/devtools

Development tools and debugging utilities for CAF applications. Provides state tracking, time-travel debugging, logging, and inspection utilities for Ploc, Pulse, UseCase, and Workflow.

## Installation

```bash
npm install @caf/devtools --save-dev
```

## Usage

### Ploc DevTools

Track state changes and enable time-travel debugging for Ploc instances:

```typescript
import { createPlocDevTools } from '@caf/devtools/core';
import { Ploc } from '@caf/core';

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
import { createPulseDevTools } from '@caf/devtools/core';
import { pulse } from '@caf/core';

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
import { createUseCaseDevTools, wrapUseCase } from '@caf/devtools/core';
import { UseCase } from '@caf/core';

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

### Workflow DevTools

Track workflow state transitions:

```typescript
import { createWorkflowDevTools } from '@caf/devtools/workflow';
import { WorkflowManager, WorkflowDefinition } from '@caf/workflow';

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
import { DevToolsLogger, LogLevel } from '@caf/devtools/logger';

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
import { StateInspector, createStateInspector } from '@caf/devtools/inspector';

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
import { createPlocDevTools, createPulseDevTools, createUseCaseDevTools } from '@caf/devtools/core';
import { createWorkflowDevTools } from '@caf/devtools/workflow';
import { DevToolsLogger, LogLevel } from '@caf/devtools/logger';
import { StateInspector } from '@caf/devtools/inspector';

// Create logger
const logger = new DevToolsLogger({
  level: LogLevel.DEBUG,
  enabled: process.env.NODE_ENV === 'development',
});

// Create inspector
const inspector = new StateInspector();

// Setup DevTools for Ploc
const plocDevTools = createPlocDevTools(myPloc, {
  name: 'MyPloc',
  enabled: true,
  logger: logger.info.bind(logger),
});

// Setup DevTools for Pulse
const pulseDevTools = createPulseDevTools(myPulse, {
  name: 'MyPulse',
  enabled: true,
  logger: logger.info.bind(logger),
});

// Setup DevTools for UseCase
const useCaseDevTools = createUseCaseDevTools({
  name: 'MyUseCase',
  enabled: true,
  logExecutionTime: true,
  logger: logger.info.bind(logger),
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
  inspector.inspect('Workflow', workflowDevTools.getCurrentState());
}, 1000);
```

## Exports

### Core DevTools (`@caf/devtools/core`)

- `PlocDevTools` — DevTools for Ploc instances
- `createPlocDevTools` — Create Ploc DevTools
- `PulseDevTools` — DevTools for Pulse instances
- `createPulseDevTools` — Create Pulse DevTools
- `UseCaseDevTools` — DevTools for UseCase execution
- `createUseCaseDevTools` — Create UseCase DevTools
- `wrapUseCase` — Wrap UseCase with DevTools tracking

### Workflow DevTools (`@caf/devtools/workflow`)

- `WorkflowDevTools` — DevTools for WorkflowManager instances
- `createWorkflowDevTools` — Create Workflow DevTools

### Logger (`@caf/devtools/logger`)

- `DevToolsLogger` — Centralized logger with log levels
- `createDevToolsLogger` — Create a logger instance
- `LogLevel` — Enum for log levels (DEBUG, INFO, WARN, ERROR, NONE)
- `defaultLogger` — Default logger instance

### Inspector (`@caf/devtools/inspector`)

- `StateInspector` — State inspector for debugging
- `createStateInspector` — Create an inspector instance
- `defaultInspector` — Default inspector instance

## Features

- **State Tracking** — Track all state changes with timestamps
- **Time-Travel Debugging** — Jump to any previous state/value
- **Execution Tracking** — Track UseCase execution with timing
- **Transition History** — Track workflow state transitions
- **Logging** — Centralized logging with different log levels
- **State Inspection** — Inspect and compare application state
- **Performance Monitoring** — Track execution times and statistics

## Dependencies

- `@caf/core` — Core primitives
- `@caf/workflow` — Workflow package (for workflow DevTools)

## License

MIT
