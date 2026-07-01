# Commit Message Format

## Structure

Every commit message follows:

```
<type>: <short description>

<file>: <description of change>
<file>: <description of change>
```

The subject is the type prefix + a brief summary. The body lists each touched file/section with what changed.

## Action Types

| Type | Use for |
|---|---|
| `feat` | new features, files, or components |
| `fix` | bug fixes |
| `docs` | documentation updates |
| `style` | formatting only (semicolons, whitespace) — no code change |
| `refactor` | code restructure with no behaviour change |
| `test` | adding or modifying tests |
| `chore` | build tooling, package config, deps |
| `perf` | performance improvements |
| `ci` | CI/CD configuration changes |
| `build` | build system or external-dependency changes |
| `revert` | reverting a previous commit |

## Best Practices

- **Imperative mood**: `add feature`, not `added feature` / `adds feature`
- **First line ≤50 chars** for readability
- **Lowercase prefix**: `feat:`, not `Feat:`
- **No period** at end of subject line
- **Reference issues** when applicable: `fix: resolve login error (#123)`
- **English only** for commit messages and code comments
- **Separate subject from body** with a blank line
- **One logical change per commit** — keep commits atomic

## Basic Examples

### Feature
```
feat: add user authentication system

auth.service.ts: implement login and logout methods
auth.component.tsx: create login form component
auth.store.ts: add authentication state management
```

### Fix
```
fix: resolve payment processing error

payment.api.ts: fix API endpoint URL typo
payment.component.tsx: add error handling for failed payments
```

### Refactor
```
refactor: improve product card responsive design

product-card.component.tsx: adjust layout for mobile devices
product-card.service.ts: optimize image loading logic
```

### Docs
```
docs: update API documentation

README.md: add authentication endpoints documentation
api.md: update payment flow examples
```

### Test
```
test: add user authentication tests

auth.service.spec.ts: add login/logout test cases
auth.component.spec.ts: add form validation tests
```

### Chore
```
chore: update build configuration

package.json: update dependencies to latest versions
webpack.config.js: add new build optimization
```

## Advanced Examples

### Breaking change

Append `!` to the type. The body must include a `BREAKING CHANGE:` line explaining the impact.

```
feat!: add breaking changes to user API

BREAKING CHANGE: user endpoint now requires authentication

user.api.ts: add authentication middleware
user.service.ts: update method signatures
```

### Scoped commit

Add scope in parentheses to disambiguate (useful in monorepos or large codebases).

```
fix(auth): resolve token expiration handling

auth.service.ts: fix token refresh logic
auth.interceptor.ts: add proper error handling
```

### Performance
```
perf(images): optimize image loading performance

image.component.tsx: implement lazy loading
image.service.ts: add image compression
image.util.ts: add caching mechanism
```
