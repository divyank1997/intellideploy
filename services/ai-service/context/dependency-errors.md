# Dependency Errors — Knowledge Base

## What this covers
npm/yarn install failures, peer dependency conflicts, missing packages, version mismatches.

## Environment
- Build runs inside Docker container: node:20-alpine
- No network access during build (NetworkMode: none)
- npm install must complete using only what is in package.json and package-lock.json
- Node version: 20.x LTS

## Common patterns and fixes

### Peer dependency conflict
Symptoms in logs:
```
npm error ERESOLVE unable to resolve dependency tree
npm error peer dep missing
npm error Found: react@18.x
npm error Could not resolve dependency: react@17.x
```
Fix: align all react/react-dom versions. Run `npm install react@18 react-dom@18 --save`.
If using legacy packages that require React 17, use `npm install --legacy-peer-deps` as buildCmd.

### Package not found
Symptoms:
```
npm error 404 Not Found
npm error '@scope/package' is not in this registry
```
Fix: package name is misspelled, or it is a private package not accessible. Check package.json spelling.

### Lock file out of sync
Symptoms:
```
npm error EINTEGRITY
npm error sha512 hash mismatch
```
Fix: delete package-lock.json and run npm install again. In buildCmd use: `rm -f package-lock.json && npm install && npm run build`

### Cannot find module after install
Symptoms:
```
Error: Cannot find module 'some-package'
Require stack: ...
```
Fix: package is in devDependencies but NODE_ENV=production skips devDependencies install.
Move it to dependencies, or change installCmd to `npm install --include=dev`.

## Auto-fixable commands
- Peer conflict: `npm install --legacy-peer-deps`
- Hash mismatch: `rm -f package-lock.json && npm install`
- Missing dev deps: `npm install --include=dev`
