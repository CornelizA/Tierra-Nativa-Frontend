## Quick orientation for AI coding agents

This repository is a React + Vite frontend for the "Tierra Nativa" travel packages project. Use these notes to be immediately productive and to follow project-specific patterns.

- **Project type:** Vite React app (ES modules) located at the repository root. Run scripts are in `package.json`.
- **Dev commands:**
  - `npm run dev` — start Vite dev server
  - `npm run build` — build production bundle
  - `npm test` — run Jest tests

- **Backend / env:** The frontend expects a backend at `http://localhost:8080` by default. The repo uses the environment variable `VITE_API_URL` (referenced in docs). Many service calls assume the API root path `/paquetes`.

**Where to look first (big-picture files):**
- `src/service/PackageTravelService.js` — central API layer. All HTTP calls, error handling (`apiHandleErrorAlert`) and alerts (`fireAlert`) are here; reuse this layer or its patterns when adding network logic.
- `src/context/PackageTravelProvider.jsx` and `src/context/PackageDetailedProvider.jsx` — contain the Context providers and common patterns for fetching, updating and exposing state+actions to components. Follow the provided function names (`fetchPackageTravel`, `addPackageTravel`, `updatePackageTravel`, `removePackageTravel`) when interacting with package state.
- `src/component/` and `src/pages/` — UI components are small, PascalCase `.jsx` files. Styles are co-located in `src/style/` (filename matches component name).
- `test/` — Jest + React Testing Library tests that mirror component names. Look here for expected props/behavior when making changes.

**Patterns & conventions (concrete):**
- Components are named and stored as `PascalCase.jsx` under `src/component` or `src/pages` (e.g., `NavBarComponent.jsx`, `PackageTravelCard.jsx`).
- Global state uses React Context. Provider files export methods and the provider itself; they fetch on mount with `useEffect` and expose arrays + CRUD helpers.
- API helpers always use `axios` and centralized error handling in `src/service/PackageTravelService.js`. Use `getAuthHeader()` to attach JWT from `sessionStorage` for authenticated calls.
- UI alerting uses `sweetalert2` via `fireAlert`/`apiHandleErrorAlert` in the service file — prefer those for consistent user messages.
- CSS files live in `src/style/` and are plain CSS files imported by components; keep className usage consistent with existing files.

**Testing and linting notes:**
- Tests run with `jest`. Project already uses `@testing-library/react` and `@testing-library/jest-dom`.
- Use the `test/` folder examples to match mocking and render patterns (e.g., `mockData.js`).

**Data flow & integration points:**
- Entry: `main.jsx` mounts the app and providers. Most pages read package lists from `PackageTravelContext` which is populated by `apiGetPackagesPublic()`.
- Authentication flow: `apiLogin()` stores `jwtToken` in `sessionStorage`. Authenticated admin endpoints use `getAuthHeader()` in `PackageTravelService.js`.
- Categories are fetched via `apiGetCategoriesPublic` / `apiGetCategories` and category-specific results use `apiGetCategoriesByCategory(categorySlug)` (see debug logs in service file).

**When editing or adding features, follow these rules:**
- Reuse functions from `src/service/PackageTravelService.js` for network requests and error alerts rather than duplicating logic.
- When introducing new global state, add a context provider following the pattern in `src/context/*Provider.jsx` and export names consistent with existing providers.
- Keep component files small. If adding styles, place them in `src/style/` with a filename matching the component.
- Update or add tests in `test/` to cover new components or pages. Mirror the pattern in existing tests.

**Merging policy for instructions:**
- If a `.github/copilot-instructions.md` already exists, merge existing content that documents human/team preferences. Preserve any listed workflows; add missing concrete file references shown above.

If any of these points are unclear or you'd like the instructions expanded (examples for tests, CI, or a contributor checklist), tell me which parts to expand. 
