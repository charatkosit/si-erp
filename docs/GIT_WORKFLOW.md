# Git Workflow and Repository Protection

Version: 1.0  
Applies to: SI Warehouse Management  
Source task: P0-03

## Principles

- `main` is the only long-lived branch and must remain releasable.
- Every change must reference one locked Task ID and stay inside its `allowed_paths`.
- Direct pushes to `main` are prohibited after branch protection is enabled. Changes enter through pull requests.
- Do not combine unrelated Task IDs in one branch or pull request.
- Never commit secrets, real customer data, real documents, production credentials, or unreviewed migrations.

## Branches

Create a short-lived branch from an up-to-date `main`:

| Purpose | Pattern | Example |
|---|---|---|
| Task/feature | `task/<task-id>-<slug>` | `task/p0-03-git-policy` |
| Bug fix | `fix/<task-id>-<slug>` | `fix/p3-07-role-guard` |
| Documentation | `docs/<task-id>-<slug>` | `docs/p1-01-sitemap` |
| Emergency production fix | `hotfix/<incident-or-task>-<slug>` | `hotfix/inc-014-login` |

Use lowercase ASCII, digits, and hyphens. Delete the remote branch after merge. A hotfix still requires a Task ID or incident reference, review, verification, and follow-up decision record.

## Commits

- Make atomic commits with imperative messages: `<type>: <outcome>`.
- Recommended types: `feat`, `fix`, `docs`, `test`, `chore`, `refactor`, `ci`.
- Do not include secrets, generated build output, personal data, or unrelated formatting.
- Before push, inspect `git status`, staged names, and `git diff --cached`. Stage explicit paths for locked work.

## Pull requests and merge policy

1. Open a pull request to `main` and complete `.github/pull_request_template.md`.
2. The title must identify the Task ID and outcome, for example `[P0-03] Define Git workflow`.
3. The author links the Task Contract, lists changed paths and verification evidence, and declares risks/rollback.
4. Required reviewers follow the matrix below. The author cannot be the sole approver.
5. Resolve every review thread and rerun affected checks after material changes.
6. Default merge method is squash merge. The final message keeps the Task ID and concrete outcome.
7. Rebase or update the branch when `main` changes in a way that affects the task; rerun verification.
8. Master records the merge/commit evidence in WORKFLOW_STATE.json and RESUME.md, then releases the task lock.

Do not merge draft PRs, PRs with unresolved BLOCKED items, failing required checks, hidden waivers, or changes outside `allowed_paths`.

## Reviewer matrix

| Changed area | Required review | Minimum approvals |
|---|---|---:|
| Workflow state, task/spec and general docs | master-agent; business reviewer when scope/Gate changes | 1 |
| UX assets/specs | ux-agent + PM/business representative for workflow acceptance | 1 |
| Frontend | frontend-agent; ux-agent for interaction changes; qa-agent for test evidence | 1 |
| Backend/API | backend-agent + affected frontend/database reviewer | 1 |
| Schema/migration/seed | database-agent + backend-agent + master-agent | 2 |
| Infrastructure/CI/secrets/production config | cicd-agent + security-reviewer + affected application owner | 2 |
| Shared API contract, RBAC/data scope or security boundary | owners on both sides + security-reviewer + master-agent | 2 |
| Test plans/E2E evidence | qa-agent + affected owner | 1 |

When one human temporarily holds several business roles, record that fact in DECISIONS.md. It does not remove technical cross-review requirements.

## Branch protection policy for `main`

Repository administrators must configure a GitHub branch ruleset/rule with:

- Require a pull request before merging.
- Require at least 1 approving review; use 2 approvals for the high-risk rows above.
- Dismiss stale approvals when new commits materially change reviewed content.
- Require review from designated code owners when CODEOWNERS is introduced with confirmed GitHub identities.
- Require all conversations to be resolved.
- Block force pushes and branch deletion.
- Require linear history and signed commits if organizational policy provides signing infrastructure.
- Do not allow bypass except repository administrators handling a declared incident; every bypass requires a follow-up audit entry.
- After P0-11 creates stable CI jobs, require build, lint, unit/integration tests, secret scan, and other named checks. Do not invent required check names before those workflows exist.

This document is the approved policy baseline. Actual GitHub ruleset activation requires repository-admin access and should be verified with a screenshot/API export under the task that performs the setting. Absence of `gh` on a workstation does not permit direct pushes once the rule is active.

## BLOCKED and stale work

Mark a task `BLOCKED` when work cannot continue without a decision or external change. Record: blocker ID, impact, exact question/options, decision owner, due point, safe checkpoint, changed files, test results, commit (if any), and next action.

- Keep the task lock while a short-lived blocker is being resolved.
- Do not start another task unless Master explicitly releases/reassigns the lock in WORKFLOW_STATE.json.
- If a lock heartbeat expires, Master marks it `STALE`, checks Git status/commits/tests, reconciles state, and only then reassigns it.
- Resume from durable state, not conversation memory.
- Never merge a PR while its task is BLOCKED.

## Change requests and waivers

Changes to API, schema, permissions, state machines, shared dependencies, or environment variables require a Change Request: impact, affected owners, review result, decision ID, migration/rollback approach, and updated tests/docs.

A waiver must name the unmet criterion, risk, compensating control, approver, expiry or follow-up task. It must be recorded in DECISIONS.md; silent exceptions are invalid.

## Repository-admin activation checklist

1. Open repository Settings → Rules → Rulesets or Branch protection.
2. Target the default branch `main`.
3. Apply the settings in this document without enabling required status checks that do not yet exist.
4. Confirm administrators/bypass actors and audit expectations.
5. Save evidence and record the ruleset URL/ID and verification date in a dedicated task checkpoint.
6. After P0-11, update the rule to require the stable CI check names and verify a sample PR cannot merge while a check fails.
