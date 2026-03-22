# soaraid/registry-ui

Modern Docker Registry UI for operators who want a cleaner, safer, and more capable alternative to legacy registry dashboards.

## Product Goal

Build a premium open-source UI for Docker Registry V2 that helps users:

- browse repositories and tags quickly
- inspect manifests without pulling images locally
- generate pull commands instantly
- perform safe maintenance actions from the UI
- secure access to the UI itself before publishing it beyond localhost

The product should feel faster, prettier, and safer than older registry UIs while still respecting plain Docker Registry semantics.

## Core Experience

### Visual Direction

- Dark zinc/slate palette
- Fixed sidebar with an operator-style application shell
- Glassmorphism surfaces with strong borders and restrained glow
- Smooth hover states, skeleton loading, and fast-feeling interactions

### Product Principles

- Registry-first: support plain Docker Registry V2 without requiring a proprietary backend
- Safety-first: destructive actions must explain impact and require confirmation
- Developer-first: strong copy/paste workflows, quick navigation, and readable raw data
- Deployment-friendly: easy to run with env vars and Docker

## Implemented Scope

The following is implemented in the current codebase:

- Next.js 15 app shell with responsive sidebar layout
- Dashboard overview with repository count and quick-start guidance
- Repository explorer backed by `/v2/_catalog`
- Repository detail page with searchable tags
- Pull command generator with copy button
- Manifest inspector dialog with raw JSON, digest, layers, and platform metadata
- Architecture and OS badges when metadata is available
- Registry proxy layer in `app/api/registry/*`
- Centralized registry logic in `lib/docker-api.ts`
- Registry authentication support:
  - anonymous
  - Basic auth
  - bearer token
- App-level login session using env-configured credentials
- Delete preview flow for tags
- Hard safety block for shared-digest deletes in plain Docker Registry mode

## Important Registry Semantics

Plain Docker Registry V2 does not truly delete a single tag. It deletes a manifest by digest.

That means:

- if one tag points to one unique digest, delete is safe
- if multiple tags point to the same digest, deleting that digest removes all of those tags

This product intentionally blocks shared-digest deletion in the UI to avoid destructive surprises.

## Required Feature Set

### 1. Registry Proxy Layer

Must proxy registry access through Next.js route handlers so the browser never talks directly to the registry.

Current status:

- implemented

Current endpoints:

- `GET /api/registry/catalog`
- `GET /api/registry/tags?repository=<name>`
- `GET /api/registry/manifests?repository=<name>&reference=<tag-or-digest>`
- `GET /api/registry/tag?repository=<name>&tag=<tag>` for delete preview
- `DELETE /api/registry/tag?repository=<name>&tag=<tag>&confirmed=true`

### 2. Repository Browsing

Must support:

- repository catalog browsing
- search/filter
- navigation into repository detail pages

Current status:

- implemented

### 3. Tag Management

Must support:

- tag listing
- pull command generation
- manifest inspection
- deletion workflow with confirmation

Current status:

- implemented with safety restrictions for shared digests

### 4. Metadata Visibility

Must clearly display:

- architecture
- OS
- digest
- layer count
- manifest type

Current status:

- implemented

### 5. UI Access Control

Must support:

- simple auth to protect the app itself

Current status:

- implemented as single-user env-based login session

## Release Gaps

These are the remaining important gaps before this feels complete for public OSS distribution.

### Release Critical

- Docker packaging
  - Add `Dockerfile`
  - Add `.dockerignore`
  - Add production runtime guidance
  - Add compose example with app auth env vars

- Automated tests
  - auth/session tests
  - proxy route tests
  - shared-digest delete safety tests
  - repository and tag UI smoke coverage

- OSS repo polish
  - `LICENSE`
  - `CONTRIBUTING.md`
  - issue templates or a lightweight contribution guide

### High Value

- Registry connection test action in Settings
- Better empty/error/success feedback patterns
- Digest copy button
- Tag sorting options
- Digest-grouped tag view to explain shared-manifest relationships
- Better large-registry handling with pagination or incremental loading

### Nice to Have

- Bulk cleanup tooling
  - delete old singleton tags
  - keep last N tags
  - regex-based cleanup preview

- Audit-style maintenance history
- Richer metadata from config blobs and labels
- Advanced admin mode for dangerous operations

## Next Order

The next implementation order should be:

1. Docker packaging and deployment files
2. Registry connection test and health diagnostics in Settings
3. Safe bulk cleanup workflows for singleton digests only
4. Automated tests for auth, proxy routes, and delete safety
5. OSS release polish for Docker Hub publishing and contribution readiness

## Next Feature Development Plan

This section turns the next order into concrete implementation milestones.

### Milestone 1: Docker Packaging

Goal:

- make the app easy to run in Docker and publish to Docker Hub

Deliverables:

- production `Dockerfile`
- `.dockerignore`
- container-friendly startup command
- example `docker-compose.yml`
- documentation for registry and app auth env vars in container deployments

User story:

- As an operator, I want to run `soaraid/registry-ui` next to my registry with a small, obvious container setup.

Acceptance criteria:

- app builds in a multi-stage Docker image
- image runs with only env vars and `3000` exposed
- login session auth works correctly behind Docker
- README includes a working container example

### Milestone 2: Registry Health And Connection Diagnostics

Goal:

- help operators verify registry connectivity and auth without guessing

Deliverables:

- “Test connection” action in Settings
- health summary card with:
  - registry host
  - auth mode
  - reachable / unreachable state
  - latest connection result
- actionable error messages for auth failures, DNS failures, and protocol mismatches

User story:

- As an operator, I want to know whether the UI can actually talk to my registry before I start browsing or deleting anything.

Acceptance criteria:

- Settings can trigger a live connectivity test
- connection test never exposes registry credentials to the browser
- success and failure states are clearly visible

### Milestone 3: Safe Bulk Cleanup

Goal:

- help operators remove old tags safely without breaking kept tags

Deliverables:

- cleanup preview page or panel
- filters for:
  - singleton-digest tags only
  - keep last N matching tags
  - prefix or regex filtering
- dry-run summary showing:
  - candidate tags
  - blocked tags
  - blocked reason
- execute flow with explicit confirmation

User story:

- As an operator, I want to clean up old tags in batches without accidentally removing shared manifests that active tags still reference.

Acceptance criteria:

- bulk cleanup only targets singleton digests by default
- shared-digest tags are listed as blocked, never silently deleted
- UI shows a final confirmation summary before execution

### Milestone 4: Automated Test Coverage

Goal:

- reduce regressions before open-source release and Docker Hub publishing

Deliverables:

- auth/session tests
- middleware protection tests
- registry route handler tests
- shared-digest delete safety tests
- basic UI smoke tests for login, repository list, and repository detail flows

User story:

- As a maintainer, I want confidence that auth, proxy logic, and safety constraints do not regress when the UI evolves.

Acceptance criteria:

- test suite runs locally and in CI
- delete safety rules are covered
- login/logout and protected route behavior are covered

### Milestone 5: OSS Release Readiness

Goal:

- make the repository ready for public contribution and repeatable publishing

Deliverables:

- `LICENSE`
- `CONTRIBUTING.md`
- issue template or lightweight bug report guide
- release checklist
- Docker Hub publishing workflow

User story:

- As a maintainer, I want a predictable release path so external users can run, test, and contribute to the project with low friction.

Acceptance criteria:

- repo includes clear contribution and licensing information
- release process is documented
- Docker Hub publishing path is defined

## Suggested Delivery Sequence

Recommended implementation sequence:

1. Docker packaging
2. Settings diagnostics
3. Bulk cleanup preview and execution
4. Test suite
5. OSS release workflow

Reasoning:

- Docker packaging makes the project usable outside local development
- diagnostics reduce support friction immediately after packaging
- bulk cleanup adds the next major operator feature
- tests should lock behavior before wider adoption
- release workflow comes last once the product surface is stable

## Open Product Questions

These should be decided before or during the next milestone work:

- Should bulk cleanup allow regex filters from day one, or start with prefix and keep-last-N only?
- Should Settings keep a small in-memory connection history, or only show the latest result?
- Should the first Docker image target only `linux/amd64`, or ship multi-arch immediately?
- Should we keep app auth optional by default, or recommend enabling it in every Docker deployment example?

## Non-Goals For Now

- multi-user accounts
- role-based permissions
- OAuth / SSO
- registry-specific proprietary APIs as the default model

Those can come later, but the base product should stay excellent for plain open-source Docker Registry deployments.
