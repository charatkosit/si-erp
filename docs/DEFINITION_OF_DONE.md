# Definition of Ready and Done

Version: 1.0  
Source task: P0-03

## Definition of Ready — Task

A task may enter `IN_PROGRESS` only when:

- It has one Task ID, objective, owner, reviewers, dependencies and acceptance criteria.
- `docs/specs/<task-id>.md` exists and Master issued an active lock with exact `allowed_paths`.
- Prerequisite tasks/Gates are complete, or an approved decision explicitly permits the dependency.
- Verification commands and expected evidence are defined.
- Data, security, migration and rollback risks are identified where relevant.
- Requirements are clear; unresolved conflicts are `BLOCKED` rather than guessed.

## Definition of Ready — Pull request

A PR is ready for review when:

- Title and description identify the Task ID and final behavior/outcome.
- Diff contains only locked scope and no accidental generated/untracked files.
- The author has run relevant checks and attached concise results.
- Required docs, API/schema notes, screenshots or examples are included when applicable.
- No secret, token, PII, real customer document or unreviewed migration is present.
- Known limitations and rollback/recovery steps are stated.

## Definition of Done — Task

A task is `DONE` only when all applicable items pass:

### Scope and behavior

- Acceptance criteria in the Task Contract pass.
- Changes stay inside `allowed_paths`; approved Change Requests cover any shared contract/schema/security/environment change.
- No unrelated feature or phase work is included.

### Quality and security

- Relevant format, lint, type, unit, integration, E2E, migration and smoke checks pass. Mark non-applicable checks explicitly with a reason.
- Error handling, authorization/RBAC/data scope, audit behavior, idempotency and concurrency are reviewed where the task affects them.
- Secret and sensitive-data checks pass; fixtures contain no real customer data or documents.
- Migrations are reversible/reviewed and destructive data actions are prohibited unless explicitly approved with recovery evidence.

### Review and evidence

- Required reviewers approve according to `docs/GIT_WORKFLOW.md`.
- Review conversations are resolved and material post-review changes are re-reviewed.
- Commit/PR/test evidence is recorded in WORKFLOW_STATE.json and RESUME.md.
- Documentation, runbooks, contracts and decision log are updated where affected.

### Completion state

- Master verifies the result, records blockers/known limitations, sets the task to `DONE`, releases its lock and names the next eligible task.
- The committed repository state matches durable workflow state.
- The branch/commit is pushed to the approved remote and the working tree is clean at handoff.

## Pull request merge checklist

A PR can merge only when:

- The task is not `BLOCKED` and no lock/state mismatch exists.
- Required approval count is met; author is not the sole approver.
- Required checks pass; temporary waivers are documented and approved.
- The target is `main`, conversations are resolved, and the merge method follows policy.
- The final diff and file list were reviewed for secrets and out-of-scope changes.

## Documentation-only tasks

For documentation-only work, application build/test/migration commands may be `NOT_APPLICABLE` when the contract explains why. JSON parsing, link/content assertions, staged-path checks, secret scan, Git diff checks, remote verification and clean working tree remain required.
