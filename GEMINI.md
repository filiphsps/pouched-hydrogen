# Gemini CLI Context for pouched-hydrogen

This document provides essential context for the Gemini CLI when interacting with the `pouched-hydrogen` project.

## Project Overview

`pouched-hydrogen` is an innovative Shopify theme named "Pilot," built with Shopify Hydrogen, React Router 7, and Weaverse. It's designed to create high-performance, lightning-fast storefronts for Shopify. The project emphasizes a streamlined development experience by integrating a powerful suite of tools and features.

**Key Technologies:**
*   **Frontend Framework:** Shopify Hydrogen (React-based), React Router 7
*   **Headless CMS/Builder:** Weaverse Studio
*   **Styling:** TailwindCSS v4, Radix-UI (accessible components), `class-variance-authority` (cva)
*   **State Management/Data:** GraphQL Code Generator, Shopify Customer Account API, Combined Listings, Product Bundles
*   **Developer Experience:** TypeScript, Biome (linter/formatter), Swiper (carousels), Framer Motion (animations)
*   **Integrations:** Judge.me (reviews), Klaviyo (email marketing)

## Project Structure

The core application logic and components reside within the `app/` directory:

*   `app/components/`: Reusable UI components.
*   `app/sections/`: Weaverse-specific sections and components for page building.
*   `app/routes/`: React Router routes, supporting locale prefixes.
*   `app/graphql/`: GraphQL queries and fragments used for data fetching.
*   `app/utils/`: Various helper functions and utilities.
*   `app/weaverse/`: Configuration and integration files for Weaverse.

**Key Configuration Files:**

*   `biome.json`: Configuration for code formatting and linting using Biome.
*   `codegen.ts`: Configuration for GraphQL code generation.
*   `react-router.config.ts`: React Router specific configuration.
*   `vite.config.ts`: Vite bundler configuration.
*   `vitest.config.ts`: Vitest unit testing configuration.
*   `server.ts`: Entry point for the server.

## Building and Running

This project uses `pnpm` as its package manager.

**Dependencies Installation:**
```bash
pnpm install
```

**Development Server:**
Starts the development server on `http://localhost:3456`.
```bash
pnpm run dev
```

**Code Quality and Type Checking:**
*   Format and lint code:
    ```bash
    pnpm run biome:fix
    ```
*   Perform TypeScript type checking:
    ```bash
    pnpm run typecheck
    ```

**Production Build:**
Builds the application for production deployment.
```bash
pnpm run build
```

**Testing:**
Runs end-to-end (E2E) tests.
```bash
pnpm run e2e
```

## Development Conventions

*   **TypeScript:** The project is written in TypeScript with a strict configuration.
*   **Code Formatting/Linting:** Biome is used for automated code formatting and linting to maintain consistent code style.
*   **JSDoc Comments**: When writing JavaScript or TypeScript code, always add JSDoc comments.
*   **Testing:** Vitest is used for unit tests and Playwright for E2E tests. New features and bug fixes should ideally include corresponding tests.
*   **Styling:** TailwindCSS v4 and Radix-UI are used for UI development.
*   **Weaverse Integration:** Sections and components designed for Weaverse Studio must adhere to specific patterns, including extending `HydrogenComponentProps` and exporting a `schema` object for studio configuration. Server-side data fetching for Weaverse components is handled via a `loader` function.
