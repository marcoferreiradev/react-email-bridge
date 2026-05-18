# IMPLEMENTATION_NOTES.md — Bloco 10 pre-publish prep

> Phase 2 of `review-to-release-workflow`. Scoped implementation plan derived
> from approved answers in `QUESTIONS.md`, locked decisions from
> `/grill-with-docs` session, and ADRs 0001–0002.
>
> Created 2026-05-18.

## PR slicing

Per CLAUDE.md project rule #6 ("one topic per PR"), the work is sliced into
8 PRs. They land in approximate dependency order; some can land in parallel.

| # | PR title (proposed) | Topic | Depends on |
|---|---|---|---|
| 1 | `chore(docs): bloco 10 discovery — questions, ADRs, plan` | Phase 1 artifacts | — |
| 2 | `refactor: drop .js extensions from all relative imports` | Code style (T2) | 1 |
| 3 | `refactor(starters): examples are the single source` | T1 / ADR-0001 | 1, 2 |
| 4 | `docs: reorganize per taxonomy (public/internal/local)` | T3 / ADR-0002 | 1 |
| 5 | `docs(readme): rewrite quickstart for npm install flow` | T4 (Q14) | 1, 3, 4 |
| 6 | `chore(release): pre-publish hygiene (metadata, hooks, cleanup)` | Q4-Q7, Q10, Q20, Q21, Q25, Q26 | 1 |
| 7 | `ci(release): wire publish + v0.2.0 changeset` | Q8, Q9 | 6 |
| 8 | `chore(.github): OSS governance files` | Q2 | — (any time) |

External / out of my hands:

- Q1 — flip repo to public via GitHub settings (after PRs 1–8 merge).
- Add `NPM_TOKEN` secret (Settings → Secrets → Actions) before PR 7's merge
  triggers the publish flow.
- Confirm branch protection ruleset auto-activates on flip (Q3).
- After publish, edit auto-generated `v0.2.0` GitHub Release notes (Q28).

---

## Per-PR scope detail

### PR 1 — Phase 1 artifacts (this PR)

**Files:**

- `QUESTIONS.md` (new) — answered question set.
- `docs/adr/0001-examples-as-starter-source.md` (new).
- `docs/adr/0002-docs-taxonomy.md` (new).
- `CONTEXT.md` (edit) — adds `Example` and `Starter` term definitions.
- `IMPLEMENTATION_NOTES.md` (new — this file).

**Verification:** none beyond `pnpm validate && pnpm build && pnpm test` (the
pre-push gates). Pure documentation.

### PR 2 — Drop `.js` extensions

**Scope:**

- `packages/react-email-bridge/src/**/*.ts` — internal imports
- `packages/react-email-bridge/tests/**/*.{ts,tsx}` — test imports
- `examples/vtex-store/**/*.tsx` — example imports

**Approach:** mechanical replacement, regex `from '(\..+?)\.js'` → `from '$1'`.
Then run the full pre-push gate (`pnpm typecheck && pnpm validate &&
pnpm build && pnpm test`) and require all green before commit.

**Constraint (per user):** must run tests and prove no breakage.

### PR 3 — Examples-as-starter consolidation

**Scope (delete):**

- `starters/` (entire directory: default + vtex-full)

**Scope (refactor):**

- `scripts/new-project.mjs` — change from `cp -r starters/<name>` to
  `cp -r examples/<name>` + apply transformations:
  - Rewrite `package.json`: drop `workspace:*` → `^<latest>`, rename to
    user-provided, drop `react-email-bridge-ui` if present, ensure
    `private: true`.
  - Generate `.npmrc` (allow-build esbuild + sharp + highlight.js, deduped).
  - Generate `tsconfig.json` (standalone, not extending workspace root).
  - Generate `react-email-bridge.config.ts` (stub with `previewHelpers: {}`).
  - Generate `README.md` (user-facing, template name in header).
- `.github/workflows/ci.yml` — update smoke step to scaffold from examples
  (paths change; `pack-all` may be modified or removed depending on Q11).

**Decision: drop `pack-all` from the user-facing flow but keep the script
for CI smoke validation.** Per Q11 + Q24 — `pnpm pack-all` becomes
internal smoke test only.

**Verification:**

- `pnpm test`, `pnpm validate`, `pnpm build`.
- Manual: `node scripts/new-project.mjs /tmp/test-vtex --template vtex-store --skip-install`
  and inspect output structure.
- CI smoke step exercises the bootstrap end-to-end.

### PR 4 — Docs reorganization

**Scope (gitignore + git rm):**

- `STATUS.md`
- `ROADMAP.md`

Add to `.gitignore`:

```
# Local-only author notes (see docs/adr/0002-docs-taxonomy.md)
STATUS.md
ROADMAP.md
```

Run `git rm --cached STATUS.md ROADMAP.md`. Files stay on disk.

**Scope (move to `docs/internal/`):**

- `DECISIONS.md` → `docs/internal/DECISIONS.md`
- `PATCHES.md` → `docs/internal/PATCHES.md`
- `VENDORING.md` → `docs/internal/VENDORING.md`
- `CONTEXT.md` → `docs/internal/CONTEXT.md`
- `docs/agents/` → `docs/internal/agents/`

**Scope (create):**

- `docs/README.md` — taxonomy explainer (per Q18).

**Scope (cross-reference update):**

- `README.md` — `[DECISIONS.md](./DECISIONS.md)` → `[DECISIONS.md](./docs/internal/DECISIONS.md)`
- `CONTRIBUTING.md` — similar relink.
- `NOTICE.md` — `[PATCHES.md](./PATCHES.md)` → `[PATCHES.md](./docs/internal/PATCHES.md)`
- `CLAUDE.md` — agent-skills paths.
- `docs/adr/README.md` — cross-link to internal/DECISIONS path.
- `docs/internal/PATCHES.md` — `[VENDORING.md](./VENDORING.md)` stays
  (sibling).
- Any other `[*.md](./*.md)` references in tracked files.

**Verification:** `grep -rn '\]\(\./' docs/ CONTRIBUTING.md README.md CLAUDE.md` and verify no dangling links.

### PR 5 — README rewrite

**Scope:**

- `README.md` — full quickstart rewrite per Q14 = A:
  - Install: `npm install react-email-bridge` / `pnpm add react-email-bridge`
  - Bootstrap: `npx react-email-bridge init my-emails` (or `pnpm dlx`)
  - Dev: `cd my-emails && npx react-email-bridge dev`
  - Export: `npx react-email-bridge export --all`
- Replace `status: pre-release v0.1` badge with npm version badge
  (`https://img.shields.io/npm/v/react-email-bridge.svg`).
- Add install command snippet at the top.
- Move the `pnpm pack-all` / `new-project` "local dev" flow to
  `CONTRIBUTING.md` ("Working on the lib itself" section).

**Scope (CLAUDE.md trim — bundled here for atomicity):**

- Remove `## About the author` section per Q16.
- Move agent-only behavioral preferences to `.claude/CLAUDE.md` (private,
  already gitignored as part of `.claude/` not being tracked) if author
  wants. Default: just delete the section.

**Scope (NOTICE trim — bundled here too):**

- Edit `NOTICE.md:57-58` per Q17:
  - Before: `- email-templates-oficina — private real-world reference (Oficina Reserva, used by author with permission)`
  - After: `- email-templates-oficina — private real-world reference (used by author with permission)`

### PR 6 — Publish hygiene

**Package metadata (Q4):**

`packages/react-email-bridge/package.json`:

```json
"author": "Marco Ferreira <marcoferreiradev@gmail.com>",
"repository": {
  "type": "git",
  "url": "git+https://github.com/marcoferreiradev/react-email-bridge.git",
  "directory": "packages/react-email-bridge"
},
"homepage": "https://github.com/marcoferreiradev/react-email-bridge#readme",
"bugs": { "url": "https://github.com/marcoferreiradev/react-email-bridge/issues" },
"keywords": ["react-email", "handlebars", "vtex", "transactional-email", "mandrill", "mailchimp", "template", "preview", "hbs"]
```

`packages/react-email-bridge-ui/package.json` (Q5):

- Same metadata block (with `directory: "packages/react-email-bridge-ui"`).
- Remove `react-email` from `devDependencies` (keep in `dependencies`).

**License rename (Q6):**

- `packages/react-email-bridge-ui/license.md` → `packages/react-email-bridge-ui/LICENSE`
- Update `files` array in package.json: `"license.md"` → `"LICENSE"`.
- Note in `docs/internal/PATCHES.md` as a stylistic patch over upstream.

**`-ui` readme rewrite (Q7):**

- Overwrite `packages/react-email-bridge-ui/readme.md` (or rename to `README.md` for uppercase consistency):

  ```
  # react-email-bridge-ui

  Live preview server for [`react-email-bridge`](https://npmjs.com/package/react-email-bridge).
  You probably want to install `react-email-bridge` instead — this package
  is installed on-demand by its CLI.

  Forked from [`@react-email/ui`](https://github.com/resend/react-email) (MIT).
  ```
- Add `"README.md"` to the `files` array.

**prepublishOnly (Q20):**

- `packages/react-email-bridge/package.json`: `"prepublishOnly": "pnpm build"`
- `packages/react-email-bridge-ui/package.json`: `"prepublishOnly": "pnpm build"`

**Changesets ignore examples (Q26):**

- `.changeset/config.json`: add `"ignore": ["example-vtex-store", "example-generic-hbs"]`.
- Delete `examples/vtex-store/CHANGELOG.md` and `examples/generic-hbs/CHANGELOG.md`.

**Pre-commit env block (Q21):**

- Edit `.husky/pre-commit`:

  ```sh
  if git diff --cached --name-only --diff-filter=A | grep -qE '\.env(\.|$)|\.pem$|\.key$'; then
    echo "❌ Sensitive file detected in staged changes. Use --no-verify if intentional."
    exit 1
  fi
  pnpm exec lint-staged
  ```

**Validation cleanup (Q10, Q25):**

- `rm -rf validation/screenshots/`
- `rm -f validation/ui-*.png` (local only, already gitignored)
- Update `.gitignore`: drop the now-unused `validation/screenshots/.gitignore`
  line (line is in the file because the folder existed; if dropped, no entry
  needed).

**Comment root deps (Q13):**

- Add a leading `_comment` field or a `README` link in root `package.json`
  explaining the duplication for `validation/test-pipeline.tsx`. Use
  npm-standard `"_comment"` (ignored by npm) or document in
  `CONTRIBUTING.md` instead.

### PR 7 — Release wiring + v0.2.0 changeset

**release.yml (Q9):**

- `.github/workflows/release.yml:46-53`:
  ```yaml
  - name: Create Version Packages PR / publish
    uses: changesets/action@v1
    with:
      version: pnpm changeset version
      publish: pnpm changeset publish
      commit: 'chore: version packages'
      title: 'chore: version packages'
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
  ```

**v0.2.0 header changeset (Q8):**

- New file `.changeset/bloco-7-11-v0-2-0.md`:
  ```md
  ---
  "react-email-bridge": minor
  "react-email-bridge-ui": minor
  ---

  v0.2.0 — first npm release. Includes 13 VTEX templates ported (Bloco 7),
  Halo-Tailwind modernization (Bloco 11), fixture-based preview, full HBS
  preset. See CHANGELOG for cumulative detail since 0.0.1.
  ```

**Pre-merge checklist (external, blocking):**

- `NPM_TOKEN` secret added to repo with publish permission for both packages.
- Repo flipped to public (Q1).
- (Optional) Verify ruleset auto-activated (Q3).

### PR 8 — OSS governance

**Files (Q2):**

- `.github/CODEOWNERS` — `* @marcoferreiradev`
- `.github/ISSUE_TEMPLATE/bug.yml` — form fields: what happened, expected,
  reproduction (preferably link to repo), versions.
- `.github/ISSUE_TEMPLATE/feature.yml` — form fields: motivation, proposed
  API, alternatives.
- `.github/PULL_REQUEST_TEMPLATE.md` — checklist:
  - [ ] Changeset added (`pnpm changeset`) or `--empty` if internal/docs
  - [ ] Tests added/updated (if applicable)
  - [ ] Docs updated (if applicable)
  - [ ] Pre-push gate green locally
- `SECURITY.md` — minimal disclosure policy: email author privately for
  security issues, public issue tracker for everything else.
- `.github/dependabot.yml` — weekly npm updates, group dev deps.

**Can land any time before flip-to-public.**

---

## Phase 3 inputs (verification)

After all PRs merge, the verification phase will:

- Confirm each `QUESTIONS.md` answer is reflected in code.
- Confirm ADR 0001's transformation list is implemented in `new-project.mjs`.
- Confirm ADR 0002's file movements are complete and cross-references work.
- Run a clean-checkout `pnpm install && pnpm validate && pnpm build && pnpm test`.
- Manually walk through the consumer path (after publish):
  `npm create react-email-bridge@latest /tmp/release-test`
  → `cd /tmp/release-test && pnpm dev` → confirm preview renders.

---

## Phase 4 inputs (release readiness)

- `npm view react-email-bridge` shows v0.2.0 with all metadata.
- `npm view react-email-bridge-ui` likewise.
- GitHub repo is public.
- README + governance + ADRs visible at github.com/marcoferreiradev/react-email-bridge.
- Verdict: Ready | Ready with caveats | Not ready.
