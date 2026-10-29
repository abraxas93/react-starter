# React template

A small, backend-free starting point for React projects. Built with React 19, TypeScript, Vite, TanStack Router and Query, Zod, Tailwind CSS, and Radix-based shadcn/ui. Biome and Vitest are included.

## Start a project

Use this repository as a GitHub template, or copy it into a new repository. Rename `package.json`, the title in `index.html`, and the application shell for your project.

```sh
nvm use
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Use Node 24 and pnpm 10.23.0 (pinned in `package.json`). Open http://localhost:5173. No environment file, account, or backend is required.

## What is included

- `/`: a welcome screen and shared application shell.
- `/examples`: a small searchable catalog. Search is validated and stored in the URL; data is owned by TanStack Query.
- Light, dark, and system themes, with semantic Tailwind tokens.
- A configured HTTP client with Zod response validation, abort signals, API-boundary mocks, and normalized HTTP errors.
- Loading, empty, error, retry, refresh, and stale-data states.
- Tests for routing, filtering, query behavior, and transport behavior.
- One GitHub Actions quality workflow and optional Docker/nginx hosting.

There is deliberately no authentication provider, deployment account, global client store, or rich-text editor. Add these when your product requires them. The four retained UI primitives are Button, Card, Input, and Label. Add more with `pnpm exec shadcn add <component>`.

## Architecture

```text
src/
  app/                  # Environment validation, concrete dependencies, providers
  routes/               # File routes and URL validation
  pages/                # Screen composition
  widgets/              # Shared application shell; public API via index.ts
  features/
    example-catalog/    # Components, query hook, request, DTO, and mock
  shared/
    api/                # Domain-neutral HTTP transport and errors
    components/ui/      # Repository-owned shadcn primitives
    lib/                # Class-name utility
```

`#/*` resolves to `src/*`; `@/*` resolves to `src/shared/*`. External feature/widget consumers import their root `index.ts`. Concrete dependencies are constructed in `app/di`; feature API adapters may use its configured HTTP client. Shared transport never imports app or feature code. See [AGENTS.md](./AGENTS.md) for the full engineering rules; `CLAUDE.md` points to that same source.

`src/routeTree.gen.ts` is generated. Run `pnpm generate-routes` after changing route files; development, builds, and the typecheck command also generate it.

## Replace the example

1. Add your feature under `src/features/<name>` and export its supported surface from `index.ts`.
2. Compose it in a page and render the page from a thin file route.
3. Replace the example route/page/feature and update the shell navigation and home link. Remove `examples-page.search.ts` and its tests along with the example.
4. Introduce entities, services, or client stores only when there is a real shared concept or workflow requiring them.

Keep ephemeral UI state local, shareable navigation in the router, and server state in TanStack Query. The example intentionally has no fake writes or persistence.

## Connect an API

Copy `.env.example` to `.env.local` if you need configuration. All `VITE_*` values are public and embedded at build time; never put secrets in them.

| Variable | Default | Meaning |
| --- | --- | --- |
| `VITE_ENABLE_MOCK` | `true` | Use data attached through `.response(schema).mock(payload)` |
| `VITE_API_URL` | `https://example.invalid` | Base URL used when mocks are disabled |

`/examples/catalog` and its DTO are an illustrative contract, **not an implemented backend**. Replace the path, schema, and mock with your real API contract before setting `VITE_ENABLE_MOCK=false`. With mocks enabled the example makes no network requests. With mocks disabled, failures are shown in the example's retry UI; there is no fallback to fake success data.

Mocks live beside their schemas in `api/dto/*.mock.ts`, are typed as `z.input<typeof schema>`, and pass through the same Zod validation as live responses. The mock flag is injected at the app composition boundary; the shared request builder has no environment dependency. Empty mocked responses are supported.

The HTTP client does not assume cookie authentication, token refresh endpoints, or a login flow. Add authentication behavior centrally after choosing your real backend contract. HTTP errors retain status and headers; response-validation errors are non-retryable.

## Commands

```sh
pnpm check          # Biome formatting, imports, and lint checks
pnpm lint           # Lint only
pnpm typecheck      # Generate routes, then TypeScript
pnpm test           # Run tests once
pnpm build          # Production bundle in dist/
pnpm preview        # Serve the production bundle locally
```

Run `pnpm exec biome check --write src vite.config.ts index.html` to apply source formatting and safe lint fixes. GitHub Actions runs check, typecheck, tests, and build with the frozen lockfile. No deployments or external credentials are configured.

## Optional container

```sh
docker build -t react-template .
docker run --rm -p 8080:80 react-template
```

nginx serves `dist/` and falls back to `index.html` for client routes. Once a real API is implemented, pass `--build-arg VITE_API_URL=https://your-api.example --build-arg VITE_ENABLE_MOCK=false` during the build. Changing container runtime variables does not change the compiled Vite configuration.
