# Architectural Decision Records

ADRs document architectural decisions made during the project's lifetime,
with enough context that future contributors don't need to reverse-engineer
the rationale.

## Distinction from DECISIONS.md

- **`DECISIONS.md`** (at the repo root): the 16 design decisions locked in
  during v0.1, with rationale and trade-offs. Frozen historical record —
  do not edit. If a new decision supersedes one of D1–D16, write a new ADR
  here and cite the superseded D-number in its "Status" section.
- **`docs/adr/`** (this folder): decisions made from v0.2 onwards. Created
  on demand by `/grill-with-docs` when a non-trivial architectural choice
  arises during work. Each ADR is its own file; the folder is the log.

## File naming

`NNNN-short-title.md` — zero-padded sequence, kebab-case slug.

Examples:

    0001-asynclocalstorage-for-hbs-sentinels.md
    0002-jiti-vs-esbuild-for-export-loader.md

The number is sequential and never reused, even if an ADR is superseded
(the superseded one stays in place with `Status: Superseded by ADR-XXXX`).

## Template

```markdown
# ADR NNNN: Short title

## Status

One of: Proposed | Accepted | Superseded by ADR-XXXX | Deprecated

## Context

What's the problem? What constraint forced a decision? What did we learn
that made this not-obvious?

## Decision

What did we decide? Be specific — name the library, the file, the API
shape, whatever's concrete.

## Consequences

What follows? What does this make easier? What does it make harder? Any
load-bearing assumption a future reader should know about?

## Alternatives considered

What else was on the table? For each, one or two sentences on why not.
Don't skip this — "we picked X" without "we ruled out Y because Z" is
weak documentation.
```

## When to write an ADR

- A pattern that recurs across the codebase in 3+ places.
- A library / tool choice that affects multiple modules.
- A decision that contradicts a previous one — cite the superseded ADR or
  the relevant `DECISIONS.md` D-number.
- A decision a future contributor might reasonably second-guess without
  context — the "why did they do it this way?" test.

## When NOT to write an ADR

- One-off tactical decisions (which name for an internal variable, which
  folder for a single file).
- Bug fixes — the commit message is the record.
- Routine refactors with no design choice involved.
- Decisions already covered in `DECISIONS.md` (D1–D16).
- Process / tooling choices that live more naturally in `CONTRIBUTING.md`
  (e.g. "we picked Biome over ESLint" — that's a contributor-facing
  workflow note, not an architectural decision about the lib).
