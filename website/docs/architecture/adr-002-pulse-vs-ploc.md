---
title: ADR-002 — Pulse vs Ploc
---

# ADR-002: Pulse vs Ploc — when to use each

## Status

Accepted.

## Context

CAF needs a **single reactive primitive** that is framework-agnostic, and a **structured state container** for screens or features. We had to decide whether to expose one primitive or both, and how to name and scope them.

## Decision

We provide **two layers** in `@c-a-f/core`:

### Pulse — single reactive value

- **What:** A proxy-based reactive cell: holds one value and notifies subscribers when it changes. API: `pulse(initialValue)`, `.value`, `.subscribe()`, `.unsubscribe()`.
- **When to use:** One reactive value (e.g. loading flag, current user ref, a single count).

### Ploc — Presentation Logic Component

- **What:** An abstract class built on top of Pulse. Holds **structured state** and exposes `state`, `changeState()`, `subscribe()`, `unsubscribe()`. Subclasses add methods that implement presentation logic.
- **When to use:** A stateful "bloc" for a screen or feature: multiple related fields (e.g. `{ users, loading, error }`), with logic that coordinates use cases and updates state.

**Relationship:** Ploc is implemented using Pulse. The core has one reactive engine (Pulse); Ploc composes it for the common case of "structured state + logic."

## Consequences

**Positive:** One reactive primitive keeps the core small; Ploc gives a clear pattern; clear guidance ("single value → Pulse; structured state + logic → Ploc").

**Negative:** Two concepts to learn; Pulse is intentionally minimal (no built-in batching or devtools).
