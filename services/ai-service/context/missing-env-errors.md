# Missing Environment Variable Errors — Knowledge Base

## What this covers
Build or runtime failures caused by missing or undefined environment variables.

## Environment
- Container env: only NODE_ENV=production is set by default
- No .env files are loaded inside the build container
- Environment variables must be explicitly passed to the container

## Common patterns and fixes

### process.env.X is undefined
Symptoms:
```
Error: process.env.DATABASE_URL is undefined
TypeError: Cannot read properties of undefined (reading 'split')
```
Fix: the build script requires an env variable that was not provided.
This cannot be auto-fixed — user must add the variable to their project settings.
Explain which variable is missing from the error log.

### Next.js NEXT_PUBLIC_ variables
Symptoms:
```
Error: Missing required env var: NEXT_PUBLIC_API_URL
```
Fix: Next.js requires public env variables to be prefixed with NEXT_PUBLIC_.
Variable must be provided at BUILD time, not just runtime, for client-side code.

### Vite import.meta.env variables
Symptoms:
```
import.meta.env.VITE_X is undefined
```
Fix: Vite env variables must be prefixed with VITE_.
Must be provided at build time.

### dotenv not loading
Symptoms:
```
require('dotenv').config() — no error but variables still undefined
```
Fix: .env file is likely gitignored and not in the repo.
The build container only has committed files.
Solution: use the project env variable settings to inject values.

## Important note
Environment variables containing secrets should never be committed to the repo.
They should be configured in the IntelliDeploy project settings (coming soon).
