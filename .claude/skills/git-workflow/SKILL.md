---
name: git-workflow
description: "Use when making commits, creating branches, opening or merging PRs, resolving conflicts, doing hotfixes, or any git-related operation. Also trigger when the user asks about commit format, branch naming, PR process, hotfix procedures, or deployment workflow. Even if the user doesn't say 'git' explicitly — if they're committing, branching, or preparing a release, use this skill."
---

# Git Workflow

Three-tier branch model (`develop` → `staging` → `main`) with conventional-commit prefixes and mandatory PR review on protected branches.

## Hard Rules

1. **No direct pushes to `main`, `staging`, or `develop`** — always via PR with at least 1 approval and passing CI.
2. **Hotfixes merge to BOTH `main` AND `develop`** — fix is lost on next release otherwise.
3. **Commit subject = imperative present**, lowercase prefix, no trailing period, ≤50 chars (`add feature`, not `Added feature.`).
4. **Branch names are kebab-case**, prefixed by purpose: `feature/...`, `fix/...`, `hotfix/...`.
5. **Never commit secrets** — `.env`, keys, tokens. Use environment variables.
6. **Delete merged branches**, never delete the three permanent branches.

## Commit Format

```
<type>: <short description>

<file>: <change>
<file>: <change>
```

| Type | Use for |
|---|---|
| `feat` | new features |
| `fix` | bug fixes |
| `docs` | documentation |
| `style` | formatting only (no code change) |
| `refactor` | code restructure (no behaviour change) |
| `test` | adding/modifying tests |
| `chore` | tooling, deps, config |
| `perf` | performance improvements |
| `ci` | CI/CD pipeline changes |
| `build` | build system / external deps |
| `revert` | reverting a previous commit |

Add `!` for breaking changes (`feat!:`) and optional scope (`fix(auth):`). Full spec, all examples (basic + advanced + breaking), and best-practice checklist in `references/commit-format.md`.

## Branch Types

| Branch | Created from | Merges to | Purpose |
|---|---|---|---|
| `main` | — | — | Production. Protected. |
| `staging` | — | `main` | Pre-prod testing. |
| `develop` | — | `staging` | Feature integration. |
| `feature/<name>` | `develop` | `develop` | New work. |
| `fix/<name>` | `develop` | `develop` | Non-critical fixes. |
| `hotfix/<name>` | `main` | `main` AND `develop` | Critical prod fix. |

Workflows (feature dev, release, hotfix), branch protection rules, environment mapping, automation example, and troubleshooting in `references/branching.md`.

## Code Review

Self-review first. Reviewer checks: functionality, quality, performance, security, tests, docs, breaking changes. At least 1 approval + passing checks before merge. Full checklist, review process, and conflict-resolution flow in `references/code-review.md`.

## Common Mistakes

| Mistake | Reality |
|---|---|
| Pushing directly to `main`/`staging`/`develop` | Forbidden — always go through a PR. |
| Hotfix only merged to `main` | Hotfix MUST also be merged to `develop`, otherwise the fix is lost on the next release. |
| Past-tense commit subject (`added feature`) | Use imperative present: `add feature`. |
| Type prefix capitalised (`Feat:`, `Fix:`) | Action types are lowercase: `feat:`, `fix:`, `docs:`. |
| Period at end of subject line | Drop it — subject is a title, not a sentence. |
| Subject longer than 50 chars | Move detail to body; first line stays scannable. |
| Committing `.env`, keys, tokens | Never. Even one accidental commit means rotating the secret. |
| Naming branches with spaces, camelCase, or `_` | Use `kebab-case` only: `feature/user-authentication`. |
| Leaving merged feature branches around | Delete after merge — keeps the branch list scannable. |
| Force-pushing to a shared branch | Only on your own un-shared branches. Never on `main`/`staging`/`develop`. |
| Resolving conflicts without re-running tests | Conflict resolution can silently break logic — re-run tests after every resolve. |

## Resources

- **`references/commit-format.md`** — full commit-message spec, all examples (basic + advanced + breaking changes), best-practice checklist.
- **`references/branching.md`** — branch lifecycle, workflows (feature/release/hotfix), env mapping, protection rules, automation example, troubleshooting.
- **`references/code-review.md`** — review checklist, process, approval rules, conflict resolution.
