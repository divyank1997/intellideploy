# Memory Limit Errors — Knowledge Base

## What this covers
Build process killed due to exceeding 512MB container memory limit.

## Environment
- Container memory hard limit: 512MB
- Node.js default heap: ~1.5GB (will hit container limit first)
- Common culprits: webpack, TypeScript compiler, large dependency trees

## Common patterns and fixes

### JavaScript heap out of memory
Symptoms:
```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```
Fix: increase Node.js heap via env flag in buildCmd:
`NODE_OPTIONS=--max-old-space-size=400 npm run build`
Note: keep under 450MB to leave room for OS overhead within 512MB limit.

### Webpack build killed (no error message, exit code 137)
Symptoms:
```
Build failed with exit code 137
(no other output)
```
Exit code 137 = container OOM kill by Docker.
Fix options (in order of preference):
1. Add code splitting to webpack config
2. Use `NODE_OPTIONS=--max-old-space-size=400 npm run build`
3. Reduce bundle size — check for accidentally bundled node_modules

### TypeScript compiler OOM
Symptoms:
```
error TS: JavaScript heap out of memory
```
Fix: use `tsc --incremental` or split tsconfig into smaller projects.
Or set `NODE_OPTIONS=--max-old-space-size=400` before tsc.

## Prevention
- Use dynamic imports for large dependencies
- Enable webpack SplitChunksPlugin
- Use tree shaking (ensure package.json has `"sideEffects": false`)
- Avoid importing entire libraries when only one function is needed
