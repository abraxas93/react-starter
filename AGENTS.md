# AGENTS.md

## Purpose

This file defines the default engineering rules for this repository. Follow it for every task unless a more specific `AGENTS.md` or `AGENTS.override.md` exists closer to the files being changed.

The application uses a **feature-folder architecture** with explicit dependency direction, high cohesion inside each business capability, and low coupling between capabilities.

The architectural goals are:

- Keep business capabilities independently understandable, testable, replaceable, and removable.
- Keep React components focused on rendering and interaction rather than infrastructure or business workflows.
- Make dependencies explicit at composition boundaries.
- Prevent feature-to-feature entanglement, circular imports, hidden global state, and generic dumping grounds.
- Prefer the smallest coherent change that preserves the existing architecture.

If a requested change conflicts with these rules, do not silently bypass the architecture. Explain the conflict and implement the safest minimal alternative.

---

## Scope

These instructions apply to the entire repository.

---

## Project Overview

This project is a client-side React application built with:

- React and TypeScript
- Vite
- TanStack Router with file-based routing
- Tailwind CSS
- shadcn/ui using Radix primitives
- Biome for formatting and linting
- Vitest for tests

Use `pnpm` for dependency management and repository scripts. Do not introduce a second package manager or its lockfile. Prefer `pnpm`, `pnpm exec`, and `pnpm dlx` over `npm`, `npx`, or other package managers.

---

## Agent Operating Rules

### Before changing code

1. Read the relevant repository configuration, including:
   - `package.json`;
   - `pnpm-lock.yaml`;
   - TypeScript configuration;
   - Biome configuration;
   - Vite and Vitest configuration;
   - nearby implementation files and tests;
   - any nested `AGENTS.md` or `AGENTS.override.md`.

2. Determine the current implementation pattern before introducing a new one.

3. For non-trivial work, identify:
   - the user-visible goal;
   - the owning feature;
   - affected architectural layers;
   - existing contracts and public APIs;
   - validation required to prove completion.

4. Prefer modifying an existing abstraction over creating a parallel abstraction.

### While changing code

- Keep the change scoped to the task.
- Do not perform unrelated cleanup, renaming, dependency upgrades, or architectural migration.
- Preserve existing behavior unless the task explicitly changes it.
- Follow existing formatting, naming, and testing conventions.
- Do not add production dependencies unless the task genuinely requires one and the repository has no suitable existing solution.
- Never invent backend contracts, environment variables, analytics events, permissions, or business rules. Derive them from repository evidence or make the uncertainty explicit.
- Do not leave commented-out code, placeholder logic, unexplained TODOs, debug logging, or dead exports.
- Do not weaken types, tests, lint rules, security checks, or accessibility to make a change pass.

### Before finishing

- Review the diff for accidental changes.
- Run the narrowest relevant validation first, then broader repository checks where practical.
- Report exactly what was changed and which checks were run.
- Never claim a command passed if it was not run successfully.
- Call out remaining uncertainty, skipped checks, or environmental blockers.

---

## Change and Pull Request Audit

Use this audit both before creating a pull request and when reviewing an existing pull request. In review-only tasks, remain read-only unless the user explicitly asks for fixes.

### Establish the audit scope

1. Identify the intended base branch and use its merge base with the working branch to determine the pull request diff.
2. Include relevant staged, unstaged, and untracked files when auditing work that has not been committed yet.
3. Read the applicable `AGENTS.md` and `AGENTS.override.md` files from the base branch. Also account for instruction-file changes proposed by the pull request.
4. List every changed file and determine its owning feature, architectural layer, public contracts, and affected consumers.
5. Inspect the complete final version of each changed file, not only its changed lines. Review nearby call sites, schemas, tests, public exports, and configuration when they are needed to understand the impact.

### Perform a complete compliance pass

Do not stop after finding the first problems. Check every applicable category for every changed file:

- requested behavior, scope, and preservation of existing behavior;
- architectural layer, ownership, cohesion, and dependency direction;
- route, page, widget, feature, entity, and shared-layer responsibilities;
- state ownership, derived state, Zustand selectors, and TanStack Query usage;
- API adapters, request and response contracts, error semantics, and dependency wiring;
- DTO and Zod schema accuracy, optionality, defaults, transformations, and domain mapping;
- runtime response mocks, test doubles, and mock placement;
- public APIs, barrel exports, deep imports, and file placement;
- component responsibilities, forms, hooks, effects, accessibility, and theme usage;
- security, privacy, loading states, race conditions, and error handling;
- tests, formatting, type checks, builds, and other validation appropriate to the change.

For a category that was inspected and has no new issue, record that it was checked rather than silently omitting it.

### Classify findings by relationship to the change

Classify each potential issue before reporting it:

- **Introduced by the change:** report it as a pull request finding.
- **Existing violation expanded by the change:** report the expansion as a pull request finding. Do not treat an existing pattern as permission to extend it.
- **Pre-existing and unchanged:** do not report it as a pull request finding. Mention it separately only when it materially affects the safety or interpretation of the change.

Do not propose broad cleanup or an architectural migration unless it is required to make the changed behavior correct and compliant. Recommend the smallest coherent fix that contains the problem.

### Report and validate

For each finding, provide:

- priority;
- exact file and line range;
- why it is a concrete problem;
- the violated repository rule or contract;
- the smallest recommended correction.

Clearly separate confirmed findings from unverified assumptions or missing backend/product information. After the compliance pass, run the narrowest relevant checks, then broader checks where practical. State exactly what passed, what failed, and what remains unverified.

Before creating a pull request, resolve in-scope findings where practical and repeat the audit against the final diff. During a read-only pull request review, do not modify files, create commits, or push changes.

---

## Source Structure

Organize application code by responsibility:

```text
src/
  app/
    bootstrap/
    config/
    di/
    providers/

  routes/          # TanStack Router route definitions and layouts

  pages/           # Route-level screen composition

  widgets/         # Reusable composed UI regions

  features/        # Business capabilities and workflows

  entities/        # Optional domain concepts shared across features

  shared/          # Domain-agnostic reusable infrastructure
    api/
    components/
      ui/
    config/        # Optional; create only when needed
    hooks/
    lib/
    types/
```

- `shared/api/` contains domain-neutral transport infrastructure such as the HTTP client, request middleware, generic error normalization, and shared transport types.
- `features/<feature>/api/` contains feature-specific request functions and response adapters. Its `dto/` subfolder contains request/response schemas and inferred transport types.
- Do not place feature endpoints or business-specific DTOs in `shared/api/`.

- `app/config/` owns validated runtime configuration, environment-derived application settings, and bootstrap-specific configuration.
- `shared/config/` is optional. Create it only for domain-neutral reusable configuration utilities or static technical constants that are shared across independent features (for example theme token maps or shared HTTP retry defaults). Do not put environment-derived app settings, feature flags with business meaning, or feature-specific knobs there—those belong in `app/config/` or the owning feature.
- Feature-specific configuration belongs inside the owning feature.
- Do not create empty `shared/config/` in advance.

- Every feature, widget, and externally consumed entity must expose its supported external surface through its root `index.ts`.

### Feature Folder Structure

Use the following structure as a vocabulary, not as mandatory empty folders:

```text
features/
└── user-invitation/
    ├── api/
    │   ├── dto/
    │   │   └── invite-user.dto.ts
    │   └── invite-user.api.ts
    ├── components/
    │   ├── InviteUserForm.tsx
    │   └── InviteUserDialog.tsx
    ├── hooks/
    │   └── useInviteUser.ts
    ├── mappers/
    │   └── map-invitation.ts
    ├── models/
    │   ├── invitation.ts
    │   └── invitation.state.ts
    ├── services/
    │   └── invite-user.service.ts
    ├── validation/
    │   └── invitation.schema.ts
    ├── lib/
    │   └── invitation-errors.ts
    ├── __tests__/
    └── index.ts
```

Do not add both `utils/` and `lib/` to the same feature without a clear, enforced distinction. Avoid catch-all files such as `helpers.ts`, `types.ts`, or `utils.ts` when more specific names are possible.

### Folder responsibilities

- `api/`: transport calls and endpoint adapters.
- `api/dto/`: feature-specific request/response Zod schemas and inferred transport types. Create it only when the feature has DTO schemas; do not add an empty folder in advance.
- `components/`: feature-owned React UI.
- `hooks/`: React-facing orchestration and reusable feature behavior.
- `mappers/`: transformations between transport, domain, and view models.
- `models/`: domain types, state definitions, selectors, reducers, and pure rules.
- `services/`: framework-independent workflows and use cases.
- `validation/`: input and boundary validation schemas.
- `lib/`: feature-private pure helpers that do not fit a stronger category.
- `__tests__/`: tests when colocated `*.test.*` files are not the repository norm.
- `index.ts`: the feature's external contract.


---

## Dependency Direction

The default dependency direction is:

```text
main
  ↓
app
  ↓
routes
  ↓
pages
  ↓
widgets
  ↓
features
  ↓
entities
  ↓
shared
```

Higher layers may import lower layers.
Lower layers must not import higher layers.
`shared` must remain domain-neutral.
`entities` may import only from `shared`.
`features` may import from `entities` and `shared`.
Coordinate features in `pages` or `widgets`; routes only pass validated data.
A necessary feature-to-feature dependency must use the depended-on feature's public API and remain unidirectional and acyclic.
Deep imports into another module's internals are forbidden.
Circular dependencies are forbidden.
Lower layers must not import route modules or generated route-tree code.

When Feature A and Feature B must interact, prefer one of these patterns:

1. A page/widget composes both through typed props/callbacks; routes pass validated data.
2. One feature emits a typed result that the parent passes to the other feature.
3. Shared domain-neutral infrastructure carries a message, only when asynchronous decoupling is genuinely required.
4. A larger cohesive feature owns the workflow if the behaviors always change together.

Do not introduce a global event bus as the default solution to component communication.

When a direct feature dependency is genuinely necessary:

- import only through the depended-on feature's public API;
- keep the dependency unidirectional and acyclic;
- do not import its store internals, DTOs, or private implementation modules;
- consider whether the shared domain concept belongs in `entities`.

---

## State Ownership

Use the narrowest state scope that satisfies the behavior:

1. Derive values instead of storing duplicated state.
2. Use component state for ephemeral UI state.
3. Use route params or validated search params for shareable navigation state.
4. Use TanStack Query for server-owned state.
5. Use page-scoped state for complex client-owned UI workflows limited to one screen.
6. Use feature-scoped state for complex client-owned business workflows or state shared across screens or nested routes.
7. Reserve app-wide state for genuinely application-wide concerns.

Do not use effects to synchronize state that can be derived during render.

Client stores must expose semantic actions and selectors rather than leaking mutable internal state.

### Page controllers and page-scoped state

A non-trivial page may define a page controller hook, such as `useMcpServerRegistryPage`, as the central catalog of its screen-level orchestration and available actions.

- A page controller may compose typed route data, TanStack Router navigation, TanStack Query or feature hooks, browser capabilities, and transient page UI state into a semantic page API.
- A page controller adapts existing owners; it must not copy route params or search values, Query data, Query status, or mutation status into another state container.
- Keep reusable business rules and workflows in the owning feature. A page controller may invoke feature hooks or services, but must not reimplement their behavior.
- Keep an interaction local to its owning control when no other page region needs it. Move repeated feature-specific interaction behavior, such as copying a feature value and showing feature-specific feedback, into a focused feature hook. Promote only the domain-neutral browser primitive to `shared` when independent features need the same semantics.
- A page controller is not automatically a store. Do not introduce Zustand merely to collect functions or hide dependencies; that turns the store into a service locator rather than an owner of state.
- One direct level of narrow props is not prop drilling. Prefer explicit props until several page-private descendants need the same state or actions, or intermediate components only forward them.
- A narrowly scoped page context may expose the page controller to page-private descendants when repeated prop forwarding obscures the screen structure. It must be typed, fail fast outside its provider, and must not be consumed by reusable feature, widget, or shared components.
- Add a page-scoped store only when multiple page-private components share non-trivial mutable client-owned state or transitions. The store must reset when the page scope unmounts unless an explicitly documented workflow requires a wider lifetime.
- If state must survive between sibling pages or nested routes, place its provider at the owning route layout or feature boundary and classify it as feature-scoped rather than pretending it is local to one page.

### Zustand stores

- Use page-scoped or feature-scoped Zustand stores only for complex client-owned state shared by multiple components.
- Create a page-scoped store per mounted page scope through a store factory and provider; do not expose it as a module-global singleton.
- Do not store server response data, query loading state, query errors, mutation state, or cache state in Zustand.
- Do not mirror route params or validated search params in Zustand. Navigation state remains owned by TanStack Router.
- Components must subscribe through narrow selectors and select only the fields or actions they use.
- Do not subscribe to the entire store and do not pass an entire store snapshot through component props.
- Prefer separate primitive selectors. Use `useShallow` when a selector must return multiple values in a new object or array.
- Page-private or connected feature components may subscribe directly to their owning store.
- Keep reusable presentational components store-agnostic and pass them explicit, narrow props.
- Store actions must express semantic page or feature state transitions rather than exposing generic state mutation.
- Do not use a store as an action registry for navigation, Query operations, browser effects, or unrelated services when the store does not own corresponding mutable state.

### TanStack Query

- Use TanStack Query for all server-owned state.
- Use `useQuery` or `useInfiniteQuery` for server reads and `useMutation` for server writes.
- Define feature-specific query options and query hooks inside the owning feature.
- Do not duplicate query or mutation data, errors, or status flags in component state or Zustand.
- Render loading, error, success, background-fetching, and mutation states from the state returned by TanStack Query.
- Choose the query state that matches the UI semantics; initial pending/loading and background fetching are different states.
- Do not call API request functions from `useEffect` when the operation is a query.
- Mutation hooks must own relevant cache invalidation, cache updates, or optimistic reconciliation.
- Route loaders may prefetch or ensure query data through the shared `QueryClient`, but must not create a separate server-data cache.

---

## Public APIs and Imports

Every feature, widget, and externally consumed entity must expose its supported external surface through its root `index.ts`.

Do not create public API files for hypothetical consumers. An entity requires a public API when it is consumed outside its own folder. Features and widgets always expose a public API when they have external consumers.

Example — feature:

```ts
// features/user-invitation/index.ts
export { InviteUserDialog } from "./components/InviteUserDialog";
export type { InvitationResult } from "./models/invitation";
```

Example — entity:

```ts
// entities/user/index.ts
export type { User } from "./models/user";
export { getUserDisplayName } from "./lib/get-user-display-name";
```

External consumers must import from the public API:

```ts
import {
  InviteUserDialog,
  type InvitationResult,
} from "@/features/user-invitation";

import { type User, getUserDisplayName } from "@/entities/user";
```

Do not deep-import private internals:

```ts
// Forbidden outside the feature
import { InviteUserForm } from "@/features/user-invitation/components/InviteUserForm";

// Forbidden outside the entity
import { getUserDisplayName } from "@/entities/user/lib/get-user-display-name";
```

Public APIs must remain minimal:

- export only code intentionally supported outside the module;
- do not use broad `export *` barrels by default;
- do not expose DTOs, internal store shapes, private hooks, or implementation-specific services without a real consumer contract;
- use `export type` for type-only exports;
- avoid barrel files inside deeply connected internal folders when they create cycles or obscure ownership.

Inside a feature or entity, direct relative imports are acceptable and often clearer than routing every internal import through the public API.

---

## Dependency Injection and Wiring

Construct concrete infrastructure in one application composition area, normally `src/app/di/` or `src/app/bootstrap/`.

This includes HTTP clients, repositories, storage, analytics, logging, clocks, ID generators, query clients, and feature services. Do not instantiate these throughout components.

The configured application HTTP client is an infrastructure adapter and may be imported directly by feature API modules. Feature API request functions must not accept that client as a routine parameter merely to enable tests. Keep client construction and configuration centralized, and test API modules at the transport boundary. Inject a client only when the application genuinely needs multiple interchangeable clients or runtime-specific transport behavior; document that exception at the owning composition boundary.

Prefer plain TypeScript contracts and factories over a DI framework. Define a dependency interface near its consumer:

```ts
export interface InvitationRepository {
  invite(input: InviteUserInput): Promise<Invitation>;
}

export const createInviteUser =
  (repository: InvitationRepository) =>
  async (input: InviteUserInput): Promise<Invitation> =>
    repository.invite(input);
```

Wire the concrete adapter at the composition root:

```ts
const repository = createHttpInvitationRepository(httpClient);
const inviteUser = createInviteUser(repository);
```

Use explicit function parameters for pure logic/services and props for component dependencies where practical.

React Context is acceptable for stable app-scoped dependencies when prop passing from the root is excessive and for the narrow page or feature composition scopes defined in this document. Context must expose a typed value, fail fast when missing, and remain narrowly scoped. Do not use it as a service locator containing unrelated application objects or as a hiding place for state with a clearer owner.

Do not import mutable infrastructure singletons into business logic. Introduce an interface only where it creates a real boundary, substitution point, or testing benefit.

---

## Cohesion and Coupling

### High cohesion

Code belongs together when it changes for the same business reason.

Keep a workflow's UI, state, validation, API adapter, mapping, and tests in its owning feature when they are specific to that capability.

Split a feature when it has:

- multiple unrelated user goals;
- independently changing rules;
- unrelated public consumers;
- a large public API that exposes several subdomains;
- internal modules that rarely interact.

Do not split only to reduce file length. Split by responsibility and change boundaries.

### Low coupling

Couple modules through the smallest stable contract:

- serializable values;
- narrow TypeScript interfaces;
- callbacks;
- discriminated unions;
- public feature APIs;
- repository ports.

Avoid coupling through:

- mutable singletons;
- imported store internals;
- shared module-level state;
- DOM queries;
- implicit event names;
- broad context objects;
- feature DTOs leaked into other features;
- shared "god" services.

### Stable dependencies

Business workflows should depend on abstractions they need, not on broad infrastructure implementations.

Prefer:

```ts
type LoadUsers = () => Promise<User[]>;
```

over:

```ts
type Dependencies = {
  apiClient: HugeApiClient;
  store: GlobalStore;
  analytics: AnalyticsSDK;
  router: Router;
};
```

Do not create interfaces mechanically for every function. Introduce a port where it creates a real substitution, boundary, or testing benefit.

---

## API and Service Boundaries

### API adapters

An API adapter:

- knows endpoint paths and transport details;
- serializes requests;
- is implemented as a named request function in the owning feature's `api/` folder;
- uses the configured application HTTP client directly by default rather than accepting it as a parameter;
- handles every successful response through `.response(...)` with a Zod schema, including empty or intentionally ignored responses;
- relies on the centralized HTTP client to normalize generic HTTP, authentication, and rate-limit failures;
- maps only known endpoint-specific failure semantics into feature-understood errors;
- does not catch transport or response-validation errors to return fallback success values;
- does not render UI;
- does not own React state.

Keep request/response schemas and inferred transport types in the owning feature's `api/dto/` folder, normally in focused `*.dto.ts` files. Keep this folder flat unless a feature has multiple clearly independent API domains; do not create a directory per endpoint. Reuse named schemas instead of defining substantial response schemas inline in request functions. Model at least every response field consumed by the application. Use an exact schema such as `z.undefined()` when a response is contractually empty. Using `z.any()` is acceptable only when the response body is intentionally ignored and no application code reads or returns data from it; do not use it for partially understood data that the application consumes.

API request functions should return the application or domain result needed by their consumers rather than exposing raw transport envelopes. Unwrap response envelopes inside the API adapter and map DTOs to domain models when their shapes or semantics differ. Do not create a mapper mechanically when the parsed transport value is already the deliberate application contract. Feature DTOs must not leak outside their owning feature unless they are intentionally promoted as a stable public contract.

### Response schemas and DTO types

- Define API response envelopes and their nested object DTOs with `z.object(...)`. Validate the fields the application consumes and allow Zod to strip unrelated unknown response fields so additive backend changes do not break the client.
- Response schemas must accurately describe the backend fields the application consumes. Fields are required by default; do not add `.optional()` or `.partial()` universally or merely to avoid caring about response correctness.
- Use `.nullable()` only when the backend contract requires the field to be present and permits `null`. Do not substitute `.optional()` for `.nullable()`.
- Use `.optional()` when the backend contract genuinely permits a field to be omitted and ensure consumers handle `undefined`. Optionality must express known response semantics, not act as a defensive fallback for uncertain data.
- Derive response-backed TypeScript types from the schema with `z.infer` or `z.output`; never manually duplicate the response shape in a type or interface.
- When a runtime-validated transport shape needs additional fields, extend or compose the Zod schema first and infer the resulting type. For UI-only or domain-only data, create a separate view/domain model from the inferred DTO rather than weakening the response schema.
- Request, query, form, or patch DTO schemas may derive from existing required field schemas and make selected fields optional only when omission has defined request semantics. Optional request fields must not make the canonical response schema optional.

### Shared transport schemas

Keep feature-specific response objects and DTO types in the owning feature's `api/dto/` folder.

A transport schema may be moved to shared API infrastructure only when:

- at least two independent features use the same transport semantics;
- the schema is domain-neutral;
- its input format and parsed output are identical for every consumer;
- sharing it does not hide meaningful differences between backend contracts.

Use precise names that communicate both the accepted transport format and important output transformations, for example `isoDateTimeToDateSchema`. Avoid overly broad schemas such as `dateSchema`, `idSchema`, or generic response-envelope abstractions that accept several unrelated backend formats.

Do not extract a schema in anticipation of reuse. Similar field names do not imply identical transport contracts.

Shared schemas with preprocessing, coercion, transformation, or refinement should have focused tests for that observable parsing behavior.

### API response mocks

Runtime backend-response mocks must be defined at the owning feature's API boundary and attached to the request through `.mock(...)`. Do not select between real and mock response data in hooks, services, mappers, components, pages, or widgets.

Keep each mock value in a separate `api/dto/<name>.mock.ts` file next to the corresponding `<name>.dto.ts` schema. Type raw mock values with `satisfies z.input<typeof responseSchema>` so they represent the backend payload before Zod parsing and transformation.

Apply `.response(responseSchema)` before `.mock(responseMock)`. Mock responses must pass through the same response schema, transformations, mappers, and application flow as real responses.

This rule applies only to runtime backend-response mocks. It does not replace test doubles such as `vi.mock()`, rejected or pending request simulations, browser API mocks, service fakes, or domain and UI fixtures.

### Services/use cases

A service or use case:

- represents a business action;
- coordinates repositories and domain rules;
- is framework-independent where practical;
- accepts dependencies explicitly;
- returns domain results or typed failures;
- is unit-testable without rendering React.

Do not create a service that merely renames a single API call unless it establishes a meaningful boundary, business rule, or substitution point.

### Hooks

A feature hook:

- adapts a use case/query to React;
- coordinates lifecycle and UI-facing state;
- exposes a small semantic API;
- does not become a generic bucket of unrelated feature logic.

Name hooks by capability or behavior, not by implementation detail.

---

## Component Types and Responsibilities

Classify each component by its primary reason to change.

### UI composition ownership

Place a UI responsibility at the nearest composition boundary that owns it:

- layouts own structure and behavior shared by multiple pages;
- pages own screen-specific composition and coordination;
- widgets own reusable composed regions;
- features own business workflows and domain-specific UI;
- shared primitives own domain-neutral reusable behavior and styling.

Do not repeat a shared structural concern in every child. Move it to the nearest common owner when those children must follow the same rule. Structural concerns include layout regions, content constraints, scrolling, responsive behavior, spacing, alignment, navigation placement, and common screen boundaries.

When children legitimately require different structures, expose a small semantic variant or composition slot instead of using duplicated overrides, negative margins, DOM assumptions, or route-specific conditions in the shared parent. Split components by ownership, behavior, and reason to change, not by JSX size or visual nesting alone.

### Application root

Examples: `App`, `AppProviders`, `AppRouter`.

Assemble global providers, routing, dependencies, and app-wide boundaries. Do not implement feature workflows.

### Pages

Examples: `DashboardPage`, `UserDetailsPage`.

Pages are route-level screen compositions rendered by TanStack route modules. They compose widgets and features and may coordinate sibling features through props and callbacks.

Delegation chain:

1. `routes` own URL, params, guards, loaders, and render a page.
2. `pages` own screen composition and sibling-feature coordination.
3. `widgets` own reusable composed UI regions.
4. `features` own business workflows, feature-scoped state, and domain UI.

Pages:

- may read typed route params, validated search values, loader data, and route context;
- own screen-specific structure such as page headers, main content regions, secondary sidebars, and page-level dialogs;
- should make substantial page-owned regions such as headers, content or list areas, sidebars, and dialogs visible at the page composition boundary;
- may adapt router navigation into typed callbacks passed to feature sections;
- may use a page controller hook to centralize screen-level orchestration and semantic actions without turning that controller into another source of state;
- may use local component state for transient page-owned UI state;
- may use a scoped page context or store under the rules in `Page controllers and page-scoped state`;
- must not copy route params or search values into local state unless the page intentionally owns an editable draft and defines explicit synchronization behavior;
- must not define route files, create router instances, call raw API request functions, store server-owned state, or own reusable business rules;
- may be small when they provide a meaningful route-to-feature adaptation boundary; do not add arbitrary wrappers or extracted components merely to make a page appear more complex.

Do not hide a multi-region screen inside one feature component while the page merely forwards a large collection of state and callbacks. A thin page that renders one cohesive feature remains valid when that feature genuinely owns the complete workflow and the page has no meaningful screen-level composition.

Split a page into components by coherent screen responsibility, not by file length or JSX size alone. Extract a page section when it has its own behavior, data subscription, loading or error boundary, reusable UI contract, or independent reason to change. Keep trivial markup inline when extraction would only add indirection.

Page-private structural components may live under `src/pages/<page>/components` when their reason to exist is to express one screen's header, content, list, sidebar, or dialog composition. Keep them private to that page. When a page grows a private controller, context, store, or several structural components, prefer a page folder and expose only its route-facing page entry; simple pages may remain single files.

Business-capability components and reusable domain UI belong to the owning feature even when they currently have one page consumer, and pages must import them through the feature's public API. Reusable composed regions or regions coordinating multiple features may belong in `widgets`.

### Layouts

Examples: `AppShell`, `TwoColumnLayout`.

Own structure, responsive regions, content constraints, scrolling, shared spacing and alignment, navigation placement, and slots that are common to multiple pages. Layouts must remain domain-neutral.

### Widgets

Examples: `Header`, `Sidebar`, `UserManagementPanel`.

Compose substantial reusable UI regions, possibly from several features. Own only coordination local to that region, not feature business rules. Do not move a single feature's full-screen UI into `widgets` merely because the component is large; UI that uses one feature's business vocabulary, models, and workflows belongs to that feature.

### Feature controllers/containers

Connect feature hooks and use cases to UI. Select state, prepare props, handle events, and choose loading/empty/error/success views. Move reusable decisions out of JSX into models or services.

### Feature presentational components

Render feature-specific UI from explicit data and callbacks. They may own ephemeral UI state but must remain store-agnostic and must not import HTTP clients, repositories, analytics implementations, or global store internals.

### Shared UI primitives

Examples: `Button`, `Input`, `Dialog`, `Tabs`, `Spinner`.

Provide domain-neutral styling, behavior, accessibility, and composition. They must not contain business vocabulary or feature dependencies.

### Forms

Render fields, validation, and submission. Return validated values through callbacks. Keep raw API calls outside forms and distinguish field, domain, and transport errors.

### Providers

Expose stable app-scoped technical capabilities and own initialization/lifecycle. Providers are wiring boundaries, not generic business-logic or global-state containers.

### Guards and boundaries

Examples: `RequireAuthentication`, `PermissionGuard`, `AppErrorBoundary`.

Enforce rendering/navigation prerequisites and fallbacks. Client-side guards improve UX but never replace backend authorization.

### Third-party adapters

Wrap vendor components only to isolate vendor APIs, standardize behavior, or improve testing. Do not create pass-through wrappers with no architectural value.

### Compound components

Use for cohesive reusable UI APIs such as tabs, menus, and data tables. Keep shared state tightly related and accessibility built in.

---

## React Rules

- Use function components and hooks unless the repository requires otherwise.
- Keep render logic pure.
- Treat props and state as immutable.
- Prefer composition over inheritance.
- Use controlled/uncontrolled patterns intentionally and consistently.
- Do not mirror props into state without a real synchronization requirement.
- Do not store derived values in state.
- Use memoization only when it solves a measured or structurally obvious problem.
- Keep hook dependency arrays correct; do not disable hook lint rules to silence design issues.
- Stabilize provider values and expensive callbacks when their identity materially affects consumers.
- Use keys that represent stable identity, not array indexes for reorderable collections.
- Keep asynchronous race handling explicit through the existing query library, abort signals, or guarded lifecycle logic.
- Use lazy loading at route or heavy-feature boundaries when the project already supports it and the bundle benefit is meaningful.

---

## TanStack Router

Use TanStack Router's file-based routing exclusively.

### Route Rules

- Define routes with `createFileRoute`, except for the root route, which uses `createRootRoute`.
- Each leaf user-facing route must render a page component from `src/pages`. Root and pathless layout routes may instead render the application or layout boundary they own.
- Keep route modules thin. They may contain route configuration, loaders, `beforeLoad`, search-parameter validation, route-level error or pending components, and selection of the page component.
- Use `validateSearch` to validate and normalize untrusted URL search parameters. Use `loaderDeps` when validated search values determine what a loader must load.
- Use `beforeLoad` for route prerequisites such as authentication, authorization, redirects, and typed route-context extension. Do not use it as the ordinary data-fetching layer for a screen.
- Use a route `loader` only when data is required before rendering or route-level preloading materially improves navigation. Loaders are not mandatory for every route.
- When a loader coordinates TanStack Query, import the feature's query options through its public API and call the shared `QueryClient`; the page or feature component must consume the same query through TanStack Query rather than receiving a duplicated loader-owned server state.
- Prefer this delegation: route → page → widget/feature. Leaf route modules must not import feature or widget internals, assemble screen UI, call raw API request functions, or own feature workflows.
- Pass validated route data to pages through typed router APIs.
- Move route-level screen composition into `pages`, reusable composed interface regions into `widgets`, and business workflows, feature state, and domain behavior into the owning `features`.
- Use `_app` as the pathless layout for the authenticated application shell. Authenticated routes belong beneath this layout.
- Keep unauthenticated routes, such as sign-in or password recovery, outside `_app`.
- Use pathless layout routes when children must share layout, context, or guards without adding a URL segment.
- Use route group directories such as `(group)` only for organization; they must not be treated as layouts or authorization boundaries.
- Use TanStack Router APIs for navigation and links. Do not add or mix in another routing library.
- Keep a single router creation path. Do not create competing router instances in multiple files.
- Never edit `src/routeTree.gen.ts` manually. It is generated by the TanStack Router plugin or CLI.
- After adding, removing, or renaming route files, regenerate the route tree when necessary and verify the build.
- Preserve type-safe route paths, params, search values, and navigation. Avoid bypassing router types with casts.

---

## shadcn/ui and Radix

Use the Radix-based shadcn/ui configuration as the canonical component system.

### Tailwind and Theme Rules

- Use Tailwind utility classes for layout, spacing, sizing, typography, responsive behavior, and interaction states. Do not avoid utilities by moving ordinary component styling into ad hoc CSS or inline styles.
- Use semantic theme utilities backed by the variables in `src/styles.css`, such as `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`, and `ring-ring`, for theme-dependent colors and surfaces.
- Do not hard-code theme colors in feature or page code. Avoid palette-specific utilities such as `text-zinc-600`, arbitrary color values such as `bg-[#c90c61]`, and inline color styles when an existing semantic token expresses the intent.
- Use arbitrary Tailwind values only for a justified, local, one-off value that is not part of the visual theme. If a value represents reusable visual language or appears repeatedly, add or reuse a named theme token or a shared component variant instead.
- Add a new theme token only when the existing semantic tokens cannot accurately express a recurring application-wide role. Define its light and dark values, expose it through Tailwind, and name it by purpose rather than by a literal color.
- Keep feature-specific layout and composition in the consuming component. Promote styling to a shared primitive or variant only when it represents a reusable UI contract, not merely repeated syntax.

### Component Rules

- Use `pnpm exec shadcn add <component>`; otherwise use an approved, pinned `pnpm dlx shadcn@<version> add <component>`. Never use `npx`, `npm`, or implicitly upgrade the CLI.
- Install reusable UI primitives in `src/shared/components/ui`.
- Before building an interactive control, check `src/shared/components/ui` for an existing primitive. Use the shared `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Dialog`, and similar primitives instead of recreating styled equivalents from native elements.
- If a suitable primitive is missing, prefer adding the matching shadcn component and adapting its repository-owned source. Build a custom primitive only when shadcn/Radix does not provide the required semantics or behavior; document that reason in the change.
- Do not bypass a shared primitive with a locally styled clone to obtain a different appearance. Add a reusable, semantically named variant to the primitive when the visual treatment is genuinely shared; keep one-off feature composition outside the primitive.
- Treat generated shadcn components as repository-owned source code: they may be adapted when needed, but changes must remain generic and reusable.
- Keep business rules, feature state, data fetching, and feature-specific composition out of `src/shared/components/ui`.
- Build feature components by composing UI primitives rather than expanding primitives with feature-specific variants.
- Use Radix primitives for shadcn components. Do not introduce Base UI primitives unless the task explicitly requires and justifies an exception.
- Do not mix Radix and Base UI composition contracts inside one component.
- Inspect the repository's actual component wrapper and primitive API before copying an example from shadcn or another project. Local wrapper behavior is authoritative for this codebase.
- Preserve accessibility behavior supplied by Radix, including keyboard interaction, focus management, labels, descriptions, and portal behavior.
- Use the shared `cn()` utility for conditional or merged Tailwind classes.
- Do not edit `components.json` or replace the configured shadcn style as part of an unrelated component change.

---

## Accessibility

Radix accessibility is covered by the shared UI primitives, but feature-owned components must also follow these rules:

- Prefer semantic HTML.
- Use buttons for actions and links for navigation.
- Ensure interactive elements are keyboard accessible.
- Preserve visible focus behavior.
- Associate form labels, descriptions, and errors with their controls.
- Give icon-only controls accessible names.
- Do not communicate meaning through color alone.
- Test feature UI through accessible roles and names.

---

## Error Handling

Use errors appropriate to the boundary:

- validation errors for invalid user input;
- domain errors for violated business rules;
- infrastructure errors for network/storage failures;
- unexpected errors for defects or unknown states.

Rules:

- Do not show raw backend, stack-trace, or vendor error messages to users.
- Preserve useful diagnostic context for logging without exposing secrets.
- Map known failures to actionable UI messages.
- Provide retry only when retry is meaningful and safe.
- Do not swallow errors silently.
- Use error boundaries for render failures, not ordinary form/API error control flow.
- Ensure optimistic updates have rollback or reconciliation behavior.

---

## Security and Privacy

- Never commit secrets, credentials, access tokens, or private keys.
- Treat user input, URL state, storage values, and API responses as untrusted.
- Do not log authentication data, sensitive payloads, or personal information without an explicit requirement.
- Avoid unsafe HTML rendering; use the repository's approved sanitization boundary when unavoidable.
- Never treat client-side guards or hidden UI as authorization enforcement.
- Do not expose private environment values in the client bundle.

---

## Extraction and Reuse Rules

Do not abstract on first sight of similarity.

Extract code when:

- at least two consumers share the same semantics, not merely similar syntax;
- the extracted contract is clearer than duplication;
- the code has an independent reason to change;
- isolation improves testing or dependency direction;
- a third-party integration needs containment.

Keep code feature-local by default. Promote it to `shared/` only when it is genuinely domain-neutral and used or clearly required across independent features.

Do not create generic configuration-driven mega-components to eliminate small amounts of understandable duplication.

---

## Decision Guide for New Code

### Create a new feature when

- it represents a distinct user/business capability;
- it owns rules or workflows;
- it can be named using domain language;
- it should have a deliberate public API.

### Extend an existing feature when

- the behavior serves the same user goal;
- it changes for the same business reason;
- it uses the same model and workflow boundaries.

### Create a widget when

- a reusable UI region composes several features or substantial shared UI;
- it has meaningful layout/coordination responsibility;
- it remains domain-light.

### Create shared code when

- it is domain-neutral;
- at least two independent consumers need the same semantics;
- placing it in shared does not introduce knowledge of a higher layer.

### Keep code local when

- it has one consumer;
- its future reuse is speculative;
- extraction would obscure the feature workflow;
- the shared abstraction would require business-specific options.

---

## Structure Rules

- Keep `src/routes` focused on routing concerns and thin page composition (`route → page`).
- Put screen-level composition in `src/pages`. Put reusable composed regions in `src/widgets`. Put business behavior and domain UI in `src/features/<feature>`.
- Keep substantial page-owned regions visible in the page composition instead of delegating the entire screen to a feature component with a large pass-through prop surface.
- Colocate page-private structural components and optional page controllers or scoped state under the owning page; do not export them as application-wide contracts.
- A feature may own its components, hooks, API access, schemas, types, and tests.
- Keep `src/shared` domain-agnostic. Do not move feature-specific code there merely because it is reused within one feature.
- Introduce `src/entities` only for domain concepts shared by multiple features. Do not create empty architectural layers in advance. Externally consumed entities must expose a root `index.ts` public API.
- Prefer colocating feature-specific tests and supporting code with the feature they cover.
- Prefer pages/widgets for feature coordination. Necessary feature dependencies use only public APIs and remain acyclic. Put shared domain code in `entities` and generic code in `shared`.
- Do not perform broad restructuring while implementing an unrelated change.

---

## Common Architectural Violations

Do not introduce:

- feature-to-feature deep imports;
- direct API calls in presentational components;
- business rules in pages or shared UI;
- Zustand or other client stores used for server data, query state, mutation state, or local form state;
- service locators or mutable dependency singletons;
- catch-all `utils`, `common`, or `helpers` modules;
- broad contexts that cause unrelated rerenders;
- duplicate domain types for the same concept;
- DTOs used as UI/domain models without deliberate review;
- effects used for ordinary event handling or derived state;
- boolean-prop combinations that permit contradictory states;
- unbounded barrel exports;
- circular dependencies;
- silent error swallowing;
- accessibility regressions;
- speculative abstractions and unused extension points.

When encountering an existing violation, do not expand it. Contain it and improve it only as far as the task safely permits.

---

## Implementation Rules

- Follow existing TypeScript strictness. Do not silence errors with `any`, broad type assertions, or `@ts-ignore` unless there is a documented and unavoidable reason.
- When a runtime schema is the canonical definition of a value, derive its TypeScript type from that schema with `z.infer` or `z.output` instead of duplicating literal unions. Keep the schema in the lowest architectural layer that owns the concept and reuse it upward; never reverse dependency direction merely to derive a type.
- Prefer small, focused changes that solve the requested problem.
- Reuse existing components and utilities before introducing new abstractions.
- Keep components focused; extract logic into hooks or feature modules when it improves ownership or testability.
- Do not modify generated files, dependency versions, or global configuration unless the task requires it.
- Preserve unrelated user changes in the working tree.

---

## Validation

Run validation in proportion to the change.
Use the scripts defined in `package.json`; do not invent alternative commands when a repository script already exists.
Use the repository's non-interactive test command in automated runs. If the `test` script starts watch mode, use the existing run/CI script or pass the repository-supported non-watch flag.

- Run a focused Biome check for touched source files:

  ```sh
  pnpm exec biome check <touched-files>
  ```

- Run relevant tests when behavior changes:

  ```sh
  pnpm test
  ```

- Run type checks for TS, public-contract, schema, or configuration changes:

  ```sh
  pnpm run typecheck
  ```

- Run a production build for routing, configuration, dependency, or UI integration changes:

  ```sh
  pnpm run build
  ```

- For documentation-only changes, review the diff; application tests and builds are not required.
- Report which checks were run and disclose any failures or checks that could not be run.

---

## Testing Rules

- Add or update tests when behavior changes.
- Bug fixes should include a regression test when practical.
- Do not create tests that merely repeat the fields declared by a straightforward DTO schema. Add focused DTO tests only for observable parsing behavior such as preprocessing, coercion, transformation, normalization, refinements, discriminated unions, or subtle optional/nullable rules. Colocate those tests with the schema in `api/dto/`.
- Test pure domain rules, mappers, reducers, and validation without rendering React.
- Test services with injected fake dependencies.
- Test components through user-visible behavior and accessible roles and names.
- Use integration tests when confidence depends on routing, providers, forms, queries, or cache invalidation working together.
- Do not assert private implementation details when observable behavior is the actual contract.
- Do not update snapshots blindly.
