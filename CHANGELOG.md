# reference-extension

## 1.0.0

### Major Changes

- 1dc7b8f: first release

### Patch Changes

- c10d193: added mittwald client instantiation to authentication middleware
- a5ed5dc: added comment system to demonstrate non-mStudio data handling
- 1baaaa0: implemented get-project and edit-project-description server functions as well as a minimalistic frontend to demonstrate them
- 6f564c8: implemented middlewares to verify session token and gain access tokens from it
- fbe529c: implemented better error handling for server functions
- 68786a6: refactored to use mitthooks and mitthooks-drizzle for webhook bootstrapping and extension storage
- de6005a: set up drizzle and added an example schema for extension instances
- bc91efd: developed a fancier frontend to show off some usage of flow components
- 7c8ea49: added webhook implementation and documentation how to test webhooks locally

## 0.0.7

### Patch Changes

- e2da26d: change package name to be scoped with mittwald

## 0.0.6

### Patch Changes

- c84841f: set publish config in package.json explicitly

## 0.0.5

### Patch Changes

- ccc8dc0: use github as package registry

## 0.0.4

### Patch Changes

- c392811: tested changesets

## 0.0.3

### Patch Changes

- 878d4b2: tested changesets

## 0.0.2

### Patch Changes

- 0a3b392: initialized tanstack
- 0a3b392: added .editorconfig matching formatter config
- 0dc0bb1: tested changeset integration
- 0a3b392: added Dockerfile and docker-compose for production and local development
- 0a3b392: added biome config for linting and formatting
