# CLAUDE.md

This file provides guidance for AI assistants working with this codebase.

## Project Overview

This is `@spinque/query-api`, a TypeScript client library for the Spinque Query API. Spinque is a SaaS platform for data access and information retrieval. This library enables developers to:

- Execute search queries against Spinque workspaces
- Build faceted/filtered search interfaces
- Handle OAuth 2.0 authentication (Client Credentials and PKCE flows)
- Work with clustered search results

## Key Commands

```bash
npm run build       # Compile TypeScript to dist/
npm test            # Run Jest tests
npm run format      # Format code with Prettier
npm run check-format # Verify formatting
npm run docs        # Generate TypeDoc documentation
npm run demo        # Run demo examples
```

## Project Structure

```
src/
├── index.ts              # Main entry point, exports all public APIs
├── Api.ts                # Core Api class for sending queries
├── types.ts              # All TypeScript type definitions
├── utils.ts              # URL construction and utility functions
├── FilteredSearch.ts     # Faceted/filtered search abstraction
├── FacetedSearch.ts      # Deprecated wrapper (extends FilteredSearch)
├── clusters.ts           # Clustering utilities
├── snippet.ts            # Snippet extraction
├── authentication/       # OAuth implementations
│   ├── Authenticator.ts  # Abstract base class
│   ├── ClientCredentials.ts  # Server-side OAuth
│   ├── PKCE.ts           # Browser OAuth with PKCE
│   └── TokenCache.ts     # Token persistence interface
└── spec/                 # Jest test files
```

## Architecture

### Core Classes

- **Api** (`Api.ts`): Main entry point. Configured with workspace, api name, and optional auth. Use `api.fetch()` to execute queries.
- **FilteredSearch** (`FilteredSearch.ts`): Manages complex search state with filters and facets. Generates query stacks for results and facet options.
- **Authenticator** (`authentication/Authenticator.ts`): Abstract base for auth. Handles token lifecycle, caching, and refresh.

### Type System

The library uses advanced TypeScript patterns:
- **Discriminated unions** for config types (`ApiAuthenticationConfig`)
- **Generic type mapping** from `RequestType` to response types
- **Type guards** for runtime type narrowing

Key types in `types.ts`:
- `Query` - endpoint + parameters
- `ApiConfig` - workspace/api configuration
- `RequestType` enum - Count, Results, Statistics, Options, etc.
- `ResultsResponse<T>`, `CountResponse`, `StatisticsResponse`, `OptionsResponse`
- Error classes: `UnauthorizedError`, `EndpointNotFoundError`, etc.

## Code Conventions

### TypeScript
- **Strict mode** enabled with additional checks (`noImplicitOverride`, `noImplicitReturns`, etc.)
- Target: ES5 with CommonJS modules
- Declaration files generated for npm consumers

### Formatting
- Prettier with: 120 char line width, trailing commas, single quotes
- No ESLint - relies on strict TypeScript + Prettier

### Naming
- Private properties use underscore prefix: `_filters`, `_authentication`
- Interfaces use PascalCase: `ApiConfig`, `ResultsResponse`
- Utility functions use camelCase: `urlFromQueries`, `pathFromQuery`

### Error Handling
- Specific error classes for different HTTP failures
- Constructor validation throws descriptive errors
- Error messages come from the Spinque backend when available

## Testing

Tests are in `src/spec/` using Jest:
- `Api.spec.ts` - API construction and error handling
- `utils.spec.ts` - URL building and data transformation
- `FilteredSearch.spec.ts` - Filter state management
- `FacetedSearch.spec.ts` - Backwards compatibility

Run tests with: `npm test`

## Common Tasks

### Adding a new utility function
1. Add to `src/utils.ts`
2. Export from `src/index.ts`
3. Add tests in `src/spec/utils.spec.ts`

### Adding a new response type
1. Define interface in `src/types.ts`
2. Add to `RequestType` enum if needed
3. Update type mapping in `ResponseType` generic

### Modifying authentication
- Base class: `src/authentication/Authenticator.ts`
- Server flow: `src/authentication/ClientCredentials.ts`
- Browser flow: `src/authentication/PKCE.ts`

## Important Notes

- **Node.js >= 18** required (uses native fetch)
- Library works in both Node.js and browsers
- `FacetedSearch` is deprecated, use `FilteredSearch` instead
- Demo examples in `demo/` folder show typical usage patterns
- API documentation: https://spinque.github.io/query-api-ts/
