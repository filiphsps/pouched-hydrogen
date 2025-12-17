# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical Rules

- **MUST use pnpm** (not npm or yarn), including pnpx
- **NEVER start the dev server yourself** - it's already running on localhost:3456
- **MUST implement and fix things properly** - no shortcuts, hardcoding, or lazy solutions
- **Tailwind:** When using the `cn` util, combine classes into one long string instead of multiple rows
- **Temporary files:** Use `.tmp` extension and delete when done

## Commands

```bash
# Development (already running - don't start)
pnpm run dev              # Port 3456
pnpm run dev1             # Port 3457 (alternative)

# Building
pnpm run build            # Production build
pnpm run build:netlify    # Netlify Edge Functions build

# Code Quality
pnpm run typecheck        # TypeScript validation
pnpm run biome:check      # Lint check
pnpm run biome:format     # Format code
pnpm run format           # Auto-fix all issues

# Testing
pnpm test                 # Run all unit tests (Vitest)
pnpm test <file>          # Run single test file
pnpm run test:watch       # Watch mode
pnpm run test:coverage    # Coverage report
pnpm run e2e              # Playwright E2E tests

# GraphQL
pnpm run codegen          # Generate GraphQL types
```

## Architecture

**Stack:** Shopify Hydrogen 2025.7.0, React Router v7, React 19, Weaverse CMS, TailwindCSS v4

**Deployment:** Primary on Shopify Oxygen, secondary on Netlify Edge Functions (Deno)

### Directory Structure

```
app/
├── .server/          # Server-only code (context, loaders, redirects, SEO)
├── components/       # Reusable UI components (layout, product, cart, filters)
├── sections/         # Weaverse-editable page sections (30+ registered)
├── routes/           # React Router routes with optional ($locale) prefix
├── graphql/          # GraphQL queries and fragments
├── hooks/            # Custom React hooks
├── lib/              # Shared libraries
├── utils/            # Helper functions
├── weaverse/         # Weaverse CMS integration (components.ts, schema.server.ts)
├── locales/          # i18n translations (de/, en/)
├── entry.client.tsx  # Client hydration
├── entry.server.tsx  # Server rendering (Oxygen)
└── entry.netlify.server.ts  # Netlify Edge entry
```

### Key Patterns

**Weaverse Sections:** Must extend `HydrogenComponentProps`, include `ref` prop forwarding, and export a `schema` object. Server-side data fetching uses optional `loader` function.

**Data Flow:** Critical data blocks rendering, deferred data streams via `Promise.all()`. Uses React 19 `renderToReadableStream`.

**Routing:** File-based with optional `(:locale?)` prefix for German (DE) and English (EN) support.

**Styling:** TailwindCSS v4 utilities + Radix-UI primitives + CVA for component variants.

**State:** Zustand for client state, Shopify Customer Account API for auth.

### Integrations

- **Judge.me:** Product reviews (widgets, star ratings, review submission)
- **Klaviyo:** Email/SMS marketing, newsletter forms
- **Shopify:** Bundles, Subscriptions (Selling Plans), Combined Listings

## Conventions

- **TypeScript:** Strict config - always type params/returns, avoid `any`, use interfaces
- **JSDoc:** Required for all JS/TS code
- **Naming:** `camelCase` (vars/functions), `PascalCase` (components), `kebab-case` (files), `ALL_CAPS` (constants)
- **Imports:** Use `~/` path alias for app directory imports
- **Error Handling:** `Promise.all().catch()`, graceful degradation, React Router error boundaries

## Testing

- **TDD required:** Every change needs meaningful tests
- **Vitest:** Component testing following best practices (user interactions, accessibility, mock externals)
- **Playwright:** E2E for critical paths
- **Test mocks:** Located in `tests/mocks/`, setup in `tests/setup.ts`

## Project Context

This is "Pouched" - a B2C storefront selling Swedish tobacco-free snus (nicotine pouches) to the German market. Key features include age verification (18+), GDPR cookie consent, wishlist, advanced filtering, subscription plans, and quantity-based pricing. Target: highest Google rankings + best customer experience.
