<div align="center">
  <img src="public/logos/logo-text.svg" alt="Roomdoo Logo" width="300" />
</div>

# Roomdoo

![Coverage](https://img.shields.io/badge/coverage-87%25-brightgreen)

Roomdoo is a modern Property Management System (PMS) web application built with **Vue 3**, **TypeScript**, and **Vite**. It leverages **PrimeVue** for UI components and **Pinia** for state management, providing a robust and responsive interface for managing properties, contacts, and reservations.

## � Architecture

The project is designed following **Hexagonal Architecture (Ports and Adapters)** principles to promote decoupling, testability, and maintainability. The codebase is organized into four distinct layers:

- **Domain**: This core layer contains business entities, logic, and interface definitions. It is completely isolated from the UI and external frameworks.
- **Application**: Coordinates use cases and application services, acting as a bridge between the Domain and the Infrastructure/UI layers.
- **Infrastructure**: Handles external communications and implementation details, such as API calls, state management (Pinia stores), and third-party library integrations.
- **UI**: The presentation layer, responsible for rendering Vue 3 components and handling user interactions.

## �🚀 Tech Stack

- **Framework:** [Vue 3](https://vuejs.org/) (Composition API, Script Setup)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **UI Library:** [PrimeVue](https://primevue.org/) + [TailwindCSS](https://tailwindcss.com/)
- **Routing:** [Vue Router](https://router.vuejs.org/)
- **Internationalization:** [Vue I18n](https://kazupon.github.io/vue-i18n/)
- **Testing:** [Vitest](https://vitest.dev/)
- **Validation:** [Zod](https://zod.dev/) & [Vee-Validate](https://vee-validate.logaretm.com/v4/)

## 🛠 Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `^24.8.0` (Recommended)
- **npm**: `^11.6.0`

## 📦 Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd roomdoo-vite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## 💻 Development

Start the development server with hot-reload:

> **Important:** Ensure you have a `.env.development` file in the root directory with the necessary environment variables.

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173` (or the port shown in your terminal).

## 🏗 Build

To build the application for production:

```bash
npm run build
```

To build for staging environment:

> **Important:** This command requires a `.env.staging` file in the root directory.

```bash
npm run build:staging
```

To preview the built application locally:

```bash
npm run preview
```

## ✅ Testing & Quality

### Unit Tests

Run unit tests using Vitest:

```bash
npm run test:unit
```

Run tests with coverage report:

```bash
npm run coverage
```

### Linting & Formatting

Check for linting errors:

```bash
npm run lint
```

Automatically fix linting errors:

```bash
npm run lint:fix
```

Check TypeScript types:

```bash
npm run type-check
```

Format code with Prettier:

```bash
npm run prettier:write
```

## 📂 Project Structure

- `src/` - Source code key directories:
  - `ui/` - UI components and views.
  - `infrastructure/` - Store definitions, API clients, and plugins.
  - `domain/` - Type definitions and business logic.
  - `assets/` - Static assets.
- `public/` - Public assets served as-is.
