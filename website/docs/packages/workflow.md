---
title: "@c-a-f/workflow"
sidebar_label: Workflow
---

# @c-a-f/workflow

Framework-agnostic workflow and state machine management for CAF. Built on Ploc for reactive state. Define states, transitions, guards, actions, and effects.

## Installation

```bash
npm install @c-a-f/workflow @c-a-f/core
```

## Features

| Feature | Description |
|--------|-------------|
| **IWorkflow** | Interface for workflow/state machine implementations. |
| **WorkflowDefinition** | `id`, `initialState`, `states` (each with id, label, transitions, onEnter, onExit). |
| **WorkflowState, WorkflowTransition** | State and transition definitions; transitions can have `target`, `guard`, `action`. |
| **WorkflowStateSnapshot** | `currentState`, `context`, `isFinal`. |
| **WorkflowManager** | Extends Ploc; reactive. `subscribe`, `dispatch(event)`, `canTransition(event)`, `updateContext`, `reset`. |
| **Guard combinators** | `and`, `or`, `not`, `always`, `never`, `equals`, `exists`, `matches`. (`@c-a-f/workflow/guards`) |
| **Action helpers** | `log`, `updateContext`, `callService`, `sequence`, `parallel`, `conditional`, `retry`, `timeout`. (`@c-a-f/workflow/actions`) |
| **Effects** | `onStateEnter`, `onStateExit`, `onTransition`, `onFinalState`, `onStateChange`, `createEffect`, `createEffects`. (`@c-a-f/workflow/effects`) |

## Workflow definition

```typescript
import { WorkflowManager, WorkflowDefinition } from '@c-a-f/workflow';

const orderWorkflow: WorkflowDefinition = {
  id: 'order',
  initialState: 'pending',
  states: {
    pending: {
      id: 'pending',
      label: 'Pending',
      transitions: {
        approve: { target: 'approved', guard: (ctx) => ctx.userRole === 'admin' },
        cancel: { target: 'cancelled' },
      },
    },
    approved: {
      id: 'approved',
      label: 'Approved',
      transitions: { ship: { target: 'shipped' } },
    },
    shipped: { id: 'shipped', label: 'Shipped', transitions: {} },
    cancelled: { id: 'cancelled', label: 'Cancelled', transitions: {} },
  },
};

const workflow = new WorkflowManager(orderWorkflow, { userRole: 'admin' });
workflow.subscribe((snapshot) => console.log('Current state:', snapshot.currentState));

await workflow.dispatch('approve');
await workflow.dispatch('ship');
if (workflow.canTransition('approve')) await workflow.dispatch('approve');

workflow.updateContext({ orderId: '12345' });
await workflow.reset();
```

## Guards

```typescript
import { and, or, equals, exists } from '@c-a-f/workflow/guards';

// In a transition:
guard: and(
  (ctx) => ctx.userRole === 'admin',
  or((ctx) => ctx.orderAmount > 1000, (ctx) => ctx.isVip === true)
),
guard: equals('canCancel', true),
guard: exists('paymentConfirmed'),
```

## Actions

```typescript
import { log, updateContext, callService, sequence, parallel, conditional, retry } from '@c-a-f/workflow/actions';

// In a transition or onEnter/onExit:
action: sequence(
  log('Approving order...'),
  updateContext({ status: 'approved', approvedAt: new Date() }),
  callService(async (ctx) => await orderService.approve(ctx.orderId))
),
action: parallel(
  callService(async (ctx) => await shippingService.createShipment(ctx.orderId)),
  callService(async (ctx) => await notificationService.send(ctx.orderId))
),
onEnter: retry(callService(async (ctx) => await deliveryService.schedule(ctx.orderId)), 3, 1000),
```

## Effects

```typescript
import { createEffect, onStateEnter, onStateExit, onTransition, onFinalState } from '@c-a-f/workflow/effects';

createEffect(workflow, onStateEnter('approved', async (snapshot) => {
  await notificationService.sendApprovalNotification(snapshot.context.orderId);
}));

createEffect(workflow, onStateExit('pending', async (snapshot) => {
  console.log('Order is no longer pending');
}));

createEffect(workflow, onTransition(async (from, to, snapshot) => {
  await auditService.logTransition(snapshot.context.orderId, from, to);
}));

createEffect(workflow, onFinalState(async (snapshot) => {
  await analyticsService.trackCompletion(snapshot.context.orderId);
}));
```

## Exports

- **Main:** IWorkflow, WorkflowDefinition, WorkflowState, WorkflowTransition, WorkflowStateSnapshot, WorkflowManager, WorkflowStateId, WorkflowEventId, WorkflowContext, WorkflowGuard, WorkflowAction  
- **/guards:** and, or, not, always, never, equals, exists, matches  
- **/actions:** log, updateContext, callService, sequence, parallel, conditional, retry, timeout  
- **/effects:** onStateEnter, onStateExit, onTransition, onFinalState, onStateChange, createEffect, createEffects  

## Dependencies

- `@c-a-f/core` — Core (Ploc)
