# soaraid/registry-ui

A modern Docker Registry UI built with Next.js 15, Tailwind CSS, and Shadcn-style components.

This repository now includes the premium app shell, the server-side Docker Registry proxy, repository and tag management flows, manifest inspection, a guarded delete workflow, and an optional login session for protecting the UI itself.

## Current Status

Implemented now:

- Premium dark application shell with sidebar navigation
- Dashboard overview page
- Searchable repository explorer backed by `/v2/_catalog`
- Searchable repository detail page with tag management cards
- Pull command generator with one-click copy
- Manifest inspector dialog with raw JSON, layers, platform metadata, and digest details
- Delete preview flow with impact analysis
- Hard block for shared-digest deletes in plain Docker Registry mode
- Safe bulk cleanup preview and execution for singleton digests only
- Next.js Route Handler proxy at `/api/registry/catalog`
- Next.js Route Handlers for tags, manifests, and delete-by-tag actions
- Registry health diagnostics route and Settings test action
- Centralized registry client logic in `lib/docker-api.ts`
- Registry auth support for anonymous, Basic auth, and bearer-token flows
- Optional env-driven app login session for UI access
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
APP_AUTH_USERNAME=
APP_AUTH_PASSWORD=
APP_SESSION_SECRET=
APP_BRAND_NAME=Soara
APP_PRODUCT_NAME=Registry UI
```

4. Start the development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`

## Docker

Production packaging is now included:

- [Dockerfile](./Dockerfile)
- [.dockerignore](./.dockerignore)
- [docker-compose.yml](./docker-compose.yml)
- [docker-compose.example.yml](./docker-compose.example.yml)
- [.env.example](./.env.example)

Build locally:

```bash
docker build -t soaraid/registry-ui:local .
```

This project is now packaged as a standalone UI container. It does not start `registry:2` for you. Point it at a registry that is already running in another project or on another host.

For local Docker usage, create a Docker env file first:

```bash
cp .env.example .env
```

Then edit `.env` and set `REGISTRY_URL` to your actual registry endpoint.

Build and run the standalone UI with Compose:

```bash
docker compose up --build
```

If your registry is on the host machine, set:

```env
REGISTRY_URL=http://host.docker.internal:5000
```

If your registry is running in another Compose project on a shared Docker network, set for example:

```env
REGISTRY_URL=http://registry:5000
```

Run the built image directly:

```bash
docker run --rm -p 3000:3000 \
  -e REGISTRY_URL=http://host.docker.internal:5000 \
  -e APP_AUTH_USERNAME=operator \
  -e APP_AUTH_PASSWORD=change-me \
  -e APP_SESSION_SECRET=replace-with-a-long-random-secret \
  soaraid/registry-ui:local
```

Docker Hub style usage is shown in [docker-compose.example.yml](./docker-compose.example.yml). That file is meant to be copied into another project such as `soaraid/soara-hub`.

## Environment Variables

`REGISTRY_URL`

- Required
- Base URL of your Docker Registry V2 instance
- Examples: `http://host.docker.internal:5000`, `http://registry:5000`, `https://registry.example.com`

`REGISTRY_USERNAME`

- Optional
- Used for Basic auth or bearer-token exchange

`REGISTRY_PASSWORD`

- Optional
- Used with `REGISTRY_USERNAME`

`REGISTRY_BEARER_TOKEN`

- Optional
- If set, bearer auth is used directly and takes precedence over Basic auth

`APP_AUTH_USERNAME`

- Optional
- Enables single-user login when paired with `APP_AUTH_PASSWORD` and `APP_SESSION_SECRET`

`APP_AUTH_PASSWORD`

- Optional
- Password for the single env-configured UI account

`APP_SESSION_SECRET`

- Optional
- Secret used to sign the session cookie for login protection

`APP_BRAND_NAME`

- Optional
- Controls the small brand text shown in the shell

`APP_PRODUCT_NAME`

- Optional
- Controls the product title shown in the shell and page metadata

App login protection is enabled only when all three `APP_AUTH_*` values are present.

## How It Works

The browser does not call the Docker Registry directly. Instead, the UI calls Next.js Route Handlers under `app/api/registry`, and those handlers forward requests to the registry server-side.

This gives you:

- No browser-side registry credentials
- No CORS issues against the registry
- A single place to handle auth, retries, and request shaping

The shared registry client lives in `lib/docker-api.ts`. That file is the main extension point for future catalog, tag, manifest, and delete operations.

## Delete Safety

This project follows plain Docker Registry V2 semantics.

- A tag points to a manifest digest
- Deleting through the V2 API deletes the manifest digest, not a standalone tag object
- If multiple tags share that digest, they would all disappear together

Because of that, the UI now blocks deletion when a digest is shared by more than one tag. Only singleton-digest cleanup is allowed from the UI.

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
- Delete impact preview
- Shared-digest delete blocking for safety
- Bulk cleanup preview with keep-last, prefix, and regex filters
- Batch delete execution for safe singleton-digest candidates

`/settings`

- Explains the registry env contract used by the server-side proxy
- Includes a live registry connectivity test and diagnostics panel

`/login`

- Session login screen for the env-configured UI account

## API Proxy

Available now:

- `GET /api/registry/catalog`
- `GET /api/registry/health`
- `GET /api/registry/tags?repository=<name>`
- `GET /api/registry/manifests?repository=<name>&reference=<tag-or-digest>`
- `GET /api/registry/tag?repository=<name>&tag=<tag>`
- `DELETE /api/registry/tag?repository=<name>&tag=<tag>&confirmed=true`
- `POST /api/registry/cleanup/preview`
- `POST /api/registry/cleanup/execute`
- `POST /api/auth/login`
- `POST /api/auth/logout`

Supported query params for catalog:

- `n`
- `last`

The proxy layer currently covers:

- Docker Registry `GET /v2/_catalog`
- Docker Registry `GET /v2/<name>/tags/list`
- Docker Registry `GET /v2/<name>/manifests/<reference>`
- Docker Registry `DELETE /v2/<name>/manifests/<digest>`

## Still Missing

Important work still planned:

- Automated tests
- Docker Hub publishing workflow

## Validation

Useful local checks:

```bash
npm run typecheck
npm run build
```

## Documentation

- Product direction: [PRD.md](./PRD.md)
- Usage guide: [docs/USAGE.md](./docs/USAGE.md)
- Release checklist: [docs/RELEASE_CHECKLIST.md](./docs/RELEASE_CHECKLIST.md)
