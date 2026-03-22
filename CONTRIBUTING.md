# Contributing

Thanks for contributing to `soaraid/registry-ui`.

## Scope

This project is an operator-focused UI for plain Docker Registry V2. Changes should preserve these product rules:

- registry calls stay server-side behind `app/api/registry/*`
- destructive actions must stay explicit and confirmed
- shared-digest deletes must not be silently allowed in plain registry mode
- UI changes should keep the dark operator-style visual language intact

## Local Development

Install dependencies:

```bash
npm install
```

Create a local env file:

```bash
cp .env.example .env.local
```

Set at least:

```env
REGISTRY_URL=http://localhost:5000
```

If you want app login enabled, also set:

```env
APP_AUTH_USERNAME=operator
APP_AUTH_PASSWORD=change-me
APP_SESSION_SECRET=replace-with-a-long-random-secret
```

Start development:

```bash
npm run dev
```

## Docker Development

To run the UI as a container, use the same example env file and copy it to `.env`:

```bash
cp .env.example .env
docker compose up --build
```

The Compose file only runs the UI. Your registry should already be running elsewhere.

## Before Opening A PR

Run:

```bash
npm run typecheck
npm run build
```

If your change affects documentation, update:

- `README.md`
- `docs/USAGE.md`
- `PRD.md` when the product scope changes

## Contribution Guidelines

- Keep edits focused and small where possible.
- Prefer extending `lib/docker-api.ts` for registry behavior instead of scattering request logic.
- Keep client components responsive on large registries.
- Avoid adding destructive behavior without a preview or clear confirmation step.
- Do not add registry-specific proprietary behavior as the default path for plain Docker Registry support.

## Bug Reports

Use the bug report template in `.github/ISSUE_TEMPLATE/bug_report.md`.

Include:

- registry type and version
- auth mode in use
- browser and OS
- exact reproduction steps
- screenshots or response payloads if relevant
