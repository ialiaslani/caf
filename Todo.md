# CAF Development Todo - Prioritized by Importance

## 🔴 CRITICAL PRIORITY - Core Infrastructure Improvements

### 1. Complete React Infrastructure Package (`@c.a.f/infrastructure-react`)
**Status:** ✅ Complete  
**Impact:** High - Essential for React developers using CAF

#### 1.1 Add `usePloc` Hook
- [x] Create `packages/infrastructure/react/Ploc/usePloc.ts`
- [x] Hook should handle Ploc subscription/unsubscription automatically
- [x] Return Ploc instance and current state
- [x] Handle cleanup on unmount
- [x] Add TypeScript generics for type safety
- [x] Write unit tests
- [x] Add to README with examples

**Example API:**
```typescript
function usePloc<T>(ploc: Ploc<T>): [T, Ploc<T>] {
  // Auto-subscribe, return state and ploc instance
}
```

#### 1.2 Add `useUseCase` Hook
- [x] Create `packages/infrastructure/react/UseCase/useUseCase.ts`
- [x] Hook should wrap UseCase execution with loading/error states
- [x] Return execute function, loading state, error state, data
- [x] Handle RequestResult automatically
- [x] Add TypeScript generics
- [x] Write unit tests
- [x] Add to README with examples

**Example API:**
```typescript
function useUseCase<TArgs extends any[], TResult>(
  useCase: UseCase<TArgs, TResult>
): {
  execute: (...args: TArgs) => Promise<TResult | null>;
  loading: boolean;
  error: Error | null;
  data: TResult | null;
}
```

#### 1.3 Add Error Boundary Component
- [x] Create `packages/infrastructure/react/ErrorBoundary/CAFErrorBoundary.tsx`
- [x] Catch errors from Ploc/UseCase execution
- [x] Provide error context via React Context
- [x] Allow custom error UI
- [x] Support error recovery
- [x] Write unit tests
- [x] Add to README with examples

#### 1.4 Add DevTools Integration
- [x] Create `packages/infrastructure/react/DevTools/useCAFDevTools.ts`
- [x] Integrate with React DevTools
- [x] Show Ploc state in DevTools
- [x] Track UseCase executions
- [x] Add time-travel debugging (optional)
- [x] Write documentation

#### 1.5 Export All New Hooks
- [x] Update `packages/infrastructure/react/index.ts`
- [x] Export `usePloc`, `useUseCase`, `CAFErrorBoundary`
- [x] Update package.json exports field if needed

#### 1.6 Route Management (Already Implemented)
- [x] `useRouteManager(authOptions?)` — provides core `RouteManager` with optional auth
- [x] `useRouteRepository()` — provides `RouteRepository` via React Router (`useNavigate`, `useLocation`)
- [ ] Demonstrate routing in example app (see 14.1)

---

### 1b. Ploc/UseCase Provisioning (Dependency Injection) — `@c.a.f/infrastructure-react`
**Status:** ❌ Not Started  
**Impact:** High - Essential for real-world apps; avoids prop-drilling and ad-hoc wiring

#### 1b.1 Add CAFProvider (or PlocProvider / UseCaseProvider)
- [x] Create `packages/infrastructure/react/Provider/CAFProvider.tsx` (or separate PlocProvider / UseCaseProvider)
- [x] Allow app to register Plocs and/or UseCases at root (by key or type)
- [x] Provide via React Context so any descendant can access without props
- [x] Document recommended patterns (single provider vs multiple)
- [x] Add to README with examples

#### 1b.2 Add Context Hooks
- [ ] Add `usePlocFromContext<T>(key: string)` or `usePlocFromContext<T>()` (typed by provider)
- [ ] Add `useUseCaseFromContext<TArgs, TResult>(key: string)` or equivalent
- [ ] Throw or return null when not within provider (document behavior)
- [ ] Add TypeScript generics for type safety
- [ ] Write unit tests
- [ ] Add to README with examples

#### 1b.3 Export and Document
- [ ] Update `packages/infrastructure/react/index.ts` exports
- [ ] Document "wiring at app root" pattern in README
- [ ] Add minimal example in README (wrap app with CAFProvider, inject Plocs, consume in child)

---

## 🟠 HIGH PRIORITY - Developer Experience & Testing

### 2. Testing Utilities Package (`@c.a.f/testing`)
**Status:** ✅ Exists but needs enhancement  
**Impact:** High - Critical for testing CAF applications

#### 2.1 Enhance Existing Test Helpers
- [ ] Review current `@c.a.f/testing` package
- [ ] Add `createMockPloc` helper (convenience Ploc with controllable state for unit tests)
- [ ] Improve `createMockUseCase` API if needed (helper already exists)
- [ ] Add `createMockRepository` helper (generic stub for domain `I*Repository` interfaces)
- [ ] Add snapshot testing utilities (e.g. assert state history)
- [ ] Add integration test helpers

#### 2.2 Add React Testing Utilities
- [ ] Create `packages/testing/react/` directory
- [ ] Add `renderWithCAF` wrapper for React Testing Library
- [ ] Add `createTestPloc` helper
- [ ] Add `waitForPlocState` utility
- [ ] Add `mockUseCase` helper
- [ ] Write examples and documentation

#### 2.3 Add Integration Test Examples
- [ ] Create example test files in `example-caf/vite-project`
- [ ] Show how to test Ploc with React components
- [ ] Show how to test UseCase execution
- [ ] Show how to test error handling
- [ ] Document best practices

---

## 🟡 MEDIUM PRIORITY - Examples & Documentation

### 3. GraphQL Example Project
**Status:** ❌ Not Started  
**Impact:** Medium - Shows CAF works with GraphQL

#### 3.1 Create GraphQL Infrastructure
- [ ] Create `example-caf/graphql-project/` directory
- [ ] Set up Apollo Client or similar
- [ ] Create `caf/infrastructure/graphql/` folder
- [ ] Implement `UserGraphQLRepository` implementing `IUserRepository`
- [ ] Show same domain/application layers work with GraphQL
- [ ] Write README explaining the approach

#### 3.2 GraphQL Example App
- [ ] Create React app using GraphQL
- [ ] Use same `caf/domain` and `caf/application` structure
- [ ] Only infrastructure layer differs
- [ ] Document the differences
- [ ] Add to main README

---

### 4. WebSocket Example Project
**Status:** ❌ Not Started  
**Impact:** Medium - Shows CAF works with WebSockets

#### 4.1 Create WebSocket Infrastructure
- [ ] Create `example-caf/websocket-project/` directory
- [ ] Set up WebSocket client
- [ ] Create `caf/infrastructure/websocket/` folder
- [ ] Implement `UserWebSocketRepository` implementing `IUserRepository`
- [ ] Handle real-time updates with Ploc
- [ ] Write README explaining the approach

#### 4.2 WebSocket Example App
- [ ] Create React app using WebSockets
- [ ] Show real-time updates with Ploc
- [ ] Handle connection/disconnection states
- [ ] Document patterns for WebSocket + CAF

---

### 5. Documentation Improvements
**Status:** 🟡 Partial  
**Impact:** Medium - Critical for adoption

#### 5.1 Architecture Decision Records (ADRs)
- [ ] Create `docs/adr/` directory
- [ ] Document why `caf/` folder structure
- [ ] Document Pulse vs Ploc decision
- [ ] Document routing abstraction decision
- [ ] Document package separation decisions

#### 5.2 Best Practices Guide
- [ ] Create `docs/BEST_PRACTICES.md`
- [ ] Document folder structure best practices
- [ ] Document dependency injection patterns
- [ ] Document error handling patterns
- [ ] Document testing strategies
- [ ] Document performance optimization

#### 5.3 Migration Guides
- [ ] Create `docs/MIGRATION.md`
- [ ] Guide for migrating from Redux/Zustand to CAF
- [ ] Guide for migrating from React Query to CAF
- [ ] Guide for adding CAF to existing projects
- [ ] Common pitfalls and solutions

#### 5.4 Troubleshooting Guide
- [ ] Create `docs/TROUBLESHOOTING.md`
- [ ] Common errors and solutions
- [ ] Performance issues
- [ ] TypeScript issues
- [ ] Testing issues

#### 5.5 Video Tutorials (Optional)
- [ ] Record "Getting Started" tutorial
- [ ] Record "Building a Feature" tutorial
- [ ] Record "Testing with CAF" tutorial
- [ ] Host on YouTube or similar

---

## 🟢 MEDIUM-LOW PRIORITY - Advanced Features

### 6. Caching Layer
**Status:** ❌ Not Started  
**Impact:** Medium - Useful for production apps

#### 6.1 Request Caching
- [ ] Create `packages/cache/` directory (or add to core)
- [ ] Implement cache interface
- [ ] Add cache adapters (Memory, LocalStorage, IndexedDB)
- [ ] Integrate with `ApiRequest`
- [ ] Add cache invalidation strategies
- [ ] Write documentation

#### 6.2 Cache Invalidation Patterns
- [ ] Document cache invalidation strategies
- [ ] Add helpers for common patterns
- [ ] Add examples

---

### 7. State Persistence
**Status:** ❌ Not Started  
**Impact:** Medium - Useful for offline support

#### 7.1 Persistence Adapters
- [ ] Create persistence interfaces
- [ ] Add LocalStorage adapter
- [ ] Add SessionStorage adapter
- [ ] Add IndexedDB adapter (optional)
- [ ] Integrate with Ploc
- [ ] Write documentation

#### 7.2 State Hydration
- [ ] Add state hydration on app start
- [ ] Handle hydration errors
- [ ] Add examples

---

### 8. Error Handling Patterns
**Status:** 🟡 Partial  
**Impact:** Medium - Important for production

#### 8.1 Centralized Error Handling
- [ ] Create error handling utilities
- [ ] Add error transformation
- [ ] Add error logging interface
- [ ] Integrate with Ploc
- [ ] Write documentation

#### 8.2 Retry Logic
- [ ] Add retry interface
- [ ] Implement exponential backoff
- [ ] Add to `ApiRequest` (optional)
- [ ] Write examples

---

## 🔵 LOW PRIORITY - Nice to Have

### 9. CLI Improvements
**Status:** ✅ Exists but basic  
**Impact:** Low - Improves DX

#### 9.1 Enhanced CLI Commands
- [ ] Add `caf generate domain <name>` command
- [ ] Add `caf generate usecase <name>` command
- [ ] Add `caf generate ploc <name>` command
- [ ] Add `caf generate repository <name>` command
- [ ] Add interactive mode
- [ ] Update CLI documentation

#### 9.2 VS Code Integration
- [ ] Create VS Code snippets
- [ ] Add code templates
- [ ] Create extension (optional)

---

### 10. ESLint Rules
**Status:** ❌ Not Started  
**Impact:** Low - Helps enforce patterns

#### 10.1 CAF ESLint Plugin
- [ ] Create `packages/eslint-plugin-caf/`
- [ ] Add rule: "no-framework-imports-in-caf"
- [ ] Add rule: "no-infrastructure-in-domain"
- [ ] Add rule: "no-domain-in-infrastructure"
- [ ] Add rule: "prefer-ploc-over-local-state"
- [ ] Write documentation

---

### 11. TypeScript Path Aliases Setup
**Status:** ❌ Not Started  
**Impact:** Low - Improves DX

#### 11.1 Path Alias Templates
- [ ] Document recommended path aliases
- [ ] Add to CLI init command
- [ ] Create example `tsconfig.json` templates
- [ ] Update documentation

---

### 12. Performance Optimizations
**Status:** 🟡 Partial  
**Impact:** Low - Optimization

#### 12.1 Ploc Performance
- [ ] Review Ploc subscription performance
- [ ] Add batching for state updates (if needed)
- [ ] Optimize Pulse notifications
- [ ] Add performance benchmarks

#### 12.2 Memory Leaks Prevention
- [ ] Document subscription cleanup patterns
- [ ] Add warnings for common mistakes
- [ ] Add DevTools memory leak detection

---

## 📋 Project Structure Best Practices

### 13. Document `caf/` Folder Structure
**Status:** 🟡 Partial  
**Impact:** High - Core concept

#### 13.1 Structure Documentation
- [ ] Document why `caf/` folder exists
- [ ] Document what goes in each layer
- [ ] Document what should NOT go in `caf/`
- [ ] Add examples of good vs bad structure
- [ ] Add to main README

#### 13.2 Default Data Patterns
- [ ] Document best practices for default data
- [ ] Show dependency injection patterns
- [ ] Show factory pattern examples
- [ ] Document configuration patterns

---

## 🎯 Quick Wins (Can be done immediately)

### 14. Immediate Improvements
**Status:** ❌ Not Started  
**Impact:** Medium - Easy wins

#### 14.1 Demonstrate Routing in Example App
- [ ] Add routing to `example-caf/vite-project` (e.g. `BrowserRouter`, `Routes`)
- [ ] Use `useRouteManager` and `useRouteRepository` from `@c.a.f/infrastructure-react`
- [ ] Add minimal flow: e.g. login route → dashboard with `checkForLoginRoute()` and `isLoggedIn()`
- [ ] Document in example README so route management is visible and copy-pasteable

#### 14.2 Other Quick Wins
- [ ] Create GraphQL example (see 3.1)
- [ ] Create WebSocket example (see 4.1)
- [ ] Write best practices guide (see 5.2)
- [ ] Add troubleshooting guide (see 5.4)

---

## 📊 Priority Summary

1. **🔴 CRITICAL:** Complete React infrastructure (usePloc, useUseCase, ErrorBoundary) — ✅ Done. Route management (useRouteManager, useRouteRepository) already in package.
2. **🟠 HIGH:** Ploc/UseCase provisioning (CAFProvider / DI), testing utilities enhancements, GraphQL/WebSocket examples
3. **🟡 MEDIUM:** Demonstrate routing in example app, documentation improvements, caching, state persistence
4. **🟢 MEDIUM-LOW:** Error handling patterns, CLI improvements
5. **🔵 LOW:** ESLint rules, performance optimizations, VS Code integration

---

## 🚀 Recommended Next Steps

1. **Next:** Add Ploc/UseCase provisioning (1b.1, 1b.2) so apps can wire Plocs/UseCases at root and consume via context — high value for real-world use.
2. **Then:** Enhance testing utilities (2.1, 2.2) and add React testing package (2.2); add integration test examples (2.3).
3. **In parallel or soon after:** Demonstrate routing in example app (14.1) so `useRouteManager` / `useRouteRepository` are visible and documented.
4. **Later:** GraphQL example (3.x), WebSocket example (4.x), documentation sprint (5.x).

---

## 📝 Notes

- All tasks should include tests and documentation
- Examples should be production-ready, not just demos
- Documentation should be clear and include code examples
- Consider backward compatibility when adding new features
- Follow existing patterns and conventions
- **Route management** is already provided in `@c.a.f/infrastructure-react` (`useRouteManager`, `useRouteRepository`); the example app does not yet demonstrate it — add routing demo (14.1) to document the feature.

---

## ✅ Completed Items (Reference)

- ✅ Core package (`@c.a.f/core`)
- ✅ Validation package (`@c.a.f/validation`)
- ✅ Infrastructure packages (React, Vue, Angular, Axios)
- ✅ React infrastructure: usePloc, useUseCase, CAFErrorBoundary, DevTools integration
- ✅ Route management in infrastructure-react (`useRouteManager`, `useRouteRepository` with React Router)
- ✅ Testing package (`@c.a.f/testing`)
- ✅ DevTools package (`@c.a.f/devtools`)
- ✅ I18n package (`@c.a.f/i18n`)
- ✅ Permission package (`@c.a.f/permission`)
- ✅ Workflow package (`@c.a.f/workflow`)
- ✅ Basic CLI (`@c.a.f/cli`)
- ✅ Example projects (React, Vue, Angular)
