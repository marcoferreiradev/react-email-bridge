---
---

Internal refactor: drop `.js` extensions from all relative imports across
packages source + tests + examples. Bundler-resolution + tsdown handle
extensionless imports natively; emitted output unchanged. Removes
authoring friction in user-facing example templates.
