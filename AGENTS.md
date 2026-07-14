# Cinema Ticket Booking — Agent Guide

## Project Structure

```
cinema-ticket-booking/
├── frontend/          # React 19 + Vite 8 + TypeScript 6
│   ├── src/           # Application source
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── backend/           # Express 5 + TypeScript 7
│   └── tsconfig.json
└── docs/PLAN.md       # Master implementation plan (phases 0-16)
```

## Build / Lint / Test Commands

### Frontend (React + Vite)
| Command | What it does |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | `tsc -b && vite build` (type-check then bundle) |
| `npm run lint` | `eslint .` (flat config, `eslint.config.js`) |
| `npm run preview` | Preview production build |

### Backend (Express + TypeScript)
| Command | What it does |
|---------|-------------|
| No dev/build scripts defined yet | Add to `backend/package.json` |

### Running a Single Test
No test framework is installed yet (frontend or backend). When adding one:
- Frontend: add Vitest (`npm install -D vitest`), tests live in `__tests__/` or co-located `*.test.ts(x)`, run with `npx vitest run --reporter=verbose src/Component.test.tsx`
- Backend: add Vitest or Go test, run with `npx vitest run path/to/test.test.ts` or `go test ./internal/domain/`

## Code Style Guidelines

### Imports
- Use `import type` for type-only imports (`verbatimModuleSyntax: true` is enforced in all tsconfigs)
- Frontend: use `.tsx` extension in relative imports (`allowImportingTsExtensions: true`)
- Backend: use `.js` extension in relative imports (`rewriteRelativeImportExtensions: true`)
- Group imports: external libs first, then internal modules, then CSS/assets
- No default exports except for pages/components; prefer named exports

### Formatting
- No Prettier config yet — rely on ESLint (`eslint.config.js` flat config)
- Semicolons omitted (ESLint doesn't enforce them)
- Single quotes for strings (ESLint default)
- JSX uses double quotes for attributes

### TypeScript & Types
- **No enums** (`erasableSyntaxOnly: true`). Use `const` objects with `as const` or union types of string literals
- **No parameter properties** (`erasableSyntaxOnly: true`)
- **No namespaces** (`erasableSyntaxOnly: true`)
- `strict: true` in backend — all strict checks enabled
- `noUnusedLocals: true`, `noUnusedParameters: true` in frontend — remove unused code
- `target: es2023`, `module: esnext` (frontend) / `module: nodenext` (backend)
- Prefer `interface` over `type` for object shapes; use `type` for unions, intersections, and aliases

### Naming Conventions
- **Components**: PascalCase, one component per file, file named after component (`Button.tsx`)
- **Hooks**: camelCase, prefixed with `use` (`useMovies`)
- **Functions/Variables**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE for truly immutable module-level constants
- **Files**: kebab-case for utilities (`api-client.ts`), PascalCase for components, camelCase for hooks
- **Types/Interfaces**: PascalCase prefixed with domain name (`Movie`, `CreateBookingRequest`)
- **CSS**: kebab-case class names in `.module.css` or plain CSS files

### Error Handling
- Validate all user input at the boundary (handler/controller layer)
- Business logic errors go in the service layer, not handlers
- Consistent JSON response format: `{ success: boolean, data?: T, error?: string }`
- Handle every possible error — never `catch` without handling
- Use structured logging, not `console.log`

### React Conventions
- Functional components only, hooks for stateful logic
- No class components
- Props typed with `interface` named `{ComponentName}Props`
- Avoid prop drilling — use composition or context
- Side effects in `useEffect` with proper cleanup

### Backend (Express) Conventions
- Clean Architecture: Handler → Service → Repository layering
- Handlers only parse HTTP requests and send responses
- Service contains business logic
- Repository handles data access
- Dependency injection between layers
- Interfaces between service and repository
- All config from environment variables (never hardcoded)

---

See `docs/PLAN.md` for the full phased implementation roadmap (Clean Architecture, Redis lock, RabbitMQ, WebSocket, Docker).
