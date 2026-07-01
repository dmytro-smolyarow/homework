# CLAUDE.md

**Tradeoff:** these guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.
- If a constraint (schema, API, deadline) blocks the simple path, report the tradeoff before patching around it.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Verify Before Claiming Done

**Evidence before assertions. Always.**

Before saying "fixed", "passing", "working", "complete":
- Run the actual command. Don't infer success from the diff.
- Read the actual output. Don't assume the exit code.
- If you can't run it (missing env, no UI access, sandboxed), say so explicitly instead of claiming success.

The bar: a future reader should be able to point at concrete tool output you saw.

**Pushback ≠ truth.** When the user disagrees with your work, investigate before agreeing. Reflexive "you're right, let me fix that" is worse than a calm "let me verify first" — they might be wrong, and capitulation hides bugs in the next layer.

---

## Red Flags — Internal Thoughts That Mean STOP

These are pattern-match triggers, not rules. If you catch the thought on the left, the reality on the right applies.

| Thought | Reality |
|---|---|
| "I'll just do this one thing first" | You're skipping plan/scope. Stop and confirm. |
| "This is too simple to need verification" | Trivial things break prod most often. Run it. |
| "User pushed back, I'll just rewrite" | Verify the claim first. Capitulation isn't humility. |
| "Let me add a bit of flexibility for later" | YAGNI. Delete it. |
| "Close enough, let me move on" | "Close enough" is how silent bugs ship. |
| "I'll add error handling just in case" | If the case can't happen, the handler hides real bugs. |
| "Let me also clean up while I'm here" | Out of scope. Mention it, don't do it. |
| "The test is probably fine, no need to run" | The test is never fine until it's green. |
| "I know what this code does without reading it" | Read it. Models confabulate confidently. |
| "I'll write a quick summary doc / README" | Not asked for. Don't create files unprompted. |

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, clarifying questions come *before* implementation, and "done" claims are backed by actual tool output the user can point at.
------------------------------------------------------------------------------------------

<!-- BEGIN AUTO-WIKI (managed by Claude IDE) -->
@wiki/index.md
<!-- END AUTO-WIKI -->