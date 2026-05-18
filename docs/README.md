# Documentation

This directory follows the taxonomy ratified in
[ADR-0002](./adr/0002-docs-taxonomy.md): documentation is split by
audience to keep the project's public surface focused and the dense
contributor material out of the way of first-time visitors.

## Three categories

### Public — root level

Read these before doing anything else with the project.

| Doc | Audience | What it's for |
|---|---|---|
| [README.md](../README.md) | Users | Pitch, install, quickstart, API. |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Contributors | Setup, hooks, changesets flow, PR conventions. |
| [LICENSE](../LICENSE) | Everyone | MIT license. |
| [NOTICE.md](../NOTICE.md) | Everyone | Required attribution of MIT-licensed upstream code. |
| [CLAUDE.md](../CLAUDE.md) | AI agents + contributors | Loaded by Claude Code; project rules, identity, canonical files. |
| [docs/adr/](./adr/) | Contributors | Architectural Decision Records from v0.2 onwards. |

### Repo-internal — `docs/internal/`

Available to anyone with the source but explicitly contributor-only —
not part of the user-facing surface.

| Doc | What it's for |
|---|---|
| [DECISIONS.md](./internal/DECISIONS.md) | Frozen historical record of the 16 design decisions taken during v0.1. New decisions go to `docs/adr/`. |
| [PATCHES.md](./internal/PATCHES.md) | Per-patch documentation of modifications applied to the fork of `@react-email/ui`. |
| [VENDORING.md](./internal/VENDORING.md) | How the fork is maintained, updated, and audited. |
| [CONTEXT.md](./internal/CONTEXT.md) | Project vocabulary glossary — terms that recur across code, commits, and docs. |
| [agents/](./internal/agents/) | Configuration and skill files for AI agent workflows (issue triage, domain doc layout). |

### Local-only — gitignored

These files MAY exist in the working tree of the project author or
maintainers but are intentionally not part of the public repo:

- `STATUS.md` — dev snapshots of in-flight state. Useful for
  session handoffs; would clutter the public history if committed.
- `ROADMAP.md` — author's personal todo list. Public promises happen
  via GitHub Issues or ADRs, not a roadmap that may drift.

If a co-maintainer joins the project, these would migrate to a shared
private channel (private repo, chat, etc.) rather than entering the
public source.

## When in doubt

Default to **repo-internal**: visible to future contributors,
signposted as not-user-facing. Promotion and demotion paths between
categories are described in
[ADR-0002 § Promotion / demotion process](./adr/0002-docs-taxonomy.md#promotion--demotion-process).
