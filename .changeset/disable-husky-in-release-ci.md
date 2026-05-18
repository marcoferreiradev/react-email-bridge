---
---

CI fix: disable Husky in the `release.yml` job (`HUSKY=0`). Without it,
when `changesets/action` does the `git push` for release commits + tags,
the local `.husky/pre-push` hook fires inside the runner and re-runs
`pnpm build` in parallel with this job's own "Build packages" step. The
two next-build invocations race on `.next/`, the second one fails with
"Another next build process is already running", and the workflow ends
red — even though both packages have already been published successfully.

CI is already the gate; husky hooks in CI are redundant.
