# soara/registry-ui

A modern Docker Registry UI built with Next.js 15, Tailwind CSS, and Shadcn-style components.

This repository currently includes the initial application shell, a server-side proxy for the registry catalog, and the first dashboard and repository browsing flows.
This version now also includes repository tag management, manifest inspection, and confirmed delete actions.

## Current Status

Implemented now:

- Premium dark application shell with sidebar navigation
- Dashboard overview page
- Searchable repository explorer backed by `/v2/_catalog`
- Searchable repository detail page with tag management cards
- Pull command generator with one-click copy
- Manifest inspector dialog with raw JSON, layers, platform metadata, and digest details
- Confirmed delete-tag flow resolved server-side through manifest digest lookup
- Next.js Route Handler proxy at `/api/registry/catalog`
- Next.js Route Handlers for tags, manifests, and delete-by-tag actions
- Centralized registry client logic in `lib/docker-api.ts`
- Registry auth support for anonymous, Basic auth, and bearer-token flows
- TanStack Query wiring for client-side caching
- Lazy manifest metadata loading to keep repository detail pages responsive

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.example .env.local
```

3. Configure your registry connection:

```env
REGISTRY_URL=http://localhost:5000
REGISTRY_USERNAME=
REGISTRY_PASSWORD=
REGISTRY_BEARER_TOKEN=
```

4. Start the development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`

## Environment Variables

`REGISTRY_URL`

- Required
- Base URL of your Docker Registry V2 instance
- Example: `http://registry.internal:5000`

`REGISTRY_USERNAME`

- Optional
- Used for Basic auth or bearer-token exchange

`REGISTRY_PASSWORD`

- Optional
- Used with `REGISTRY_USERNAME`

`REGISTRY_BEARER_TOKEN`

- Optional
- If set, bearer auth is used directly and takes precedence over Basic auth

## How It Works

The browser does not call the Docker Registry directly. Instead, the UI calls Next.js Route Handlers under `app/api/registry`, and those handlers forward requests to the registry server-side.

This gives you:

- No browser-side registry credentials
- No CORS issues against the registry
- A single place to handle auth, retries, and request shaping

The shared registry client lives in `lib/docker-api.ts`. That file is the main extension point for future catalog, tag, manifest, and delete operations.

## Pages

`/`

- Dashboard overview
- Shows repository count from the proxied catalog
- Includes a quick-start operator checklist

`/repositories`

- Searchable list of repositories returned by `/api/registry/catalog`
- Intended as the starting point for image and tag management

`/repositories/[repository]`

- Searchable tag list for the selected repository
- Pull command generator for each tag
- Manifest inspector dialog
- Confirmed tag deletion flow

`/settings`

- Explains the registry env contract used by the server-side proxy

## API Proxy

Available now:

- `GET /api/registry/catalog`
- `GET /api/registry/tags?repository=<name>`
- `GET /api/registry/manifests?repository=<name>&reference=<tag-or-digest>`
- `DELETE /api/registry/tag?repository=<name>&tag=<tag>`

Supported query params for catalog:

- `n`
- `last`

The proxy layer currently covers:

- Docker Registry `GET /v2/_catalog`
- Docker Registry `GET /v2/<name>/tags/list`
- Docker Registry `GET /v2/<name>/manifests/<reference>`
- Docker Registry `DELETE /v2/<name>/manifests/<digest>`

## Validation

Useful local checks:

```bash
npm run typecheck
npm run build
```

## Documentation

- Product direction: [PRD.md](./PRD.md)
- Usage guide: [docs/USAGE.md](./docs/USAGE.md)
