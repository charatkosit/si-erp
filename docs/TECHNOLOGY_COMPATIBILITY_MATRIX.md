# Technology Compatibility Matrix

Version: 1.0  
Source task: P0-04  
Verified: 2026-09-24 (+07:00)

## Approved baseline

| Area | Exact baseline | Compatibility / purpose | Consumer |
|---|---|---|---|
| Node.js | `24.21.0` LTS | Shared local, CI and application runtime | P0-05, P0-07, P0-08, P0-11 |
| Angular | `22.2.0` | SPA framework; requires Node `^22.22.3`, `^24.15.0` or `>=26.0.0` | P0-07, P0-08 |
| NestJS | `12.1.0` | Modular-monolith API; Node 24 satisfies Nest 12 runtime and CLI floors | P0-07, P0-08 |
| PostgreSQL | `18.6` | Primary transactional database | P0-05, P0-09 |
| Redis | `8.10.2` | Cache, rate limiting, BullMQ queue and session support | P0-05, P0-07 |
| PostgreSQL image | `postgres:18.6-bookworm` | Official image with an explicit patch and OS variant | P0-05 |
| Redis image | `redis:8.10.2-trixie` | Official image with an explicit patch and OS variant | P0-05 |
| Node build/runtime image | `node:24.21.0-bookworm-slim` | Official image intended for future frontend/backend multi-stage builds | P0-05, P0-08 |

No `latest`, unqualified major tag, pre-release or floating digest may be used in Compose, Dockerfile, CI or local instructions.

## Compatibility rationale

- Node 24 is an LTS line. `24.21.0` is the current LTS patch verified for this baseline.
- Angular 22.2.0 declares Node `^24.15.0`; Node 24.21.0 meets that range. Its peer ranges require TypeScript `>=6.0.0 <6.1.0` and RxJS `^6.5.3 || ^7.4.0`; P0-07 must select exact compatible versions and lock them in the package-manager lockfile.
- NestJS 12 documents Node 20.19+ (or 22.12+ for the 22.x line) for runtime, and its generators require 22.22.3+, 24.15+ or 26+. Node 24.21.0 meets both needs.
- PostgreSQL 18 is a supported major release through 2030. `18.6` is the verified current patch. PostgreSQL minor updates must be applied promptly after compatibility testing; a major change requires a reviewed migration/rollback task.
- The official PostgreSQL image changes its default `PGDATA` layout for version 18+. P0-05 must mount and configure its persistent volume according to that image documentation; it must not copy an older 17-or-earlier volume pattern without review.
- Redis 8.10.2 is an explicitly pinned official image. Its official tags provide the `trixie` variant, not a `bookworm` variant for this patch. The project owner approved its license and operational fit on 2026-09-24 (D-016); a change to another compatible server is a Change Request because it affects the queue/cache platform.

## Lock and update policy

1. `docs/TECHNOLOGY_BASELINE.lock` is the source of truth for this pre-scaffold baseline. `.nvmrc` must match its Node entry.
2. P0-07 creates application dependency manifests and package-manager lockfiles. It must preserve the framework versions here, pin the Angular package group to the same exact version, and pin the Nest package group to the same exact version unless an approved Change Request revises this baseline.
3. P0-05 records the image digest for each resolved platform image at pull/build time in its own evidence. A manifest-list digest is not a substitute for the platform-specific digest used by the deployment target.
4. Patch updates are proposed as a dedicated task with release notes, security impact, verification and rollback evidence. Minor/major framework or database upgrades require Change Request, affected-owner review and explicit compatibility tests.
5. Docker Engine and Compose plugin versions are host prerequisites rather than images. P0-05 must record the tested versions and require Docker Compose v2 syntax; this task intentionally does not install or test them.

## Official sources consulted

- [Node.js release schedule](https://nodejs.org/en/about/previous-releases) and [24.21.0 LTS release](https://nodejs.org/en/blog)
- [Angular version compatibility](https://angular.dev/reference/versions) and [Angular 22.2.0 registry metadata](https://registry.npmjs.org/%40angular/core/latest)
- [NestJS migration guide](https://docs.nestjs.com/migration-guide) and [NestJS 12.1.0 release](https://github.com/nestjs/nest/releases)
- [PostgreSQL versioning policy](https://www.postgresql.org/support/versioning/) and [PostgreSQL 18.6 official image](https://hub.docker.com/_/postgres)
- [Redis 8.10.2 official image](https://hub.docker.com/_/redis)
- [Redis Source Available License 2.0 (RSALv2)](https://redis.io/legal/rsalv2-agreement/)

## Deferred to later tasks

- Exact TypeScript, RxJS, TypeORM, `pg`, BullMQ, test, lint and UI dependency versions and package-manager lockfiles: P0-07.
- Compose/Dockerfile service definitions, runtime pull verification and image digest evidence: P0-05.
- Application/module generation: P0-08.
