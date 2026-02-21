# ADR-002: Pulse vs Ploc — when to use each

## Status

Accepted.

## Context

CAF needs a **single reactive primitive** that is framework-agnostic so that React, Vue, Angular, or future frameworks can subscribe to changes and re-render. At the same time, we need a **structured state container** for screens or features that hold more than one value and encapsulate presentation logic (when to load, when to show errors, etc.).

We had to decide:

1. Whether to expose one primitive (e.g. only “reactive cells”) and let apps build their own “bloc” layer, or to provide both a low-level primitive and a higher-level container.
2. What to name and how to scope each so developers know when to use which.

## Decision

We provide **two layers** in `@c-a-f/core`:

### Pulse — single reactive value

- **What:** A proxy-based reactive cell: holds one value and notifies subscribers when it changes. API: `pulse(initialValue)`, `.value`, `.subscribe()`, `.unsubscribe()`.
- **When to use:** One reactive value (e.g. loading flag, current user ref, a single count). Use Pulse when you don’t need a structured state object or presentation logic.
- **Implementation:** Implemented as a class with a proxy so that `pulse.value = x` triggers notifications; used internally by `ApiRequest` (loading, data, error) and by `Ploc`.

### Ploc — Presentation Logic Component

- **What:** An abstract class built on top of Pulse. Holds **structured state** (one Pulse holding an object) and exposes `state`, `changeState()`, `subscribe()`, `unsubscribe()`. Subclasses add methods that implement presentation logic (e.g. load users, handle errors).
- **When to use:** A stateful “bloc” for a screen or feature: multiple related fields (e.g. `{ users, loading, error }`), with logic that coordinates use cases and updates state. Use Ploc when you have a stateful object with structured state and logic; use Pulse for a single reactive value.

Relationship: **Ploc is implemented using Pulse.** The core has one reactive engine (Pulse); Ploc composes it for the common case of “structured state + logic.”

## Consequences

**Positive:**

- One reactive primitive (Pulse) keeps the core small and testable; framework adapters (React, Vue, Angular) only need to subscribe to Pulse/Ploc.
- Ploc gives a clear, consistent pattern for “screen/feature state + logic” without every app inventing its own bloc layer.
- Clear guidance: “single value → Pulse; structured state + logic → Ploc” reduces ambiguity and improves consistency across examples and real apps.

**Negative:**

- Two concepts to learn (Pulse and Ploc); we mitigate with docs and examples that show both and when to use each.
- Pulse is intentionally minimal (no built-in batching or devtools); advanced needs (e.g. time-travel) are handled at the Ploc/framework layer (e.g. DevTools in infrastructure packages).

**References:**

- `@c-a-f/core`: `Pulse`, `pulse()`, `Ploc` (see `packages/core/src/Pulse`, `packages/core/src/Ploc`).
- README and core docs: “Use Pulse for one reactive cell; use Ploc for a stateful bloc with structured state and logic.”
