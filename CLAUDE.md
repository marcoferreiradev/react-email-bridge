## Agent skills

### Issue tracker

Issues live in GitHub Issues at `marcoferreiradev/react-email-bridge`, managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`) — no overrides. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — one `CONTEXT.md` + `docs/adr/` at the repo root cover both packages (`react-email-bridge`, `react-email-bridge-ui`). See `docs/agents/domain.md`.

### Process gates (hooks + releases)

- Pre-commit: `lint-staged` runs `biome check --write` on staged files.
- Pre-push: `pnpm validate && pnpm build && pnpm test` (mirrors CI).
- Releases: every PR with public-API impact needs a changeset (`pnpm changeset`); docs/internal PRs can use `pnpm changeset --empty`. The `Version Packages` PR is opened automatically on merge to main.
- Bypass `--no-verify` when intentional (docs-only, WIP). Don't make it a reflex.

See `CONTRIBUTING.md` for the full flow.
