# Vue.js Build Errors — Knowledge Base

## Environment specifics
- Build command: `npm run build` which calls `vite build` or `vue-cli-service build`
- Output directory: dist
- Vue 3 uses Vite by default, Vue 2 uses webpack via vue-cli

## Common patterns and fixes

### vue-cli-service not found
Symptoms:
```
sh: vue-cli-service: not found
```
Fix: @vue/cli-service is in devDependencies. Change installCmd to `npm install --include=dev`.

### Vue 2 to Vue 3 composition API errors
Symptoms:
```
[plugin:vite:vue] TypeError: Cannot read properties of undefined
```
Fix: mixing Vue 2 Options API patterns with Vue 3 Composition API.
Check that @vue/composition-api plugin is installed for Vue 2, or migrate to Vue 3 properly.

### Vite build fails on process.env references
Symptoms:
```
ReferenceError: process is not defined
```
Fix: Vite uses import.meta.env not process.env.
Replace process.env.X with import.meta.env.VITE_X in source code.

### Large bundle size warning treated as error
Symptoms:
```
(!) Some chunks are larger than 500 kB after minification
```
This is a warning not an error by default. If build fails, add to vite.config.js:
```js
build: { chunkSizeWarningLimit: 1000 }
```
Or better — add code splitting with dynamic imports.

### CSS preprocessor not found
Symptoms:
```
Error: Cannot find module 'sass' / 'less' / 'stylus'
```
Fix: add the preprocessor to dependencies: `npm install sass` (or less/stylus).
