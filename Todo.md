# CAF Package Structure & Feature Roadmap

## Package Structure Recommendations

### Current Status
- ✅ **Core** (`@caf/core`) - Essential primitives (UseCase, Ploc, Pulse, Route, IRequest, ApiClient)
- ✅ **Validation** (`@caf/validation`) - Schema-agnostic validation interfaces + adapters (Zod, Yup)
- ✅ **Infrastructure** (`@caf/infrastructure-*`) - Framework-specific adapters (React, Vue, Angular, Axios)

### Recommended Changes

#### 1. Separate I18n Package (`@caf/i18n`)
**Status:** ✅ **COMPLETED** - Separated into `@caf/i18n` package

**Reasoning:**
- Consistency: Validation is already separated, I18n should follow the same pattern
- Optional: Not all applications need internationalization
- Same pattern: Interface (`ITranslator`) + Manager (`TranslationManager`) + adapters
- Dependency management: Keeps core lean and focused
- Flexibility: Users can opt-in/opt-out

**Action Items:**
- [x] Create `packages/i18n/` directory structure
- [x] Move `core/src/I18n/` to `i18n/src/`
- [x] Create `i18n/package.json` with proper exports
- [x] Add adapters folder for i18next, vue-i18n, ngx-translate
- [x] Update `core/src/index.ts` to remove I18n exports
- [x] Update documentation to reflect new package (core README, API.md)
- [ ] Update examples to use `@caf/i18n` instead of `@caf/core` for I18n (if needed)

**Structure:**
```
packages/i18n/
├── src/
│   ├── ITranslator.ts          # Interface
│   ├── TranslationManager.ts   # Utility
│   ├── index.ts
│   └── adapters/
│       ├── i18next.ts          # i18next adapter
│       ├── vue-i18n.ts        # Vue i18n adapter
│       └── ngx-translate.ts   # Angular translate adapter
├── package.json
└── README.md
```

#### 2. Consider Separating Permission Package (`@caf/permission`)
**Status:** ✅ **COMPLETED** - Separated into `@caf/permission` package

**Reasoning:**
- Similar pattern to Validation and I18n
- Not all applications need permission checking
- Could grow with more adapters (role-based, policy-based, etc.)

**Action Items:**
- [x] Evaluate if Permission should be separated (after I18n migration)
- [x] If yes, create `packages/permission/` structure
- [x] Move `core/src/Permission/` to `permission/src/`
- [x] Add adapters for different permission strategies (role-based, policy-based, simple)

#### 3. Keep Workflow in Core (for now)
**Status:** ✅ **COMPLETED** - Separated into `@caf/workflow` package

**Reasoning:**
- Workflow/state machine is a core architectural pattern
- Built on top of Ploc (core primitive)
- May be considered essential for many applications

**Action Items:**
- [x] Create `packages/workflow/` structure
- [x] Move `core/src/Workflow/` to `workflow/src/`
- [x] Update workflow to depend on `@caf/core` for Ploc
- [x] Update core to remove Workflow exports
- [x] Update documentation

## Feature Implementation Checklist

### Core Features
- [x] UseCase - Interface for application use cases
- [x] Ploc - Presentation Logic Component
- [x] Pulse - Reactive primitive
- [x] Route - Routing interfaces and RouteManager
- [x] IRequest - Request interfaces
- [x] ApiClient - API client interfaces

### Cross-Cutting Concerns
- [x] Validation - Schema-agnostic validation (`@caf/validation`)
- [x] Permission - Permission checking (currently in `core`, consider separating)
- [x] I18n - Internationalization (currently in `core`, **should be separated**)
- [x] Workflow - State machine/workflow management (currently in `core`)

### Infrastructure Adapters
- [x] React - Routing hooks (`useRouteManager`, `useRouteRepository`)
- [x] Vue - Routing composables (`useRouteManager`, `useRouteRepository`)
- [x] Angular - Routing services (`RouterService`, `RouteHandler`)
- [x] Axios - HTTP client adapters

### Future Enhancements
- [x] Additional validation adapters (Joi, class-validator, etc.) ✅ **COMPLETED**
- [x] Additional i18n adapters (after separation) ✅ **COMPLETED** (react-intl, next-intl, Intl API)
- [x] Additional permission adapters (after separation) ✅ **COMPLETED** (CASL, Resource-based, Hierarchical, Time-based)
- [x] Additional workflow features (guards, actions, effects) ✅ **COMPLETED** (Guard combinators, Action helpers, Effects system)
- [x] Testing utilities package (`@caf/testing`) ✅ **COMPLETED** (Core, Workflow, Permission, I18n, Validation test helpers)
- [x] DevTools package (`@caf/devtools`) ✅ **COMPLETED** (Ploc, Pulse, UseCase, Workflow DevTools, Logger, Inspector)

## Package Structure Goals

### Core Principles
1. **Core should be minimal** - Only essential primitives required for CAF
2. **Cross-cutting concerns should be separate** - Validation, I18n, Permission
3. **Infrastructure is framework-specific** - React, Vue, Angular adapters
4. **Consistent patterns** - Interface + Manager + Adapters

### Target Structure
```
packages/
├── core/                    # Essential primitives only
│   ├── Pulse/
│   ├── Ploc/
│   ├── UseCase/
│   ├── Route/
│   ├── IRequest/
│   └── ApiClient/
│
├── validation/              # ✅ Already separated
│   ├── IValidator.ts
│   ├── ValidationRunner.ts
│   └── adapters/
│
├── i18n/                    # ✅ Separated
│   ├── ITranslator.ts
│   ├── TranslationManager.ts
│   └── adapters/
│
├── permission/             # ✅ Separated
│   ├── IPermissionChecker.ts
│   ├── PermissionManager.ts
│   └── adapters/
│
└── infrastructure/         # Framework adapters
    ├── react/
    ├── vue/
    ├── angular/
    ├── axios/
    └── shared/
```

## Migration Priority

1. ~~**High Priority:** Separate I18n package (consistency with Validation)~~ ✅ **COMPLETED**
2. ~~**Medium Priority:** Evaluate Permission separation~~ ✅ **COMPLETED**
3. ~~**Low Priority:** Consider Workflow separation (if it becomes optional)~~ ✅ **COMPLETED**

## Notes

- All packages should follow the same pattern: Interface + Manager + Adapters
- Core should have zero or minimal dependencies
- Cross-cutting packages depend on `@caf/core`
- Infrastructure packages depend on `@caf/core` + framework libraries