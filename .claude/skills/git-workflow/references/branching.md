# Branching, Workflows & Environments

## Permanent Branches

These three branches always exist and are never deleted.

### `main`
- **Purpose**: production-ready code
- **Environment**: Production
- **Deployment**: auto-deploy on merge
- **Protection**: 1 approval, passing CI, no direct pushes
- **Merges from**: `staging` only

### `staging`
- **Purpose**: stable code for final testing
- **Environment**: Staging
- **Deployment**: auto-deploy on merge
- **Protection**: 1 approval, passing CI
- **Merges from**: `develop`, `hotfix/*`
- **Merges to**: `main` after testing passes

### `develop`
- **Purpose**: integration of in-flight features
- **Environment**: Development
- **Deployment**: auto-deploy on merge
- **Protection**: 1 approval, passing CI
- **Merges from**: `feature/*`, `fix/*`
- **Merges to**: `staging`

## Working Branches

### Feature branches
```
feature/<short-description>
```
Examples: `feature/user-authentication`, `feature/payment-integration`, `feature/admin-dashboard`.

### Fix branches (non-critical)
```
fix/<short-description>
```
Examples: `fix/login-validation-error`, `fix/mobile-responsive-issues`, `fix/image-loading-performance`.

### Hotfix branches (critical, prod-only)
```
hotfix/<short-description>
```
Examples: `hotfix/critical-security-patch`, `hotfix/payment-gateway-outage`, `hotfix/database-connection-issue`.

Hotfix branches are created from `main` and merged to BOTH `main` AND `develop` (otherwise the fix is lost on the next release).

## Branch Naming Rules

- Concise descriptions, separated by hyphens
- Lowercase only
- Descriptive — purpose is clear from name
- No special characters (letters, numbers, hyphens only)
- Delete after merge (except the three permanent branches)

## Workflows

### Feature development
1. Create branch from `develop`: `git checkout -b feature/user-authentication`
2. Implement feature with conventional-commit messages
3. Push: `git push origin feature/user-authentication`
4. Open PR to `develop`
5. After review + merge, delete the branch

### Release
1. Open PR from `develop` to `staging`
2. Test thoroughly on staging environment
3. If green, open PR from `staging` to `main`
4. Production deploys automatically on merge to `main`

### Hotfix
1. Create from `main`: `git checkout -b hotfix/critical-fix`
2. Fix and commit
3. Open PR to `main` for immediate prod deploy
4. Open second PR to `develop` to keep branches in sync
5. Delete the hotfix branch only after BOTH merges complete

## Environment Mapping

| Branch | Environment | URL | Auto-deploy |
|---|---|---|---|
| `main` | Production | https://domain.com | yes |
| `staging` | Staging | https://staging.domain.com | yes |
| `develop` | Development | https://develop.domain.com | yes |

## Workflow Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   DEVELOP   │───▶│   STAGING   │───▶│    MAIN     │
│ (features)  │    │ (testing)   │    │ (production)│
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                  ▲                  │
       │                  │                  │
       │                  │                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   FEATURE   │    │   HOTFIX    │    │   HOTFIX    │
│  BRANCHES   │    │  BRANCHES   │    │  BRANCHES   │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Branch Protection Rules

Required for all three permanent branches:
- 1 approval minimum
- All status checks must pass
- No direct pushes
- Tests pass
- Code-quality checks pass (lint, types)
- Security scan passes
- Build succeeds

## Automation Example (GitHub Actions)

```yaml
name: CI/CD Pipeline

on:
  pull_request:
    branches: [main, staging, develop]
  push:
    branches: [main, staging, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
      - name: Run linting
        run: npm run lint
```

Pair with Dependabot for dependency updates and a security-scan action of choice.

## Troubleshooting

| Issue | Fix |
|---|---|
| Branch behind target | `git pull origin <target>` then resolve conflicts |
| Failing CI | Check logs, fix, push again |
| Merge conflicts | `git mergetool` or IDE merge tool, then re-run tests |
| Lost commits | `git reflog` to find SHA, then `git checkout <sha>` |
| Wrong branch | `git cherry-pick <sha>` to move commits to the correct branch |
| Broken production | Create hotfix from `main` immediately |
| Accidental push | `git revert <sha>` for safe rollback (NOT `reset --hard` on shared branches) |
| Corrupted local branch | Create a new branch from the last stable commit |
