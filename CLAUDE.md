## Agent skills

### Issue tracker

Issues live in GitHub Issues at `marcoferreiradev/react-email-bridge`, managed via the `gh` CLI. See `docs/internal/agents/issue-tracker.md`.

### Triage labels

Default canonical vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`) — no overrides. See `docs/internal/agents/triage-labels.md`.

### Domain docs

Single-context layout — `docs/internal/CONTEXT.md` + `docs/adr/` cover both packages (`react-email-bridge`, `react-email-bridge-ui`). See `docs/internal/agents/domain.md`.

### Process gates (hooks + releases)

- Pre-commit: `lint-staged` runs `biome check --write` on staged files.
- Pre-push: `pnpm validate && pnpm build && pnpm test` (mirrors CI).
- Releases: every PR with public-API impact needs a changeset (`pnpm changeset`); docs/internal PRs can use `pnpm changeset --empty`. The `Version Packages` PR is opened automatically on merge to main.
- Bypass `--no-verify` when intentional (docs-only, WIP). Don't make it a reflex.

See `CONTRIBUTING.md` for the full flow.

---

## Project identity

`react-email-bridge` is a library that extends React Email to support emails with template markers (Handlebars, etc.), with interpolated preview and literal export. MIT licensed. Open source. No commercial intent.

The library does NOT replace React Email — it depends on `react-email` (which now consolidates `@react-email/render` + `@react-email/components`). It adds a thin layer that preserves template markers across render and provides a preset system (HBS first, others later).

Author: Marco Ferreira.

Public API (do not change without explicit author approval):

```ts
import { render, hbs, defineConfig } from 'react-email-bridge';
import { Each, If, Unless, Else, Raw } from 'react-email-bridge/hbs';
```

The two published packages:

- `react-email-bridge` (~38 KB built) — CLI + core + HBS preset
- `react-email-bridge-ui` (~13 MB) — vendored Next.js preview server

---

## Project-specific rules

1. **Never police helpers.** The library preserves what the user wrote. Validation is opt-in via `lint --strict-helpers` (planned v0.3+). VTEX in production accepts far more helpers than its docs admit — see CONTEXT.md "ground truth".

2. **All markers in text MUST pass through `unescapeMarkers()`.** React's `renderToStaticMarkup` HTML-escapes `"`, `'`, `>`, `<`, `&` in text nodes, which breaks block markers like `{{#eq foo "bar"}}`. Plano B (double unescape, before and after juice) is the official pipeline — NOT an emergency fallback. See `validation/test-pipeline.tsx` and `docs/internal/CONTEXT.md`.

3. **The fork `react-email-bridge-ui` follows its own rules.** Before editing files inside `packages/react-email-bridge-ui/`, read `docs/internal/PATCHES.md` for what each patch does and `docs/internal/VENDORING.md` for the rebase process. Biome is configured to ignore that directory so upstream rebases stay clean.

4. **`docs/internal/DECISIONS.md` is frozen.** 16 design decisions from v0.1 are locked there as historical record. New decisions go to `docs/adr/` (created on demand by `/grill-with-docs`), not appended to DECISIONS.md. If a new decision supersedes one in DECISIONS.md, cite the superseded D-number from the ADR.

5. **Big architectural decisions return to the author.** New runtime dependency, new public API, change of usage model → ask first. Tactical decisions (which lib to parse X, internal folder structure, picking between two equally-valid impls) → execute and document in an ADR if non-obvious.

6. **One topic per PR.** Mixed-scope PRs are hard to review and hard to revert. Use multiple commits within one PR for related changes, separate PRs for independent ones.

---

## Canonical files

> See `docs/README.md` for the full taxonomy (public / repo-internal / local-only)
> ratified in ADR-0002.

**Public (root):**

- `README.md` — user quickstart and "why this exists" pitch
- `CONTRIBUTING.md` — local setup, hooks, changesets flow
- `NOTICE.md` — attribution of runtime deps + reference repos
- `docs/adr/` — architectural decisions from v0.2 onwards
- `docs/README.md` — docs taxonomy explainer

**Repo-internal (`docs/internal/`):**

- `docs/internal/DECISIONS.md` — 16 design decisions from v0.1 (frozen historical record)
- `docs/internal/CONTEXT.md` — shared vocabulary (READ FIRST on new session)
- `docs/internal/PATCHES.md` — fork patches in `react-email-bridge-ui/`
- `docs/internal/VENDORING.md` — rebase process for the fork
- `docs/internal/agents/` — agent skill / triage / domain docs

**Local-only (gitignored):**

- `STATUS.md` — dev snapshots, optional
- `ROADMAP.md` — author's personal todo list

**Source tree:**

- `validation/test-pipeline.tsx` — pipeline stress test (28 asserts)
- `packages/react-email-bridge/src/core/` — render, hbs sentinels, unescapeMarkers
- `packages/react-email-bridge/src/hbs/` — sugar components, preview runtime, VTEX helper fakes
- `packages/react-email-bridge-ui/` — forked `@react-email/ui`
- `examples/vtex-store/` — real VTEX templates; also the source for `new-project --template vtex-store` per ADR-0001
- `examples/generic-hbs/` — minimal example; also the default scaffold (`new-project` → `generic-hbs`)
- `scripts/new-project.ts` — author shortcut, thin shim over the package's `init` command (see ADR-0001 + ADR-0003)
- `refs/` (gitignored) — reference repos for ground-truth validation

