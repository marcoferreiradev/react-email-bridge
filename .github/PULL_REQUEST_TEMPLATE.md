<!--
Thanks for the PR! Quick checklist below. The pre-push hook already runs
typecheck / validate / build / test locally, so if your branch is green
the CI status check should be too.
-->

## Summary

<!-- 1-3 sentences. What's the goal? -->

## Changes

<!-- Bullet list of the concrete diffs. Skip if the PR is small enough that the title says it. -->

## Test plan

- [ ] `pnpm typecheck` / `pnpm validate` / `pnpm build` / `pnpm test` — all green locally
- [ ] Manual verification (if applicable): <!-- describe what you exercised -->
- [ ] Docs updated (README / CONTRIBUTING / `docs/internal/`) if behavior changed

## Changeset

- [ ] `pnpm changeset` (if public-API impact)
- [ ] `pnpm changeset --empty` (if docs-only / internal / CI)

## Related

<!-- Issue numbers, ADR references, prior PRs. Delete the section if none. -->
