---
sidebar_position: 1
title: Install
---

# Install

## Core and framework

```bash
npm install @c-a-f/core
npm install @c-a-f/infrastructure-react   # or -vue, -angular
```

## Optional packages

| Package | Purpose |
|---------|---------|
| `@c-a-f/validation` | Validation interfaces and Zod/Yup adapters |
| `@c-a-f/workflow` | Workflow and state machine on top of Ploc |
| `@c-a-f/permission` | Permission interfaces and adapters (RBAC, CASL) |
| `@c-a-f/i18n` | i18n interfaces and adapters |
| `@c-a-f/testing` | Test helpers (mock Ploc, UseCase, renderWithCAF) — use as dev dependency |

## Peer dependencies

- **React**: `react`, `react-dom` (and optionally `react-router-dom` for routing)
- **Vue**: `vue`, `@vue/router` (if using routing)
- **Angular**: `@angular/core`, `@angular/router`

Install these in your app when using the corresponding infrastructure package.
