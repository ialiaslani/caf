# @caf/workflow

Framework-agnostic workflow and state machine management for CAF. Built on top of Ploc for reactive state management.

## Installation

```bash
npm install @caf/workflow
```

## Usage

### Core Interfaces

The package provides framework-agnostic interfaces for managing workflows and state machines:

```typescript
import {
  IWorkflow,
  WorkflowDefinition,
  WorkflowStateSnapshot,
  WorkflowManager,
} from '@caf/workflow';

// Define workflow
const orderWorkflow: WorkflowDefinition = {
  id: 'order',
  initialState: 'pending',
  states: {
    pending: {
      id: 'pending',
      label: 'Pending',
      transitions: {
        approve: {
          target: 'approved',
          guard: (context) => context.userRole === 'admin',
        },
        cancel: {
          target: 'cancelled',
        },
      },
    },
    approved: {
      id: 'approved',
      label: 'Approved',
      transitions: {
        ship: {
          target: 'shipped',
        },
      },
    },
    shipped: {
      id: 'shipped',
      label: 'Shipped',
      transitions: {},
    },
    cancelled: {
      id: 'cancelled',
      label: 'Cancelled',
      transitions: {},
    },
  },
};

// Create workflow manager (built on Ploc for reactive state)
const workflow = new WorkflowManager(orderWorkflow, { userRole: 'admin' });

// Subscribe to state changes
workflow.subscribe((snapshot) => {
  console.log('Current state:', snapshot.currentState);
});

// Dispatch events to trigger transitions
await workflow.dispatch('approve');
await workflow.dispatch('ship');

// Check if transition is available
if (workflow.canTransition('approve')) {
  await workflow.dispatch('approve');
}

// Update workflow context
workflow.updateContext({ orderId: '12345' });

// Reset workflow to initial state
await workflow.reset();
```

## Workflow Definition

A workflow is defined by a `WorkflowDefinition` object:

```typescript
interface WorkflowDefinition {
  id: string;                    // Unique workflow identifier
  initialState: WorkflowStateId; // Initial state ID
  states: Record<WorkflowStateId, WorkflowState>; // All states
}
```

Each state can have:
- **Transitions**: Available state transitions triggered by events
- **Guards**: Functions that determine if a transition is allowed
- **Actions**: Functions executed during transitions or state entry/exit

## Workflow Manager

`WorkflowManager` extends `Ploc` from `@caf/core`, providing reactive state management:

```typescript
import { WorkflowManager } from '@caf/workflow';
import { WorkflowDefinition } from '@caf/workflow';

const workflow = new WorkflowManager(definition, initialContext);

// Subscribe to state changes (reactive)
workflow.subscribe((snapshot) => {
  console.log('State changed:', snapshot.currentState);
});

// Dispatch events
await workflow.dispatch('eventName', payload);

// Check transitions
const canTransition = workflow.canTransition('eventName');

// Update context
workflow.updateContext({ key: 'value' });

// Reset workflow
await workflow.reset();
```

## Example: Order Processing Workflow

```typescript
import { WorkflowManager, WorkflowDefinition } from '@caf/workflow';

const orderWorkflow: WorkflowDefinition = {
  id: 'order-processing',
  initialState: 'created',
  states: {
    created: {
      id: 'created',
      label: 'Order Created',
      transitions: {
        pay: {
          target: 'paid',
          action: async (context) => {
            console.log('Processing payment...', context);
          },
        },
        cancel: {
          target: 'cancelled',
        },
      },
      onEnter: async (context) => {
        console.log('Order created:', context.orderId);
      },
    },
    paid: {
      id: 'paid',
      label: 'Paid',
      transitions: {
        ship: {
          target: 'shipped',
          guard: async (context) => {
            return context.paymentConfirmed === true;
          },
        },
        refund: {
          target: 'refunded',
        },
      },
      onEnter: async (context) => {
        console.log('Payment received for order:', context.orderId);
      },
    },
    shipped: {
      id: 'shipped',
      label: 'Shipped',
      transitions: {
        deliver: {
          target: 'delivered',
        },
      },
    },
    delivered: {
      id: 'delivered',
      label: 'Delivered',
      transitions: {},
    },
    cancelled: {
      id: 'cancelled',
      label: 'Cancelled',
      transitions: {},
    },
    refunded: {
      id: 'refunded',
      label: 'Refunded',
      transitions: {},
    },
  },
};

// Create workflow instance
const workflow = new WorkflowManager(orderWorkflow, {
  orderId: '12345',
  paymentConfirmed: false,
});

// Subscribe to state changes
workflow.subscribe((snapshot) => {
  console.log(`Order ${snapshot.context.orderId} is now ${snapshot.currentState}`);
  if (snapshot.isFinal) {
    console.log('Workflow completed!');
  }
});

// Process order
await workflow.dispatch('pay');
workflow.updateContext({ paymentConfirmed: true });
await workflow.dispatch('ship');
await workflow.dispatch('deliver');
```

## Usage in Use Cases and Plocs

```typescript
import { UseCase, RequestResult, pulse } from '@caf/core';
import { WorkflowManager, WorkflowDefinition } from '@caf/workflow';

class ProcessOrder implements UseCase<[{ orderId: string }], void> {
  constructor(private workflow: WorkflowManager) {}

  async execute(args: { orderId: string }): Promise<RequestResult<void>> {
    try {
      // Update workflow context
      this.workflow.updateContext({ orderId: args.orderId });

      // Process workflow steps
      await this.workflow.dispatch('pay');
      this.workflow.updateContext({ paymentConfirmed: true });
      await this.workflow.dispatch('ship');

      return {
        loading: pulse(false),
        data: pulse(undefined!),
        error: pulse(null! as Error),
      };
    } catch (error) {
      return {
        loading: pulse(false),
        data: pulse(undefined!),
        error: pulse(error as Error),
      };
    }
  }
}
```

## Guard Combinators

Use guard combinators to create complex guard conditions:

```typescript
import { WorkflowDefinition } from '@caf/workflow';
import { and, or, not, equals, exists } from '@caf/workflow/guards';

const orderWorkflow: WorkflowDefinition = {
  id: 'order',
  initialState: 'pending',
  states: {
    pending: {
      id: 'pending',
      transitions: {
        approve: {
          target: 'approved',
          // Complex guard: user must be admin AND (order amount > 1000 OR isVip)
          guard: and(
            (ctx) => ctx.userRole === 'admin',
            or(
              (ctx) => ctx.orderAmount > 1000,
              (ctx) => ctx.isVip === true
            )
          ),
        },
        cancel: {
          target: 'cancelled',
          // Simple guard: check if cancellation allowed
          guard: equals('canCancel', true),
        },
      },
    },
    approved: {
      id: 'approved',
      transitions: {
        ship: {
          target: 'shipped',
          // Guard: payment must be confirmed
          guard: exists('paymentConfirmed'),
        },
      },
    },
    shipped: {
      id: 'shipped',
      transitions: {},
    },
    cancelled: {
      id: 'cancelled',
      transitions: {},
    },
  },
};
```

### Available Guard Combinators

- `and(...guards)` — All guards must pass
- `or(...guards)` — At least one guard must pass
- `not(guard)` — Negate a guard
- `always()` — Always returns true
- `never()` — Always returns false
- `equals(property, value)` — Check if context property equals value
- `exists(property)` — Check if context property exists
- `matches(property, predicate)` — Check if context property matches predicate

## Action Helpers

Use action helpers to create and compose workflow actions:

```typescript
import { WorkflowDefinition } from '@caf/workflow';
import { log, updateContext, callService, sequence, parallel, conditional, retry } from '@caf/workflow/actions';

const orderWorkflow: WorkflowDefinition = {
  id: 'order',
  initialState: 'pending',
  states: {
    pending: {
      id: 'pending',
      transitions: {
        approve: {
          target: 'approved',
          // Sequence of actions
          action: sequence(
            log('Approving order...'),
            updateContext({ status: 'approved', approvedAt: new Date() }),
            callService(async (ctx) => {
              await orderService.approve(ctx.orderId);
            })
          ),
        },
      },
      onEnter: log((ctx) => `Order ${ctx.orderId} is pending`),
    },
    approved: {
      id: 'approved',
      transitions: {
        ship: {
          target: 'shipped',
          // Parallel actions
          action: parallel(
            callService(async (ctx) => {
              await shippingService.createShipment(ctx.orderId);
            }),
            callService(async (ctx) => {
              await notificationService.sendShippingNotification(ctx.orderId);
            })
          ),
        },
      },
      onEnter: sequence(
        log('Order approved'),
        conditional(
          (ctx) => ctx.isVip === true,
          callService(async (ctx) => {
            await vipService.sendVipNotification(ctx.orderId);
          })
        )
      ),
    },
    shipped: {
      id: 'shipped',
      transitions: {},
      onEnter: retry(
        callService(async (ctx) => {
          await deliveryService.scheduleDelivery(ctx.orderId);
        }),
        3, // max attempts
        1000 // delay between attempts
      ),
    },
  },
};
```

### Available Action Helpers

- `log(message)` — Log a message
- `updateContext(updates)` — Update workflow context
- `callService(serviceFn)` — Call an async service function
- `sequence(...actions)` — Execute actions in sequence
- `parallel(...actions)` — Execute actions in parallel
- `conditional(condition, trueAction, falseAction?)` — Conditionally execute action
- `retry(action, maxAttempts, delay)` — Retry action on failure
- `timeout(action, ms)` — Timeout action after duration

## Workflow Effects

Use effects to reactively respond to workflow state changes:

```typescript
import { WorkflowManager, WorkflowDefinition } from '@caf/workflow';
import { createEffect, onStateEnter, onStateExit, onTransition, onFinalState, createEffects } from '@caf/workflow/effects';
import { notificationService, auditService, analyticsService, shippingService, reviewService } from './services';

const workflow = new WorkflowManager(orderWorkflow, { orderId: '12345' });

// Effect: Run when entering 'approved' state
const unsubscribe1 = createEffect(workflow, onStateEnter('approved', async (snapshot) => {
  await notificationService.sendApprovalNotification(snapshot.context.orderId);
  console.log('Order approved:', snapshot.context.orderId);
}));

// Effect: Run when exiting 'pending' state
const unsubscribe2 = createEffect(workflow, onStateExit('pending', async (snapshot) => {
  console.log('Order is no longer pending');
}));

// Effect: Run on any transition
const unsubscribe3 = createEffect(workflow, onTransition(async (from, to, snapshot) => {
  await auditService.logTransition(snapshot.context.orderId, from, to);
  console.log(`Order ${snapshot.context.orderId} transitioned from ${from} to ${to}`);
}));

// Effect: Run when workflow reaches final state
const unsubscribe4 = createEffect(workflow, onFinalState(async (snapshot) => {
  await analyticsService.trackCompletion(snapshot.context.orderId);
  console.log('Order workflow completed');
}));

// Create multiple effects at once
const unsubscribeAll = createEffects(
  workflow,
  onStateEnter('shipped', async (snapshot) => {
    await shippingService.sendTrackingInfo(snapshot.context.orderId);
  }),
  onStateEnter('delivered', async (snapshot) => {
    await reviewService.requestReview(snapshot.context.orderId);
  })
);

// Cleanup: unsubscribe all effects
// unsubscribeAll();
```

### Available Effect Functions

- `onStateEnter(stateId, handler)` — Run when entering a specific state
- `onStateExit(stateId, handler)` — Run when exiting a specific state
- `onTransition(handler)` — Run on any state transition
- `onFinalState(handler)` — Run when workflow reaches final state
- `onStateChange(handler)` — Run on every state change
- `createEffect(workflow, effectFactory)` — Create and register an effect
- `createEffects(workflow, ...effectFactories)` — Create multiple effects at once

## Custom Workflow Implementation

You can implement `IWorkflow` interface for custom workflow logic:

```typescript
import { IWorkflow, WorkflowStateSnapshot, WorkflowDefinition } from '@caf/workflow';

class CustomWorkflow implements IWorkflow {
  private currentState: string = 'initial';
  private context: Record<string, unknown> = {};
  private definition: WorkflowDefinition;

  constructor(definition: WorkflowDefinition) {
    this.definition = definition;
    this.currentState = definition.initialState;
  }

  getState(): WorkflowStateSnapshot {
    return {
      currentState: this.currentState,
      context: this.context,
      isFinal: this.isFinalState(),
    };
  }

  async dispatch(event: string): Promise<boolean> {
    // Custom transition logic
    return true;
  }

  canTransition(event: string): boolean {
    // Check if transition is allowed
    return true;
  }

  async reset(): Promise<void> {
    this.currentState = this.definition.initialState;
    this.context = {};
  }

  updateContext(context: Record<string, unknown>): void {
    this.context = { ...this.context, ...context };
  }

  getDefinition(): WorkflowDefinition {
    return this.definition;
  }

  private isFinalState(): boolean {
    // Check if current state is final
    return false;
  }
}
```

## Exports

- `IWorkflow` — Interface for workflow/state machine implementations
- `WorkflowDefinition` — Interface for workflow definitions
- `WorkflowState` — Interface for workflow state definitions
- `WorkflowTransition` — Interface for workflow transition definitions
- `WorkflowStateSnapshot` — Interface for workflow state snapshots
- `WorkflowManager` — Class for managing workflows (built on Ploc)
- `WorkflowStateId` — Type for state identifiers
- `WorkflowEventId` — Type for event identifiers
- `WorkflowContext` — Type for workflow context/data
- `WorkflowGuard` — Type for guard functions
- `WorkflowAction` — Type for action handlers
- Guard combinators: `and`, `or`, `not`, `always`, `never`, `equals`, `exists`, `matches` (from `@caf/workflow/guards`)
- Action helpers: `log`, `updateContext`, `callService`, `sequence`, `parallel`, `conditional`, `retry`, `timeout` (from `@caf/workflow/actions`)
- Effect functions: `onStateEnter`, `onStateExit`, `onTransition`, `onFinalState`, `onStateChange`, `createEffect`, `createEffects` (from `@caf/workflow/effects`)

## Dependencies

- `@caf/core` — Core primitives (Ploc)

## License

MIT
