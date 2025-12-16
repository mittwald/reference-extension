# @mittwald/reference-extension

## 1.0.0

### Major Changes

Initial release of the mittwald reference extension - a comprehensive example implementation demonstrating best practices for building mStudio extensions.

### Features

- **Authentication & Authorization**
  - Session token verification middleware
  - Access token retrieval from session tokens
  - Mittwald API client integration with authentication

- **Webhook System**
  - Webhook implementation and handler setup
  - Local webhook testing documentation
  - Webhook bootstrapping using mitthooks

- **Database Integration**
  - Drizzle ORM setup with PostgreSQL
  - Extension instance schema
  - Storage management using mitthooks-drizzle

- **Server Functions**
  - Project retrieval functionality
  - Project description editing
  - Comment system for demonstrating non-mStudio data handling
  - Comprehensive error handling

- **Frontend**
  - Modern UI built with TanStack Start
  - Flow component integration
  - Project management interface
  - Comment system demonstration

- **Developer Experience**
  - Docker and Docker Compose setup for development and production
  - Biome configuration for linting and formatting
  - Strict TypeScript configuration
  - EditorConfig for consistent code style
  - Comprehensive project documentation
  - Security policy for vulnerability reporting