*Note: You can add these rules as instructions in IDE so they are applied automatically when generating code.*

---

# Client Architecture Guide (Next.js)

## Overview

- **Layers** — standardized levels of abstraction
- **Slices** — feature-based divisions within layers
- **Segments** — technical purpose divisions within slices

```
┌─────────────┬────────────┬────────────┐
│   Layers    │   Slices   │  Segments  │
├─────────────┼────────────┼────────────┤
│    (web)    │      -     │      +     │
│   modules   │      +     │      +     │
│   widgets   │      +     │      +     │
│   features  │      +     │      +     │
│   entities  │      +     │      +     │
│   shared    │      -     │      +     │
│   config    │      -     │      +     │
│     pkg     │      -     │      +     │
└─────────────┴────────────┴────────────┘
```

## Complete Project Structure

```
src/
├── app/
│   ├── (web)/                                      # Layer - Next.js routing (route group)
│   │   ├── page.tsx                                # Root page
│   │   ├── layout.tsx                              # Root layout
│   │   ├── not-found.tsx                           # 404 page (Optional)
│   │   ├── error.tsx                               # Error boundary (Optional)
│   │   ├── loading.tsx                             # Loading UI (Optional)
│   │   └── page-name/                              # Nested routes
│   │       ├── page.tsx
│   │       ├── layout.tsx                          # (Optional)
│   │       └── loading.tsx                         # (Optional)
│   ├── (api)/                                      # Layer - Next.js routing (route group)
│   │   └── api/                                    # API routes (Optional)
│   │       └── [...route]/                         # Catch-all API route
│   │           └── route.ts
│   ├── modules/                                    # Layer - Main business logic
│   │   ├── module-name/                            # Slice
│   │   │   ├── elements/                           # Segment (Optional) - Custom elements
│   │   │   │   ├── element-name/
│   │   │   │   │   ├── element-name.component.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── ...
│   │   │   │   └── index.ts
│   │   │   ├── module-name.module.tsx
│   │   │   ├── module-name.service.ts              # Segment (Optional)
│   │   │   ├── module-name.store.ts                # Segment (Optional)
│   │   │   ├── module-name.constant.ts             # Segment (Optional)
│   │   │   ├── module-name.interface.ts            # Segment (Optional)
│   │   │   └── index.ts
│   │   └── ...
│   ├── widgets/                                    # Layer - Self-sufficient parts of functionality or interface
│   │   ├── widget-name/                            # Slice
│   │   │   ├── elements/                           # Segment (Optional) - Custom elements
│   │   │   │   ├── element-name/
│   │   │   │   │   ├── element-name.component.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── ...
│   │   │   │   └── index.ts
│   │   │   ├── widget-name.component.tsx
│   │   │   ├── widget-name.service.ts              # Segment (Optional)
│   │   │   ├── widget-name.store.ts                # Segment (Optional)
│   │   │   ├── widget-name.constant.ts             # Segment (Optional)
│   │   │   ├── widget-name.interface.ts            # Segment (Optional)
│   │   │   └── index.ts
│   │   └── ...
│   ├── features/                                   # Layer - Reusable implementations
│   │   ├── feature-name/                           # Slice
│   │   │   ├── feature-name.component.tsx
│   │   │   ├── feature-name.service.ts             # Segment (Optional)
│   │   │   ├── feature-name.constant.ts            # Segment (Optional)
│   │   │   ├── feature-name.interface.ts           # Segment (Optional)
│   │   │   └── index.ts
│   │   └── ...
│   ├── entities/                                   # Layer - Business entities
│   │   ├── api/                                    # Slice
│   │   │   ├── api-name/                           # Segment
│   │   │   │   ├── api-name.api.ts
│   │   │   │   ├── api-name.query.ts
│   │   │   │   ├── api-name.mutation.ts
│   │   │   │   └── index.ts
│   │   │   ├── ...
│   │   │   └── index.ts
│   │   └── models/                                 # Slice
│   │       ├── model-name.model.ts
│   │       ├── ...
│   │       └── index.ts
│   └── shared/                                     # Layer - Reusable code
│       ├── ui/                                     # Segment
│       │   ├── ui-name/
│       │   │   ├── ui-name.component.tsx
│       │   │   └── index.ts
│       │   ├── ...
│       │   └── index.ts
│       ├── hooks/                                  # Segment
│       │   ├── hook-name.hook.tsx
│       │   ├── ...
│       │   └── index.ts
│       ├── store/                                  # Segment
│       │   ├── store-name.store.ts
│       │   ├── ...
│       │   └── index.ts
│       ├── interfaces/                             # Segment
│       │   ├── interface-name.interface.ts
│       │   ├── ...
│       │   └── index.ts
│       └── assets/                                 # Segment
│           ├── icon/
│           │   ├── logo.svg
│           │   ├── ...
│           │   └── index.ts
│           ├── ...
│           └── index.ts
├── config/                                         # Application configuration
│   ├── env/                                        # Segment - Environment variables
│   │   ├── env.client.ts                           # Client-side env variables
│   │   ├── env.server.ts                           # Server-side env variables
│   │   └── index.ts
│   ├── fonts/                                      # Segment - Font configuration
│   │   ├── font.ts
│   │   └── index.ts
│   ├── styles/                                     # Segment - Global styles
│   │   └── global.css
│   └── ...
└── pkg/                                            # External packages/utilities
    └── index.ts
```

## Layer Descriptions

### 1. (web) Layer — Next.js Routing

**Purpose**: Next.js App Router pages and API routes

- Define pages and layouts using Next.js conventions
- Handle routing through file system
- API routes for backend integration
- Route groups for organization

**Files**:

- `page.tsx` — Page components
- `layout.tsx` — Layout wrappers
- `loading.tsx` — Loading states
- `error.tsx` — Error boundaries
- `not-found.tsx` — 404 pages
- `api/**/*.ts` — API route handlers

### 2. Modules Layer

**Purpose**: Core business logic

- Main application features
- Complex page sections
- Orchestrate multiple widgets/features
- Business logic implementation

**Files**:

- `.module.tsx` — Module component
- `.service.ts` — Business logic
- `.store.ts` — Module state management
- `.interface.ts` — Module-specific types
- `elements/` — Custom module elements

### 3. Widgets Layer

**Purpose**: Self-sufficient UI components

- Complex reusable components
- Can contain internal logic
- Reusable across pages
- Independent functionality

**Files**:

- `.component.tsx` — Widget component
- `.service.ts` — Widget logic
- `.store.ts` — Widget state
- `elements/` — Custom widget elements

### 4. Features Layer

**Purpose**: Simple reusable implementations

- Small UI components
- Single-purpose functionality
- Feature flags
- Simple hooks

**Files**:

- `.component.tsx` — Feature component
- `.service.ts` — Feature logic
- `.interface.ts` — Feature types

### 5. Entities Layer

**Purpose**: Business entities and data

- API integration
- Data models
- Type definitions
- React Query hooks

**Files**:

- `api/*.api.ts` — API client functions
- `api/*.query.ts` — React Query hooks
- `api/*.mutation.ts` — React Mutation hooks
- `models/*.model.ts` — Data models

### 6. Shared Layer

**Purpose**: Common utilities and components

- Reusable UI components
- Custom hooks
- Global stores
- Assets and icons

**Files**:

- `ui/*.component.tsx` — Shared UI components
- `hooks/*.hook.tsx` — Custom hooks
- `store/*.store.ts` — Global state
- `interfaces/*.interface.ts` — Shared types
- `assets/**` — Images, icons, etc.

### 7. Config Layer

**Purpose**: Application configuration

- Environment variables
- Font configuration
- Global styles
- App-wide settings

**Files**:

- `env/*.ts` — Environment configuration
- `fonts/*.ts` — Font definitions
- `styles/*.css` — Global CSS

### 8. Pkg Layer

**Purpose**: External utilities and packages

- Third-party integrations
- Custom utility packages
- External API clients

## Import Rules

Layers can only import from lower layers in the hierarchy:

```tsx
// ✅ Allowed imports
// (web) -> modules, widgets, features, entities, shared, config, pkg
// modules -> widgets, features, entities, shared, config, pkg
// widgets -> features, entities, shared, config, pkg
// features -> entities, shared, config, pkg
// entities -> shared, config, pkg
// shared -> config, pkg
// config -> pkg
// pkg -> (no other layers, only external packages)

// ❌ Forbidden imports
// shared -> entities, features, widgets, modules, (web)
// entities -> features, widgets, modules, (web)
// features -> widgets, modules, (web)
// widgets -> modules, (web)
// modules -> (web)
// config -> any app layers
// pkg -> any app layers
```

## Naming Conventions

### Files

- **Pages**: `page.tsx`
- **Layouts**: `layout.tsx`
- **Modules**: `module-name.module.tsx`
- **Components**: `component-name.component.tsx`
- **Services**: `service-name.service.ts`
- **Stores**: `store-name.store.ts`
- **Hooks**: `hook-name.hook.tsx`
- **Models**: `model-name.model.ts`
- **APIs**: `api-name.api.ts`
- **Queries**: `api-name.query.ts`
- **Mutations**: `api-name.mutation.ts`
- **Constants**: `constant-name.constant.ts`
- **Interfaces**: `interface-name.interface.ts`

### Directories

- Use **kebab-case**: `user-profile`, `order-history`
- Singular for components: `button`, `card`
- Plural for collections: `users`, `orders`

## Project Structure Rules

1. **Each layer is independent** — Lower layers don't know about upper layers
2. **Index files** — Export public API of each slice
3. **No circular dependencies** — Use dependency injection if needed
4. **Keep pages thin** — Business logic belongs in modules/services
5. **Type safety first** — Use TypeScript strictly
6. **Server Components by default** — Use `'use client'` only when needed

## Testing Structure

```
tests/
├── unit/
│   ├── components/
│   ├── services/
│   └── hooks/
├── integration/
│   ├── pages/
│   └── api/
└── e2e/
    └── flows/
```