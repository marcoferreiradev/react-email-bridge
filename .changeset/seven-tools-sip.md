---
---

Add OSS governance scaffolding for the public repo:

- `.github/CODEOWNERS` — default reviewer
- `.github/ISSUE_TEMPLATE/{bug,feature}.yml` — structured forms with
  `needs-triage` auto-label
- `.github/PULL_REQUEST_TEMPLATE.md` — summary + test plan + changeset
  checklist
- `SECURITY.md` — disclosure policy (email author privately)
- `.github/dependabot.yml` — weekly npm grouped updates + monthly
  github-actions, with `next` / `react` / `react-dom` pinned to the
  fork-rebase workflow
