# React (Create React App / Vite) Build Errors — Knowledge Base

## Environment specifics
- CRA build command: `react-scripts build`
- Vite build command: `vite build`
- Output directory: build (CRA) or dist (Vite)

## Common patterns and fixes

### react-scripts not found
Symptoms:
```
sh: react-scripts: not found
```
Fix: react-scripts is in devDependencies. Change installCmd to `npm install --include=dev`.

### CI=true treating warnings as errors
Symptoms:
```
Treating warnings as errors because process.env.CI = true
Failed to compile
```
Fix: CRA sets CI=true which makes all ESLint warnings fail the build.
Options:
1. Fix the warnings (recommended)
2. Change buildCmd to: `CI=false npm run build`
3. Add .eslintignore for specific files

### Vite cannot find module
Symptoms:
```
error: Failed to resolve import "some-module"
```
Fix: check that the import path is correct and case-sensitive (Alpine Linux is case-sensitive unlike macOS).

### Public URL issues
Symptoms: build succeeds but assets 404 in deployment.
Fix: set homepage in package.json:
```json
"homepage": "/"
```
Or for Vite, set base in vite.config.js:
```js
export default { base: '/' }
```

### CRA TypeScript strict errors
Symptoms: TypeScript errors that did not fail locally.
Fix: local environment may have different tsconfig. Check tsconfig.json has same settings as CI.
