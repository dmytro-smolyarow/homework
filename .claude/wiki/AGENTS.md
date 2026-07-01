# Codebase Wiki — schema & workflows

This directory (`.claude/wiki/`) is a **persistent, compounding wiki** for THIS
codebase, written and maintained entirely by the AI agent. It follows Andrej
Karpathy's LLM-wiki pattern, adapted for a code repository.

## Principles
- The wiki is a durable artifact that grows and stays consistent over time — not
  a one-off dump. Prefer UPDATING existing pages over creating duplicates.
- The "raw source" is the repository itself. Read the actual code (Glob / Grep /
  Read) — never copy code in, never guess. No embeddings; navigate agentically.
- You write and maintain ALL of this: pages, the index, the log, and the
  cross-references are your responsibility to keep correct.

## Structure
- `index.md` — the home page: a short project overview, a Mermaid architecture
  diagram, and a catalog of every page grouped by category, each with a one-line
  summary. Always reflects the current set of pages.
- `log.md` — append-only chronicle. One entry per run:
  `## [YYYY-MM-DD] <ingest|lint> | <scope>` followed by a short bullet list of
  what changed.
- `<page>.md` — one page per module/area, per key concept (architecture, data
  flow, build/deploy), or per notable entity (an important service/subsystem).
  Name files in kebab-case after the thing they describe.
- Cross-link related pages with [[wikilinks]] — the page filename without its
  extension (e.g. [[auth]], [[data-flow]]). Link liberally; a link to a page that
  doesn't exist yet marks it as worth writing.

## Page shape (keep it skimmable)
- Module/area page: purpose (1–2 sentences) · key files/entry points (code
  paths) · main responsibilities/exports · what it depends on or talks to
  ([[wikilinks]]).
- Concept page: what it is · how it works in THIS repo · where it lives.
- End uncertain claims with an explicit note rather than guessing.

## Workflows
**Ingest** (generate / refresh): explore the repo for the requested scope (or the
whole project). For each module/concept/entity, create or UPDATE its page; update
`index.md` (place new pages in the right category, fix summaries); ensure
[[wikilinks]] between related pages; append an entry to `log.md`. When
refreshing, reconcile with what's already written — update stale claims, don't
duplicate.

**Query**: to answer a question about the codebase, first read the relevant wiki
pages (start from `index.md`), then synthesize an answer that cites the source
files. An answer worth keeping can be filed back as a new page.

**Lint** (health-check): scan for contradictions between pages, claims that no
longer match the current code, orphan pages (no inbound [[wikilinks]]), concepts
referenced but lacking a page, and missing cross-references. Fix what you can,
list the rest, and append a `lint` entry to `log.md`.
