# PATCHES — `react-email-bridge-ui`

Modifications applied to the fork of `@react-email/ui`
(Copyright 2024 Plus Five Five, Inc — MIT). For each patch: what, why,
where it lives, status as upstream contribution candidate.

The fork lives at `packages/react-email-bridge-ui/`. Rebase process is in
[VENDORING.md](./VENDORING.md). Project vocabulary used below (Plano B,
sentinel, marker, etc.) is defined in [CONTEXT.md](./CONTEXT.md).

---

## P1 — Insert the HBS pipeline between `render()` and the iframe

**Where**: `packages/react-email-bridge-ui/src/actions/render-email-by-path.tsx`
(lines ~218–290).

**What**: after the upstream `render()` returns markup, the action now runs
the full HBS pipeline before sending output back to the browser:

1. `substituteSentinels(rawMarkup)` — replace `HBSSENTINEL…` tokens in style
   attributes with their target `{{path}}` markers.
2. `unescapeMarkers(...)` (Plano B, pass 1) — decode HTML entities inside
   `{{…}}` boundaries that React's `renderToStaticMarkup` introduced.
3. The result is the `exportMarkup` — the literal `.hbs` output that goes
   into the export tab, the code preview, and is returned as
   `prettyMarkup` / `plainText` for the various UI tabs.
4. The same markup is then handed to Handlebars (`Handlebars.compile`) and
   interpolated against the adjacent `.json` fixture, producing the
   **interpolated** HTML rendered inside the iframe.

The action returns both forms simultaneously: code-view tabs show the
marker-preserving HBS, the iframe shows the fixture-interpolated render.

**Why**: there is no plug point in upstream between `render()` and the
iframe. The action calls `render()` directly and returns its output. Pipe-
hooking via a fork was the only way to inject the Plano B + Handlebars
steps without rewriting Next-on-Vercel server actions.

**Upstream candidate?**: not as a direct PR — what we did is too
preset-specific. Could become a plugin API upstream (e.g.
`renderEmail({ transformOutput })`). Worth proposing around v1.0 if the
preset story stabilizes.

---

## P2 — `useEmailRenderingResult`: react to adjacent `.json` changes

**Where**:
`packages/react-email-bridge-ui/src/hooks/use-email-rendering-result.ts`
(lines ~27–33).

**What**: the hook already subscribes to chokidar watches via socket.io.
We added recognition for `.json` files whose basename matches the open
template — when fired, the hook triggers a re-render so the iframe reflects
the new fixture data without a manual reload.

**Why**: upstream watches `.tsx` files only. Without this patch, editing
`<template>.json` did not update the preview — broken UX for a
fixture-driven workflow.

**Upstream candidate?**: strong. Generalizes naturally as "watch files
correlated to the open template" — could accept a regex or a list. Worth
proposing as a PR once we settle on the right shape.

---

## P3 — `check-links` / `check-images`: recognize template markers

**Where**:
- Util: `packages/react-email-bridge-ui/src/utils/is-template-marker.ts`
- Callsites:
  - `packages/react-email-bridge-ui/src/actions/email-validation/check-links.ts`
    (line 46, inside the link-iteration loop)
  - `packages/react-email-bridge-ui/src/actions/email-validation/check-images.ts`
    (lines 65 and 82 — `src` and `alt` checks)

**What**: util `isTemplateMarker(value)` recognizes Handlebars (`{{…}}`),
Liquid (`{% … %}`), and Mailchimp (`*|…|*`) marker syntax. Called early in
each validation loop — if the value is a marker, skip the check entirely.

**Why**: upstream link/image validators saw `href={`{{trackingUrl}}`}` as
"invalid URL" and `src={`{{logo}}`}` as "missing image", flooding the
Linter panel with false positives. UX was unusable on any real template.

**Upstream candidate?**: strong. The util is generic, the patches are
small, and any team using template engines on top of `@react-email/ui`
will hit the same problem.

---

## P4 — `MissingFixtureBanner` + adjacent fixture creation

**Where**:
- Component: `packages/react-email-bridge-ui/src/components/missing-fixture-banner.tsx`
- Wired into iframe layout:
  `packages/react-email-bridge-ui/src/app/preview/[...slug]/preview.tsx`
  (import at line 21, render at line 171)
- Server action for the "Create empty fixture" button:
  `packages/react-email-bridge-ui/src/actions/create-fixture.ts`

**What**: when the open template has no adjacent `<basename>.json`, an
overlay banner appears on top of the iframe explaining the situation and
offering a one-click "Create empty fixture" button that writes `{}` to
disk via the create-fixture server action.

**Why**: upstream has no concept of "fixture missing" — the iframe was
just blank, with no signal to the user about what to do. The banner +
button collapses the "what now?" moment into one click.

**Upstream candidate?**: not really — fixture-as-adjacent-`.json` is
specific to our model. Doesn't generalize to projects that don't follow
the same convention.

---

## P5 — Branding

**Where**:
- Document title: `packages/react-email-bridge-ui/src/app/layout.tsx`
  (line 10 — `title: 'react-email-bridge'`)
- Home page welcome: `packages/react-email-bridge-ui/src/app/page.tsx`
  (line 58 — "Welcome to react-email-bridge")
- Logo asset: `packages/react-email-bridge-ui/src/app/logo.png` (replaced)

**What**: replaced the Resend / `@react-email/ui` chrome (title, welcome
copy, logo image) with `react-email-bridge` branding.

**Why**: forks must distinguish themselves. MIT covers code but not
trademark — running under the Resend brand would imply Resend support /
endorsement we don't have.

**Upstream candidate?**: not applicable.

---

## P6 — Handlebars `strict: false` default

**Where**:
`packages/react-email-bridge-ui/src/actions/render-email-by-path.tsx`
(line 256 — the second arg to `Handlebars.compile`).

**What**: compile with `{ strict: false }` rather than upstream-default
strict mode. (Upstream doesn't call Handlebars at all, but our patched
call needed an explicit choice.) Per-project override is planned via
`react-email-bridge.config.ts: { strict: true }` when a user wants
strictness back.

**Why**: real VTEX fixtures have many optional fields. Strict mode rejects
the first missing path with `"X" not defined in undefined`, blocking the
preview for legitimate templates. Pragmatic default beats the purist one.

**Upstream candidate?**: not applicable (Handlebars compilation itself is
preset-specific to the bridge).

---

## P7 — UI v2: multi-pane preview layout

**Where**:

- New: `packages/react-email-bridge-ui/src/components/source-area/`
  (chip-strip.tsx, source-pane.tsx, source-area.tsx, types.ts,
  index.ts) — the Chip Strip + N Source panes (1–4) replacing the
  single-active-source CodeContainer.
- New: `packages/react-email-bridge-ui/src/components/inspection-dock-menu.tsx`
  + `icons/icon-dock.tsx` — the dock-position dropdown for the
  Inspection panel.
- New: `packages/react-email-bridge-ui/src/hooks/use-inspection-dock.ts`,
  `use-sidebar-collapsed.ts`, `use-url-migration.ts` — localStorage-backed
  preferences for dock position and sidebar collapsed state, plus the
  one-shot URL migration from v0.1 params.
- Rewrite: `packages/react-email-bridge-ui/src/app/preview/[...slug]/preview.tsx`
  — now owns the outer layout (Source pane | Preview pane horizontal
  split via react-resizable-panels) and conditionally renders the
  Inspection panel in 1 of 4 dock positions. Drops the iframe drag
  handles; viewport size is still driven by Topbar ViewSizeControls.
- Modified: `packages/react-email-bridge-ui/src/app/preview/[...slug]/page.tsx`
  — moves Toolbar render into Preview so the layout has full placement
  control.
- Modified: `packages/react-email-bridge-ui/src/components/toolbar.tsx`
  — new `dockPosition` + `onDockChange` props; outer wrapper uses
  absolute positioning only when bottom; renames the URL param from
  `?toolbar-panel` to `?inspect-tab` (legacy alias kept until next
  navigation).
- Modified: `packages/react-email-bridge-ui/src/components/shell.tsx`
  — swaps useState for useSidebarCollapsed (localStorage-backed).
- Modified: `packages/react-email-bridge-ui/src/components/code.tsx`
  — `whitespace-pre-wrap` + `[overflow-wrap:anywhere]` so long lines
  wrap inside panes instead of producing horizontal scroll.

**What**: rewrite of the preview area from a single-active-view toggle
(`?view=preview|source`) into a multi-pane layout. Source variants
(React / HTML / Plain Text / Data) become independent resizable panes,
opened by toggling chips. The Inspection panel (Linter / Compatibility /
Spam / Resend) becomes dockable to bottom (default), right, left, or
hidden — position persisted to localStorage. URL schema: `?source=`
(active chips, shareable), `?inspect-tab=` (active inspection tab,
shareable). Old `?view`, `?lang`, `?toolbar-panel` are migrated on
mount.

Adds `react-resizable-panels@^3` as a runtime dep. Adds workspace-root
`pnpm.overrides` for `react`/`react-dom` to force a single 19.2.4 across
the workspace (without the override, the workspace root's hoisted
react@18 caused "Objects are not valid as React child" in dev mode).

**Why**: see [ADR-0004](../adr/0004-multi-pane-preview-layout.md) for
the full design tree and the seven locked decisions. Short version: the
single-toggle model collapses authoring workflows (edit → preview →
back to source → flip lang → back to preview → repeat) into N clicks
per loop. Multi-pane is zero clicks per loop after initial setup, and
cross-pane comparison (HTML next to Data next to Preview) becomes
possible.

**Upstream candidate?**: no. `@react-email/ui` is purpose-built around
the single-active-view toggle as a deliberate authoring philosophy.
The bridge's HBS-template-author use case has different needs (one
render → two artifacts) that justify the divergence. This is exactly
the kind of patch the fork exists to host (see [VENDORING.md](./VENDORING.md)).
Rebases against new upstream releases will need to re-apply the layout
changes to `preview.tsx`, `toolbar.tsx`, and `shell.tsx` by hand.

---

## On the preview runtime's `helperMissing` fallback

The `helperMissing` fallback (`{{customHelper x}}` renders as `[name(x)]`
instead of throwing) is sometimes mentioned alongside fork patches. It is
**not** a fork patch — it lives in our own preset code at
`packages/react-email-bridge/src/hbs/preview-runtime.ts` (line ~55,
inside `registerHelpersOn(hb)`). Future readers who don't find it under
`packages/react-email-bridge-ui/` should look there.

---

## On rebase

To update against new upstream releases, see
[VENDORING.md](./VENDORING.md).
