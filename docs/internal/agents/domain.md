# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`docs/internal/CONTEXT.md`** (single-context project; the glossary lives here per ADR-0002).
- **`docs/adr/`** — read ADRs that touch the area you're about to work in.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The producer skill (`/grill-with-docs`) creates them lazily when terms or decisions actually get resolved.

## File structure for this repo

Single-context layout (CONTEXT.md lives under docs/internal/ per ADR-0002):

```
/
├── docs/
│   ├── adr/                          ← public architectural decisions
│   │   ├── 0001-examples-as-starter-source.md
│   │   └── 0002-docs-taxonomy.md
│   └── internal/
│       ├── CONTEXT.md                ← project glossary
│       ├── DECISIONS.md              ← frozen v0.1 design log
│       ├── PATCHES.md / VENDORING.md ← fork governance
│       └── agents/                   ← this directory
└── packages/, examples/, validation/, scripts/
```

Multi-context repo (presence of `CONTEXT-MAP.md` at the root):

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← system-wide decisions
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← context-specific decisions
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `docs/internal/CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/grill-with-docs`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
