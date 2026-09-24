# Dependency Register

P0-07 pins Node 24.21.0 through `.nvmrc` and uses npm lockfiles generated in the matching Docker image.

| Area | Direct dependency | Version | Purpose | License |
|---|---|---:|---|---|
| Frontend | Angular core/common/compiler/platform-browser | 22.2.0 | SPA runtime | MIT |
| Frontend | Angular CLI/compiler-cli | 22.2.0 | build tooling | MIT |
| Frontend | RxJS / Zone.js / tslib | 7.8.2 / 0.15.1 / 2.8.1 | reactive runtime support | Apache-2.0 / MIT / 0BSD |
| Frontend & backend | TypeScript | 6.0.3 | compiler | Apache-2.0 |
| Backend | Nest common/core/platform-express | 12.1.0 | API framework | MIT |
| Backend | Nest CLI/schematics | 12.0.6 / 12.0.5 | tooling | MIT |
| Backend | reflect-metadata / RxJS | 0.2.2 / 7.8.2 | runtime metadata/reactive support | Apache-2.0 / Apache-2.0 |

`npm audit --omit=dev --audit-level=high` passed for both lockfiles using Node 24.21.0 Docker image. Any new direct dependency requires an update to this register and lockfile review.
