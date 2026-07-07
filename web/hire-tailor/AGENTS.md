# Repository Guidelines

## Project Structure & Module Organization

Hire Tailor is an Angular 21 application. Source code lives in `src/`, with the root bootstrap in `src/main.ts`, global styles in `src/styles.scss`, and app wiring in `src/app/app.config.ts` and `src/app/app.routes.ts`. Feature screens are grouped under `src/app/features/`, shared layout under `src/app/layout/`, reusable services under `src/app/services/`, and typed data contracts under `src/app/models/`. Static public assets belong in `public/`; environment files are in `src/environments/`.

## Build, Test, and Development Commands

- `npm start`: runs the Angular dev server at `http://localhost:4200/`.
- `npm run build`: creates a production build in `dist/` using Angular budgets from `angular.json`.
- `npm run watch`: builds continuously with the development configuration.
- `npm test`: runs unit tests through Angular's Vitest-based unit test builder.
- `npm run lint`: runs Angular ESLint on `src/**/*.ts` and `src/**/*.html`.
- `npm run format`: applies Prettier to TypeScript, HTML, and SCSS files under `src/`.

## Coding Style & Naming Conventions

Use TypeScript, Angular standalone components, SCSS, and strict typed models where practical. Follow Angular file naming: `feature-name.component.ts`, matching `.html` and `.scss` files, and model files such as `user-profile.model.ts`. Component selectors must use the `app-` prefix in kebab case; directive selectors use `app` in camel case. Keep services named by responsibility, for example `storage.service.ts`. Run `npm run lint` and `npm run format` before handing off changes.

## Testing Guidelines

Unit tests use Vitest via `ng test`. Add specs next to the code they cover with the `*.spec.ts` suffix, especially for services, model transformations, and component logic that changes behavior. Keep tests focused on observable behavior rather than implementation details. There are currently no committed spec files, so new functionality should introduce the local test pattern it needs.

## Commit & Pull Request Guidelines

Recent history uses short conventional-style commits such as `feat: implement history feature` and `fix: correct import path`, plus branch merge titles like `Feature/generate template (#66)`. Prefer `feat:`, `fix:`, `docs:`, or `refactor:` followed by a concise imperative summary. Pull requests should include the user-facing change, validation performed (`npm test`, `npm run lint`, screenshots for UI changes), and any linked issue or follow-up risk.

## Security & Configuration Tips

Do not commit secrets or local credentials. Put runtime configuration behind `src/environments/environment.ts` and keep production overrides in `environment.prod.ts`. When changing Docker behavior, update both `Dockerfile` and `docker-compose.yml` expectations together.
