# TutorAgent Backend

A **NestJS backend** for an agentic tutor system. This backend interprets system specifications (blueprints) provided by authorized designers and dynamically instantiates agents to fulfill learning workflows. End users can interact with these agents as if they were real tutors.

---

## Table of Contents

- [Project Description](#project-description)  
- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Prerequisites](#prerequisites)  
- [Installation](#installation)  
- [Running the Project](#running-the-project)  
- [Scripts](#scripts)  
- [Project Structure](#project-structure)  
- [Future Improvements](#future-improvements)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Project Description

This backend serves as the **orchestrator for a multi-agent tutor system**:

- System admins provide a **blueprint** describing a learning workflow.  
- Each workflow may include multiple agents, each with **its own system prompt, responsibilities, and sequence of actions**.  
- When a user interacts with the system, the backend instantiates the workflow and routes messages to the agents, making it **appear as if the user is talking to a real tutor**.  

---

## Features

- User authentication (including Google login)  
- Session management with JWT tokens  
- Dynamic agent workflow instantiation based on blueprints  
- Fully type-safe using **Prisma**  
- Development-ready SQLite database (planned PostgreSQL support)  
- Clear modular NestJS architecture  

---

## Tech Stack

- **Backend Framework:** NestJS  
- **ORM:** Prisma  
- **Database:** SQLite (development), PostgreSQL (planned)  
- **Cache / Queue:** Redis (planned)  
- **Authentication:** JWT, Google OAuth2  
- **Testing:** Jest  
- **Linting & Formatting:** ESLint, Prettier  

---

## Prerequisites

- Node.js >= 18.x  
- npm or Yarn  
- SQLite (bundled, no separate install required for dev)  
- PostgreSQL & Redis (optional / planned for production)  

---

## Installation

# Clone the repository
git clone <your-repo-url>
cd <your-project-folder>

# Install dependencies
npm install

---

## Running the Project

### Development

# Start in watch mode
npm run start:dev

### Production

# Build the project
npm run build

# Run the compiled app
npm run start:prod

### Debugging

# Start with debugger enabled
npm run start:debug

## Recommended Prisma Commands

# Validate schema
npx prisma validate

# Generate Prisma client
npx prisma generate

# Push schema changes (creates tables in DB)
npx prisma db push

# Reset development database (drops all data)
npx prisma db reset
---

## Scripts

| Script            | Description |
|------------------|-------------|
| npm run start   | Start the app |
| npm run start:dev | Start in development mode with watch |
| npm run start:debug | Start in debug mode |
| npm run start:prod | Start compiled production build |
| npm run build   | Compile the project |
| npm run lint    | Lint and fix code using ESLint |
| npm run format  | Format code using Prettier |
| npm run test    | Run Jest tests |
| npm run test:watch | Run Jest in watch mode |
| npm run test:cov | Run tests with coverage |
| npm run test:e2e | Run end-to-end tests |
| npm run prisma:validate | Validate Prisma schema |
| npm run prisma:generate | Generate Prisma client |
| npm run prisma:push | Push schema changes to database (creates tables) |
| npm run prisma:reset | Reset database (drops all data) and reapply migrations |
---

## Project Structure

src/
├── common/           # Utility functions, guards, types, strategies
├── user/             # User module, service, entity
├── user-session-management/ # User session management module
├── prisma/           # Prisma client and schema
├── auth/             # Authentication module, service, controller
├── main.ts           # Application entry point

---

## Future Improvements

- Replace SQLite with **PostgreSQL** for production.  
- Integrate **Redis** for caching and message queueing.  
- Add more advanced agent orchestration and workflow visualization.  
- Implement full logging, monitoring, and error tracking.  

---

## Contributing

1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/your-feature`)  
3. Commit your changes (`git commit -m 'Add some feature'`)  
4. Push to the branch (`git push origin feature/your-feature`)  
5. Create a Pull Request  

---

## License

This project is MIT licensed.
