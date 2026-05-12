# TypeScript Errors — Knowledge Base

## What this covers
TypeScript compilation failures, type errors, missing type declarations.

## Environment
- TypeScript version: varies by project
- Strict mode may or may not be enabled
- Build fails if tsc exits non-zero

## Common patterns and fixes

### Type not assignable
Symptoms:
```
error TS2322: Type 'string' is not assignable to type 'number'
error TS2345: Argument of type 'X' is not assignable to parameter of type 'Y'
```
Fix: this requires a code change. Explain the exact line and what the correct type should be.
Cannot be auto-fixed — requires user to update source code.

### Cannot find module / no declaration file
Symptoms:
```
error TS2307: Cannot find module 'some-package' or its corresponding type declarations
```
Fix: install type definitions: `npm install --save-dev @types/some-package`
If no @types exist: add `declare module 'some-package'` to a .d.ts file.

### Property does not exist
Symptoms:
```
error TS2339: Property 'x' does not exist on type 'Y'
```
Fix: usually means accessing a property on a type that does not declare it.
Could be a typo, or needs a type assertion, or the type needs extending.

### Implicit any
Symptoms:
```
error TS7006: Parameter 'x' implicitly has an 'any' type
```
Fix: add explicit type annotation, or set `"noImplicitAny": false` in tsconfig (not recommended).

### Object possibly undefined
Symptoms:
```
error TS2532: Object is possibly 'undefined'
```
Fix: add null check before accessing, or use optional chaining `obj?.property`.

## Build config fixes
If TypeScript errors are blocking build but you want to ship JS anyway:
Add to tsconfig.json: `"noEmitOnError": false` — TypeScript will still emit JS despite errors.
Or use `tsc --noEmitOnError false` in buildCmd.
