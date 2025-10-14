# Copilot Instructions for TutorAgent-Nest

## Project Overview
- This is a NestJS (TypeScript) backend application, organized by modules in `src/`.
- Key modules: `auth/` (authentication), `user/` (user management), `socket/` (WebSocket gateway), and `common/` (shared utilities, guards, strategies).
- Configuration files are in `src/config/`.
- Data entities (e.g., `user.entity.ts`) are in their respective module folders.

## Architecture & Patterns
- Follows NestJS conventions: controllers, services, modules, DTOs.
- Guards (`src/common/guards/`) and strategies (`src/common/strategies/`) implement authentication (JWT, local).
- WebSocket integration via `src/socket/socket.gateway.ts`.
- DTOs for request validation are in `src/dto/`.
- Utilities and shared logic are in `src/common/utils/`.

## Developer Workflows
- **Install dependencies:** `npm install`
- **Run development server:** `npm run start:dev`
- **Run production server:** `npm run start:prod`
- **Run unit tests:** `npm run test`
- **Run e2e tests:** `npm run test:e2e`
- **Check test coverage:** `npm run test:cov`
- **Build for production:** `npm run build`

## Project-Specific Conventions
- Use DTOs for all controller inputs (see `src/dto/`).
- Authentication uses JWT and local strategies (see `src/common/strategies/`).
- Guards are used for route protection (see `src/common/guards/`).
- Configurations are loaded from `src/config/` and injected via NestJS providers.
- Logging utilities are in `src/common/utils/logger.ts` and `logging-stream.ts`.

## Integration Points
- External authentication (JWT, local) via Passport strategies.
- WebSocket events handled in `src/socket/socket.gateway.ts`.
- Database configuration in `src/config/database.config.ts` (ORM setup not shown, but config pattern is present).
- OpenAI integration configured in `src/config/openai.config.ts`.

## Examples
- To add a new protected route, create a controller in a module, use a DTO for input, and apply a guard from `src/common/guards/`.
- To add a new authentication strategy, implement it in `src/common/strategies/` and register in the relevant module.

## Key Files & Directories
- `src/app.module.ts`: Main application module, imports all feature modules.
- `src/main.ts`: Application entry point.
- `src/auth/`, `src/user/`, `src/socket/`: Feature modules.
- `src/common/`: Shared logic (guards, strategies, utils).
- `src/config/`: Configuration providers.
- `src/dto/`: Data transfer objects for validation.
- `test/`: End-to-end tests and Jest config.

---
_If any section is unclear or missing important project-specific details, please provide feedback to improve these instructions._
