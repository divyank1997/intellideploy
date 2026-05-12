# Next.js Build Errors — Knowledge Base

## Environment specifics
- Build command: `npm run build` which calls `next build`
- Output directory: .next
- Node 20 required (Next.js 13+ drops Node 16)

## Common patterns and fixes

### App Router vs Pages Router conflict
Symptoms:
```
Error: You cannot use both "app" and "pages" directories
```
Fix: choose one. Delete either /app or /pages directory. Cannot use both in Next.js 13+.

### Missing next.config.js output setting
Symptoms: build succeeds but no static files produced for deployment.
Fix: for static export add to next.config.js:
```js
const nextConfig = { output: 'export' }
module.exports = nextConfig
```
Output will be in /out directory not /.next.

### Dynamic routes break static export
Symptoms:
```
Error: Page "/[slug]" is missing "generateStaticParams()"
```
Fix: static export requires all dynamic routes to declare their params at build time via generateStaticParams().

### Image optimization not compatible with static export
Symptoms:
```
Error: Image Optimization using the default loader is not compatible with `next export`
```
Fix: add to next.config.js:
```js
images: { unoptimized: true }
```

### next/font network request during build
Symptoms:
```
Error: Failed to download font
```
Fix: next/font tries to download fonts at build time but container has no network.
Use local font files or remove next/font and use standard CSS @import.

### Webpack 5 memory issue with large Next.js apps
Symptoms: exit code 137 (OOM) during next build
Fix: add to next.config.js:
```js
experimental: { workerThreads: false, cpus: 1 }
```
Also set NODE_OPTIONS=--max-old-space-size=400 in buildCmd.
