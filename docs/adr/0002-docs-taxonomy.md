# ADR 0002: Docs taxonomy — public / repo-internal / local-only

## Status

Accepted (2026-05-18)

## Context

The repo accumulated multiple Markdown files at the root during v0.1
development: `README.md`, `CONTRIBUTING.md`, `LICENSE`, `NOTICE.md`,
`STATUS.md`, `ROADMAP.md`, `DECISIONS.md`, `PATCHES.md`, `VENDORING.md`,
`CONTEXT.md`, `CLAUDE.md`, plus a `docs/agents/` folder. Each had a
purpose at the time, but as the repo approached its first public release
(Bloco 10 — flip-to-public + npm publish v0.2.0), the lack of clear
audience boundaries became a problem:

- An outsider clicking into the root sees ~10 Markdown files and can't
  tell which to read first or which apply to them.
- Some files (`STATUS.md`) were dev-snapshots, useful as private notes
  but visibly stale to anyone landing on the public repo.
- Some (`ROADMAP.md`) were the solo author's personal todo list rather
  than a contract with users — promising features in public creates
  obligations.
- Some (`DECISIONS.md`, `PATCHES.md`, `VENDORING.md`, `CONTEXT.md`,
  `docs/agents/*`) are genuinely useful for contributors but not for
  users, and the root being their only home blurs their audience.
- `NOTICE.md` mentioned a private workplace reference, intermixing legal
  attribution (required public) with internal context (not public).

## Decision

Apply a 3-category taxonomy to all documentation:

### Public (root-level, visible to outsiders)

- `README.md` — user pitch, install, quickstart.
- `CONTRIBUTING.md` — contributor flow, local setup, gates.
- `LICENSE` — legal.
- `NOTICE.md` — third-party attribution. Trimmed to remove non-essential
  workplace references; legal mentions of MIT-licensed upstream
  (`@react-email/ui`, `handlebars-helpers`, `vtex-emails`) stay.
- `CLAUDE.md` — trimmed (no `About the author` section). Stays at root
  because Claude Code's tooling convention loads it from there.
- `docs/adr/` — architectural decision records (this file's home).
- `docs/README.md` — taxonomy explainer for visitors.

### Repo-internal (`docs/internal/`, contributor-only)

Visible in the public repo but signaled as internal-leaning:

- `docs/internal/DECISIONS.md` — frozen v0.1 design log (D1–D16).
- `docs/internal/PATCHES.md` — fork patch governance.
- `docs/internal/VENDORING.md` — fork rebase process.
- `docs/internal/CONTEXT.md` — project vocabulary (Pipeline, Marker,
  Sentinel, etc.).
- `docs/internal/agents/` — skill files for Claude Code (was `docs/agents/`).

### Local-only (gitignored, author working tree only)

Not in the public repo at all:

- `STATUS.md` — dev snapshots. Useful as a session-handoff doc but never
  promised as user-facing.
- `ROADMAP.md` — solo author's todo list. Public promises happen via
  GitHub Issues or ADRs, not a roadmap that may drift.

## Consequences

**Easier:**

- Outsider sees a focused root: README + CONTRIBUTING + LICENSE + NOTICE
  + CLAUDE.md + `docs/` directory. Less noise, clearer entry point.
- Contributors find the dense docs in `docs/internal/` once they need
  them — same content, signposted audience.
- Author keeps personal workflow files (STATUS, ROADMAP) without committing
  drift to the public record.
- Legal obligation (NOTICE) stays in plain sight.

**Harder:**

- One-time reorganization touches ~7 file moves + `.gitignore` edits +
  `git rm --cached` for STATUS/ROADMAP.
- Cross-references in existing docs (README links to DECISIONS, NOTICE
  links to PATCHES, etc.) need path updates.
- Author must remember the categorization when adding new docs. Mitigation:
  `docs/README.md` carries the decision tree.
- If a contributor surveys `docs/` they won't find STATUS/ROADMAP — that's
  the intent, but worth flagging in `CONTRIBUTING.md`.

**Load-bearing assumption:** the author works alone on the repo for the
foreseeable future. If a co-maintainer joins, STATUS-style snapshots may
need to be shared via a different channel (private repo, Discord, etc.) —
this ADR does not address that case.

## Promotion / demotion process

Categories are not permanent:

- A local-only doc can be promoted to repo-internal (add to git, commit,
  remove from `.gitignore`) if a co-maintainer needs to see it.
- A repo-internal doc can be promoted to public (move to root or
  prominent `docs/` location) if it becomes user-relevant.
- A public doc can be demoted (move into `docs/internal/`) if it stops
  being user-relevant — for instance, `STATUS-v0.1.md` could land in
  `docs/internal/snapshots/` if there's interest in keeping the artifact.

When in doubt, default to **repo-internal**: visible to future
contributors, signposted as not-user-facing.

## Alternatives considered

1. **Keep everything at root (radical transparency).** Rejected — root
   becomes a wall of Markdown that overwhelms first-time visitors.
   Discoverability of README suffers.

2. **Move everything internal-leaning to `docs/internal/`, keep STATUS
   and ROADMAP in the repo.** Rejected — keeping a stale STATUS or a
   ROADMAP with deprioritized features visible publicly creates a worse
   impression than not having them at all. Solo project benefits from
   the author keeping personal workflow private.

3. **Use GitHub Wiki for internal docs.** Rejected — adds a second
   storage location, harder to grep/diff alongside code, contributors
   forget it exists.

4. **Use a separate private repo for internal notes.** Rejected for
   v0.2 — overhead for a solo project. May revisit if internal notes
   grow substantial.
