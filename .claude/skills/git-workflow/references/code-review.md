# Code Review

## Review Checklist

- **Functionality** — does it work as expected?
- **Quality** — readable and maintainable?
- **Performance** — any regressions?
- **Security** — any concerns? (no hard-coded secrets, dependencies vetted, no obvious injection paths)
- **Tests** — coverage adequate, edge cases covered?
- **Documentation** — updated where needed?
- **Breaking changes** — documented and announced?

## Review Process

1. **Self-review** before requesting others — catch obvious issues yourself first
2. **Request specific reviewers** based on expertise (UI changes → frontend lead, infra → SRE, etc.)
3. **Address feedback** constructively — discuss, don't just comply
4. **Re-request review** after making changes
5. **Merge only after approval** AND all status checks pass

## Approval Rules

- Code reviews are mandatory for all PRs to permanent branches
- At least one approval required
- All status checks must pass before merge
- Documentation should be updated for significant changes

## Conflict Resolution

When the PR target branch has moved ahead:

1. **Pull latest** from target: `git fetch origin && git merge origin/<target>` (or rebase)
2. **Resolve locally** using a merge tool (`git mergetool`, IDE)
3. **Re-run tests** — conflict resolution can silently break logic, never skip this
4. **Commit** the resolution with a clear message
5. **Push** and notify reviewers that the PR has been updated

## Security Notes

- Never commit secrets — `.env`, API keys, tokens, certificates
- Use environment variables for configuration
- Review new dependencies before merging (license, maintenance, transitive deps)
- Run vulnerability scans regularly (`npm audit`, `pip-audit`, etc.)
