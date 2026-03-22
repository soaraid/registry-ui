# Usage Guide

This document explains how to run and use the current version of `soara/registry-ui`.

## Before You Start

You need:

- Node.js 20+ or newer
- A reachable Docker Registry V2 endpoint
- Registry credentials if your registry is private

## Setup

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

Example configuration:

```env
REGISTRY_URL=http://localhost:5000
REGISTRY_USERNAME=admin
REGISTRY_PASSWORD=secret
REGISTRY_BEARER_TOKEN=
APP_AUTH_USERNAME=operator
APP_AUTH_PASSWORD=change-me
APP_SESSION_SECRET=replace-with-a-long-random-secret
```

Start the app:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

If app session auth is enabled, you will be redirected to `/login` first.

## Authentication Modes

The UI supports three connection modes.

### Anonymous

Use only:

```env
REGISTRY_URL=http://localhost:5000
```

### Basic Auth

Use:

```env
REGISTRY_URL=http://localhost:5000
REGISTRY_USERNAME=admin
REGISTRY_PASSWORD=secret
```

### Bearer Token

Use:

```env
REGISTRY_URL=http://localhost:5000
REGISTRY_BEARER_TOKEN=your-token
```

If `REGISTRY_BEARER_TOKEN` is set, it takes precedence over username/password.

## App Login Session

If you set all three values below, the UI requires sign-in before any page or registry API can be accessed:

```env
APP_AUTH_USERNAME=operator
APP_AUTH_PASSWORD=change-me
APP_SESSION_SECRET=replace-with-a-long-random-secret
```

Notes:

- This is a single-user app login for now
- It protects both the frontend pages and the proxied API routes
- If the auth env vars are not fully configured, the app stays open

## What You Can Use Today

### Dashboard

Open `/`.

What it does:

- Loads the repository catalog through the server proxy
- Shows the total repository count
- Shows a quick-start checklist for operators

### Repository Explorer

Open `/repositories`.

What it does:

- Calls `/api/registry/catalog`
- Lists repositories from Docker Registry `/v2/_catalog`
- Lets you filter repositories with the search input
- Links each repository to a detail page

### Repository Detail Page

Open `/repositories/<repository-name>`.

What it does now:

- Loads tags from the registry through the server proxy
- Lets you filter tags with a client-side search field
- Shows a pull command block for each tag with one-click copy
- Resolves manifest metadata lazily as cards enter view
- Shows architecture and OS badges when metadata is available
- Opens a manifest inspector dialog with raw JSON, digest, layers, and platform details
- Shows delete impact before any destructive action
- Blocks delete when multiple tags share the same manifest digest

### Settings

Open `/settings`.

What it does:

- Documents the environment variables used by the proxy layer
- Shows whether app session auth is enabled
- Shows current registry runtime mode

## Proxy Behavior

The UI talks to the registry through Next.js Route Handlers, not directly from the browser.

Current routes:

- `GET /api/registry/catalog`
- `GET /api/registry/tags?repository=<name>`
- `GET /api/registry/manifests?repository=<name>&reference=<tag-or-digest>`
- `GET /api/registry/tag?repository=<name>&tag=<tag>`
- `DELETE /api/registry/tag?repository=<name>&tag=<tag>&confirmed=true`
- `POST /api/auth/login`
- `POST /api/auth/logout`

Why this matters:

- Registry credentials stay on the server
- Browser CORS issues are avoided
- Registry request logic stays centralized

## Delete Behavior

This UI follows plain Docker Registry behavior.

Important rule:

- deleting is done by manifest digest, not by an isolated tag record

That means:

- if one tag is the only tag referencing its digest, the UI can delete it
- if multiple tags share one digest, deleting would remove all of them

Current product behavior:

- the UI previews the affected digest and tags first
- the UI blocks deletion for shared-digest tags
- only singleton-digest delete is allowed

## Troubleshooting

### "Missing REGISTRY_URL environment variable."

Cause:

- `.env.local` is missing
- `REGISTRY_URL` was not set

Fix:

```bash
cp .env.example .env.local
```

Then set `REGISTRY_URL` and restart the dev server.

### Catalog page shows an error

Possible causes:

- The registry URL is unreachable
- Credentials are wrong
- The registry does not support the expected auth flow

Checks:

- Verify `REGISTRY_URL`
- Verify username/password or bearer token
- Confirm the registry exposes Docker Registry V2 endpoints

### No repositories appear

Possible causes:

- The registry catalog is empty
- The account cannot access the catalog
- The registry blocks catalog listing

### Delete is blocked even though I selected one tag

Cause:

- That tag shares its manifest digest with other tags

What it means:

- Plain Docker Registry would delete all tags that reference that digest

Current product behavior:

- `soara/registry-ui` blocks that delete on purpose

## Current Gaps

Not implemented yet:

- Docker packaging files
- Registry connection test action
- Bulk cleanup workflows
- Automated tests
- OSS release workflow files

## Developer Notes

Main extension points for the next feature slice:

- `lib/docker-api.ts`
- `app/api/registry/`
- `middleware.ts`
- `lib/auth.ts`
- `hooks/use-registry-catalog.ts`
- `hooks/use-repository-tags.ts`
- `hooks/use-manifest-summary.ts`
- `hooks/use-delete-tag-preview.ts`
- `components/repositories/`

Recommended local validation:

```bash
npm run typecheck
npm run build
```
