# General Build Failures — Knowledge Base

## What this covers
Build failures that do not fit a specific category — script errors, misconfigured build commands, unknown errors.

## Environment
- Build command runs as: sh -c "npm install && npm run build"
- Working directory: /app
- No internet access
- Node 20, Alpine Linux

## Common patterns and fixes

### npm run build script not found
Symptoms:
```
npm error Missing script: "build"
```
Fix: package.json has no "build" script defined.
User needs to add a build script, or the framework is not a Node.js project.
If static HTML — no build command needed, outputDir should be ".".

### sh: command not found
Symptoms:
```
sh: webpack: not found
sh: react-scripts: not found
sh: vite: not found
```
Fix: build tool is in devDependencies but not installed because NODE_ENV=production.
Change installCmd to: `npm install --include=dev`

### Exit code 1 with no clear error
Symptoms:
```
Build failed with exit code 1
(minimal output)
```
Fix: check stderr output above this line — the real error is usually a few lines up.
Common causes: test suite running as part of build and failing, linting errors treated as errors.

### Port binding errors (should not happen but sometimes does)
Symptoms:
```
Error: listen EADDRINUSE :::3000
```
Fix: build script is trying to start a dev server instead of building.
Check package.json "build" script — it should run `next build` or `react-scripts build`, not `next dev`.

### Circular dependency warnings causing failure
Symptoms:
```
WARNING in Circular dependency detected
```
These are usually warnings not errors. If build still fails, check if --bail flag is set in webpack config.
