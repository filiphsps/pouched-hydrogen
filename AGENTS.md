# AGENTS.md

This file guides AI agents working in this repository.

## Build, Lint, and Test Commands

- **Build**: `pnpm run build`
- **Lint/Format**: `pnpm run biome:fix` (auto-fix), `pnpm run biome` (check only)
- **Typecheck**: `pnpm run typecheck`
- **Test**: `pnpm test` (all tests), `pnpm test <file_path>` (single test)
- **E2E Tests**: `pnpm run e2e`

## Code Style Guidelines

- **Naming**: `camelCase` for variables/functions, `PascalCase` for components, `kebab-case` for files, `ALL_CAPS` for constants.
- **Formatting**: 2 spaces indentation, double quotes, semicolons, trailing commas. Biome is used for enforcement.
- **TypeScript**: Always type parameters/returns, avoid `any`, use interfaces. GraphQL types are auto-generated.
- **Imports**: Use `~/` path alias for app directory imports.
- **Error Handling**: Utilize `Promise.all().catch()`, graceful degradation, retry logic, and React Router error boundaries.

Refer to `.agent/rules/base.md` for additional agent-specific rules.