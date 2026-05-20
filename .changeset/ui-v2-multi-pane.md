---
'react-email-bridge-ui': minor
---

UI v2 — multi-pane preview layout. See
[ADR-0004](../docs/adr/0004-multi-pane-preview-layout.md) for the
design rationale and PATCHES.md P7 for the fork divergence notes.

Replaces the v0.1 single-active-view toggle (`?view=preview|source`)
with a multi-pane layout:

- **Source Area + Preview side-by-side**, always visible. Resizable
  horizontally via [`react-resizable-panels`](https://github.com/bvaughn/react-resizable-panels)
  (new runtime dep).
- **Chip Strip** above the Source Area toggles which Source variants
  are open as panes. Any combination of React / HTML / Plain Text /
  Data can be visible at once (1–4 panes). Replaces the v0.1 sub-tabs.
- **Inspection panel** (Linter / Compatibility / Spam / Resend) is
  **dockable**: bottom (default — preserves v0.1 collapse-on-empty
  behavior), right, left, or hidden. Dock position persisted to
  localStorage; reopen-from-Topbar pill appears when hidden.
- **Sidebar collapse state** now persists across reloads
  (`localStorage: reb-sidebar-collapsed`).
- **Mobile fallback** (below Tailwind `lg`/1024px): the multi-pane
  layout collapses to a Preview-only view with a banner explaining
  that multi-pane authoring is desktop-only.

**URL schema (shareable state):**

| Param | Meaning | Replaces |
|---|---|---|
| `?source=react,html,plain,data` | Active Source chips (comma-separated) | `?lang=tsx\|html\|markdown\|json` |
| `?inspect-tab=linter\|compatibility\|spam-assassin\|resend` | Active Inspection tab | `?toolbar-panel=...` |
| `?dark` | Dark mode (unchanged) | — |
| `?width=N&height=N` | Iframe size (unchanged) | — |

**Migration:** v0.1 URLs (`?view=preview/source`, `?lang=...`,
`?toolbar-panel=...`) are rewritten on first load to the new schema
via `useUrlMigration`. Bookmarks keep working.

**localStorage keys (personal preference):**

- `reb-inspection-dock` — `bottom | right | left | hidden`
- `reb-sidebar-collapsed` — `0 | 1`
- `react-resizable-panels:reb-main-split-<dock>` — pane width ratios
- `react-resizable-panels:reb-source-panes-<active>` — Source pane widths

**Bug fixes shipping in the same release:**

- Long lines in Source panes now soft-wrap (`whitespace-pre-wrap` +
  `[overflow-wrap:anywhere]`) instead of producing horizontal scroll.
- Iframe drag handles removed — they conflicted with the multi-pane
  resize handle. Viewport size still controlled by the Topbar
  Desktop/Mobile/custom buttons.
- Workspace-root `pnpm.overrides` pin `react`/`react-dom` to 19.2.4
  so `next dev` doesn't load workspace-root's hoisted react@18 and
  fail SSR with "Objects are not valid as React child".

This is a UI rework — no public-API change in `react-email-bridge`. The
UI package is installed on-demand by the CLI so users picking up
`0.2.x` of `react-email-bridge` will get this layout automatically the
next time they run `dev`.
