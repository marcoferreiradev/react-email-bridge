---
---

CI fix: build workspace at release.yml level before changesets/action's
publish step, and drop per-package prepublishOnly. Solves the post-publish
race where `react-email-bridge-ui`'s next build couldn't resolve
`react-email-bridge/hbs` because the per-package prepublishOnly order
left dist/ in an unexpected state.
