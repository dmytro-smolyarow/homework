# Client Pkg

**Purpose.** The `pkg/` (integration) layer of the Next.js client (`apps/client/src/pkg/`): thin wrappers that adapt third-party libraries — better-auth, next-intl, ky + TanStack Query, next-themes + shadcn/ui + sonner — into the app's own conventions, then expose them through barrel files (or stable deep paths) so the feature/widget/module/shared layers consume vendor SDKs only via the `@/pkg/*` alias.

It is split into four sub-packages: **auth**, **locale**, **rest-api**, **theme**.

```
pkg/
├── auth/      better-auth: client SDK + server-only session facade
├── locale/    next-intl: routing, navigation, request config
├── rest-api/  ky fetcher + TanStack Query client + provider
└── theme/     next-themes provider, cn util, shadcn/ui, sonner
```

## Key files

### auth
- `pkg/auth/client/auth.client.ts` — better-auth React client via `createAuthClient`, `baseURL: ${NEXT_PUBLIC_CLIENT_API_URL}/v1/auth`. Re-exported as `authClient` from `auth/client/index.ts`.
- `pkg/auth/server/auth.server.ts` — server-only (`import 'server-only'`) `authServer` facade with two methods:
  - `getSession()` — `fetch`es `${NEXT_PUBLIC_CLIENT_API_URL}/api/v1/auth/get-session` forwarding `next/headers`; returns `{ user: null, session: null }` on error.
  - `getCacheSession()` — reads the `better-auth.session_data` cookie (falling back to `__Secure-better-auth.session_data`) and verifies it as a JWT via `jose.jwtVerify` using `envServer.JWT_SECRET`.

### locale
- `pkg/locale/routing.ts` — `defineRouting({ locales: ['en'], defaultLocale: 'en', localePrefix: 'as-needed', localeDetection: false })`.
- `pkg/locale/navigation.ts` — `createNavigation(routing)` exporting locale-aware `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname`.
- `pkg/locale/request.ts` — `getRequestConfig`: resolves the active locale, lazy-imports messages from `../../../translations/${locale}.json`, and exports `formats` (dateTime `short`, number `precise`, list `enumeration`) `satisfies Formats`.
- `pkg/locale/index.ts` — barrel re-exporting navigation helpers, `getRequestConfig`, and `routing`.

### rest-api
- `pkg/rest-api/fetcher/rest-api.fetcher.ts` — `restApiFetcher`, a `ky` instance with `prefixUrl: ${NEXT_PUBLIC_CLIENT_API_URL}/v1` and `throwHttpErrors: false`.
- `pkg/rest-api/service/rest-api.service.ts` — `getQueryClient()` TanStack Query factory; fresh client per request on the server, cached `browserQueryClient` singleton in the browser (`isServer` switch). Defaults: `staleTime` 60s, `networkMode: 'offlineFirst'`, `refetchOnWindowFocus: false`, `placeholderData: keepPreviousData`; `dehydrate` also dehydrates `pending` queries.
- `pkg/rest-api/rest-api.provider.tsx` — `'use client'` `RestApiProvider` wrapping children in `QueryClientProvider` + `ReactQueryDevtools`.
- `pkg/rest-api/index.ts` — barrel exporting `restApiFetcher`, `RestApiProvider`, `getQueryClient`.

### theme
- `pkg/theme/theme.provider.tsx` — `'use client'` `ThemeProvider` wrapping next-themes (`attribute='class'`, `defaultTheme='system'`, `disableTransitionOnChange`).
- `pkg/theme/lib/utils.ts` — `cn(...)` = `twMerge(clsx(inputs))`, the className-merge util used by every ui component.
- `pkg/theme/services/toast.service.ts` — `toastService` imperative API (`success`/`info`/`warning`/`error`) wrapping sonner `toast` with inline CSS-var styling.
- `pkg/theme/ui/sonner.tsx` — the mounted `Toaster` renderer; themed via `useTheme`, with custom lucide icons and CSS-var styling.
- `pkg/theme/ui/button.tsx` — shadcn `Button` + `buttonVariants` (`cva`); the variant/size system reused elsewhere.
- `pkg/theme/components/ripple-button.tsx` — custom `motion/react` animated `RippleButton` composing `buttonVariants` + `cn` (lives under `components/`, **not** `ui/`).
- `pkg/theme/index.ts` — barrel exporting **only** `ThemeProvider`.

The `ui/` directory holds **12** shadcn/ui components: `animated-beam, badge, button, card, checkbox, drawer, dropdown-menu, input, label, separator, sonner, spinner`.

## Responsibilities / exports

| Sub-package | Wraps | Exposes |
| --- | --- | --- |
| auth | better-auth | `authClient` (client), `authServer.getSession` / `getCacheSession` (server-only) |
| locale | next-intl | `routing`, `Link`/`redirect`/`usePathname`/`useRouter`/`getPathname`, `getRequestConfig`, `formats` |
| rest-api | ky + TanStack Query | `restApiFetcher`, `getQueryClient`, `RestApiProvider` |
| theme | next-themes, shadcn/ui, sonner | `ThemeProvider`, `cn`, ui components (via `@/pkg/theme/ui/*`), `toastService`, `Toaster` |

Two distinct sonner surfaces: `toastService` is the imperative call site (styled per-variant), `Toaster` is the mounted renderer (themed, custom icons). All sub-packages read environment only through `envClient`/`envServer` from `@/config/env` (see [[client-config]]) — never `process.env` directly.

## Depends on / talks to

- [[client-config]] — every wrapper pulls `envClient.NEXT_PUBLIC_CLIENT_API_URL` / `envServer.JWT_SECRET` from `@/config/env`.
- [[auth]] — `authClient`/`authServer` are the client-side end of the better-auth flow whose server lives in the API/Payload backend.
- [[client-app]] — `app/(web)/[locale]/layout.tsx` mounts `ThemeProvider` > `RestApiProvider` + `Toaster`.
- [[client-routing]] — `middleware.ts` imports `routing` (from `@/pkg/locale`) for next-intl middleware and `authServer.getSession` for protected-route guards; `getCacheSession` exists for cookie-fast paths.
- [[client-modules-widgets]] — sign forms (`app/modules/sign/elements/*`) import `authClient`, `toastService`, `locale` navigation, and `ui/*` directly.
- [[client-shared]] — shared hooks/components also consume `cn` and ui primitives.
- [[data-flow]] — `restApiFetcher` + `getQueryClient` are the request/cache plumbing for data fetching.
- [[server-pkg]] — the backend counterpart that actually issues sessions and signs cookies.

See [[index]] and [[architecture]] for where `pkg/` sits in the overall layering.

## Uncertainties / discrepancies

- **Auth base-path mismatch.** `auth.client.ts` sets better-auth `baseURL` to `.../v1/auth`, while `auth.server.ts` fetches `.../api/v1/auth/get-session` (note the extra `/api`). Possibly intentional (better-auth may append `/api` internally), but unverified against the auth backend. See [[auth]].
- **`restApiFetcher` has no consumers** outside `pkg/rest-api/` in the current scaffold — confirmed by grep; it is plumbing awaiting `api`/`model` slices.
- **`theme/index.ts` barrels only `ThemeProvider`.** ui components, `cn` (`lib/utils`), and `toastService` are imported via their full `@/pkg/theme/...` paths, so the barrel is not the single entry point for this sub-package. Likewise `middleware.ts` imports `authServer` via the deep path `./pkg/auth/server/auth.server` rather than a barrel.
- **`getCacheSession` JWT assumption.** It verifies `better-auth.session_data` as an HS256 JWT signed with the shared `JWT_SECRET`; whether the auth server actually signs that cookie this way is not verifiable from the client repo alone. (unverified)
- **`framer-motion` vs `motion`.** `package.json` lists both `motion ^12.23.24` and `framer-motion ^12.23.24`; `ripple-button.tsx` imports from `motion/react`.

Versions (`apps/client/package.json`): better-auth `^1.4.5`, next-intl `^4.5.6`, ky `^1.14.0`, @tanstack/react-query `^5.90.11` + devtools `^5.91.1`, next-themes `^0.4.6`, sonner `^2.0.7`, clsx `^2.1.1`, tailwind-merge `^3.4.0`, class-variance-authority `^0.7.1`, motion `^12.23.24`, lucide-react `^0.555.0`, plus `@radix-ui/react-{checkbox,dialog,dropdown-menu,label,separator,slot}`.
