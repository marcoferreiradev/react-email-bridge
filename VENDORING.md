# VENDORING — `@react-email/ui`

How the fork at `packages/react-email-bridge-ui/` is maintained, updated,
and audited.

## Current state

| Field                 | Value                                                              |
|-----------------------|--------------------------------------------------------------------|
| **Origin**            | https://github.com/resend/react-email                              |
| **Upstream package**  | `packages/ui/`                                                     |
| **Vendored at**       | `packages/react-email-bridge-ui/`                                  |
| **Initial fork commit** (ours) | `1f6ff5e` (2026-05-16)                                    |
| **Approximate upstream base SHA** | `5827d2f` (2026-05-14) — see "On the base SHA" below   |
| **Upstream license**  | MIT — preserved in `packages/react-email-bridge-ui/license.md`     |
| **Applied patches**   | See [PATCHES.md](./PATCHES.md)                                     |

## On the base SHA

The exact upstream SHA the fork was cut from was not recorded at the time
of initial vendoring. `5827d2f` is what `refs/react-email/` (the gitignored
local clone used for ground-truth lookups) was pointing at when the
vendoring happened — the actual base is at most that commit and almost
certainly within a day or two of it.

For the next rebase, **always** record the new SHA in this table.

## Why vendoring (D2)

`@react-email/ui` is a Next App Router that calls `render()` directly in
server actions. No customizable hook between `render` and the iframe for
HBS + fixture interpolation. Forking was the only viable path inside the
v0.1 timeline. See DECISIONS.md D2 for the full rationale.

## Rebase process

When upstream releases a relevant version:

### 1. Decide first — rebase or freeze?

- **Rebase** if: upstream landed features we want (better Linter, new
  Compatibility checks, etc.), security/perf fixes that touch code we run,
  or breaking changes to APIs we depend on (`render()` signature shifts,
  new server-action conventions, framework version bumps we'd otherwise
  have to do alone).
- **Freeze** if: changes are cosmetic, internal refactor with no
  externally visible gain, or the divergence has grown so far that
  rebasing costs more than the value of the new code.

Document the decision and the considered SHA in this file either way.

### 2. If rebasing

a. Read upstream CHANGELOG / release notes carefully.
b. List which `PATCHES.md` entries still apply. Some may have been absorbed
   upstream (ideal case: the patch disappears because upstream now does the
   right thing). Mark those for removal.
c. Make a backup branch (`backup/pre-rebase-YYYY-MM-DD`).
d. Pull the new upstream commit into a working branch. Replay the
   patches case-by-case. Conflicts that touch the same lines upstream
   changed need real review — don't auto-resolve.
e. Update the **Approximate upstream base SHA** + **Initial fork commit**
   row in the table above to the new SHA.
f. Update `PATCHES.md` line numbers wherever they shifted.
g. Run `pnpm install`, then `pnpm validate && pnpm build && pnpm test`
   end-to-end. Pre-push hook does the same — let it run.
h. Manual validation: `pnpm dev`, exercise every tab (Linter,
   Compatibility, Spam, Send, Data) with at least one real VTEX template
   from `examples/vtex-store/`.

### 3. If freezing

a. Append a short entry to "Freeze decisions" below: date, considered
   upstream SHA, one-line rationale.
b. Continue with what we have. No code change required.

## Freeze decisions

_None yet._

## Cadence

Review on every new upstream major (e.g. `react-email` 6 → 7). Don't block
v0.x development waiting on upstream — the bridge can ship features
against the current fork base.

## Criteria to abandon the fork

At some point one of these may become worth doing:

- **Build our own UI without Next** — accept loss of features the upstream
  provides (Linter, Spam-score, Send tab) in exchange for zero fork debt
  and a much smaller install. Reasonable around v1.0 if the upstream-patch
  cycle starts hurting.
- **Contribute the generalizing patches upstream** — `PATCHES.md` marks P2
  and P3 as strong candidates. If accepted, the fork shrinks; if `render`
  gets a `transformOutput` plug point (P1), the fork could shrink to near
  zero.
- **Keep vendoring through v1.0**, then re-evaluate when feature surface
  stabilizes.

Don't take this decision now. Document here when real signal appears.
