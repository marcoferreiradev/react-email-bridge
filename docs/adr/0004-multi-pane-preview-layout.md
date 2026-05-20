# ADR 0004: Multi-pane preview layout

## Status

Accepted (2026-05-19)

## Context

The forked UI from `@react-email/ui` (see ADR 0001 alternative #2 and the
vendoring rationale in `docs/internal/VENDORING.md`) ships a **single
active view** model: the user toggles `?view=preview` and `?view=source`
exclusively, with sub-tabs inside Source for React / HTML / Plain Text /
Data, and a separate **fixed bottom toolbar** for Linter / Compatibility
/ Spam / Resend, one Inspection tab visible at a time.

This works for "browse a polished template" but breaks the iteration
loop a serious email author actually has:

1. Edit `emails/order-confirmed.tsx` → flip to Preview → click back to
   Source → switch to HTML to copy → back to Preview → repeat. The
   toggle costs at least one click per inspection cycle.
2. Inspect Data side-by-side with Source while debugging a Handlebars
   path — currently impossible without two browser windows.
3. Run Linter while editing — currently the toolbar collapses to bottom
   strip, eating the iframe vertical space, AND can only show one tab
   at a time so debug context evaporates each switch.
4. On large displays (≥1440px) most of the canvas sits unused while the
   single active view stretches into a "letterbox" with massive margins.

The right model for this workload is **multi-pane**: Preview is always
visible alongside whichever Source representations the author needs,
the Inspection panel docks where it doesn't fight the canvas, and
state across panes is preserved across reloads (URL for shareable
configuration, localStorage for personal preference).

This is **not a feature upstream will accept** — `@react-email/ui` is
purpose-built around the single-view toggle as a deliberate authoring
philosophy ("focus on one representation at a time"). The bridge
authors disagree for the HBS-template-author use case: marker-bearing
templates need cross-pane debugging because the **same render produces
two artifacts** (HBS-preserving HTML for export AND fixture-interpolated
HTML for preview). Seeing both at once is the loop.

A grilling session on 2026-05-18 locked seven design decisions before
implementation. The session is captured in the gitignored ROADMAP.md;
this ADR is the durable record.

## Decision

Rewrite the preview area into a **multi-pane layout** with the
following structure:

```
┌─────────────────────────────────────────────────────────────────┐
│ Topbar (email title, dark-mode toggle, viewport controls, Send) │
├──────────┬──────────────────────────────────────────────────────┤
│          │ Chip Strip [React] [HTML] [Plain Text] [Data]        │
│ Sidebar  ├────────────────────┬─────────────────────────────────┤
│ (file    │ Source pane(s)     │ Preview pane                    │
│  tree)   │ (1–4, per chips)   │ (iframe with fixture data)      │
│          ├────────────────────┴─────────────────────────────────┤
│          │ Inspection Panel — Linter | Compat | Spam | Resend   │
│          │ (dockable: bottom / right / left / hide)             │
└──────────┴──────────────────────────────────────────────────────┘
```

### Seven locked decisions

1. **Layout model: multi-pane with Inspection as a dockable block.**
   Preview is always visible; Source representations open as independent
   panes alongside it. Inspection is one block that the user docks to
   bottom (default), right, left, or hides entirely.

2. **Sub-tab nesting: asymmetric.**
   - Source = panes (any combination of React / HTML / Plain Text / Data
     can be open simultaneously, each in its own resizable pane).
   - Inspection = tabs (Linter / Compatibility / Spam / Resend show one
     at a time inside the single Inspection block; switching tabs does
     not affect pane geometry).

3. **Source area mechanics: chip strip + vertical split, no cap.**
   A toggleable chip strip at the top of the Source area controls which
   representations are open. Active chips = open panes. Default split
   direction is vertical (panes stack side by side). No hard cap on
   pane count — let users pile chips if they want.

4. **Persistence: P3 hybrid (URL + localStorage).**
   - **URL** carries shareable state: `?source=react,html` (active
     chips), `?inspect-tab=linter` (active Inspection tab).
   - **localStorage** carries personal preference: sidebar collapsed
     state, Inspection dock position, pane width ratios.
   - URL precedence over localStorage when both define a field, so a
     shared link reproduces what the sender saw.

5. **Default state: Source(React) + Preview visible, Sidebar open,
   Inspection closed.** New users land on something that demonstrates
   the value of the multi-pane model without overwhelming them. URLs
   from the v0.1 era (`?view=preview`, `?view=source`) are honored as a
   migration step (translated to the equivalent new state on first
   load) and then rewritten to the new schema.

6. **Mobile fallback: M1 — graceful degrade below `lg` (Tailwind 1024px).**
   Below the breakpoint, the multi-pane layout collapses to a single
   tab strip equivalent to the old toggle behavior. Multi-pane is a
   desktop affordance; phone authoring is out of scope and a tab strip
   is a perfectly reasonable read-only fallback for someone who wants
   to glance at a template on the road.

7. **Resizing library: `react-resizable-panels`** (~20 KB MIT, the
   library shadcn/ui standardizes on). Avoids hand-rolling resize logic
   or fighting the existing `ResizableWrapper` which is iframe-specific.
   Adds one runtime dependency to `react-email-bridge-ui`.

## Consequences

**Easier:**

- The authoring loop ("edit, preview, inspect, repeat") collapses from
  N clicks per cycle to N-3 — the most common workflows (edit + preview;
  edit + preview + linter) are zero-click after initial setup.
- Cross-pane comparison becomes possible: HTML next to Data next to
  Preview side-by-side is the natural shape for debugging Handlebars
  path mismatches.
- Inspection panel stops eating fixed bottom space when not needed; on
  wide displays, dock it right and the iframe gets full vertical room.
- The URL is now copy-pasteable across machines and includes the exact
  pane configuration — "look at this exact view, here's the link" for
  collaboration or bug reports.

**Harder:**

- This is a **large patch into the fork**. Adds substantial divergence
  in `preview.tsx`, `shell.tsx`, `toolbar.tsx`, `components/topbar/*`,
  and introduces new layout components. Documented as Pn entries in
  `PATCHES.md` so future rebases know what to replay.
- Upstream `@react-email/ui` will continue evolving the single-toggle
  shape; some upstream improvements to Topbar / view switching will
  need to be reinterpreted into our pane model during rebase rather
  than direct-applied. The vendoring criteria in `VENDORING.md`
  already covers when freeze-vs-rebase is the right call; this ADR
  pushes that calculus further toward "freeze unless the change is
  in code we still share."
- Pane-state persistence is more involved than the current
  `?view=X` toggle. The URL schema (`?source=react,html&inspect-tab=…`)
  must be parsed defensively and reconcile with localStorage on every
  navigation. The migration from `?view=preview/source` is one-shot
  but must be correct (loses the user's bookmark URL otherwise).
- Mobile fallback is implemented but largely untested in actual
  authoring — the bet is that mobile is "glance only," not a real
  workflow. If signal comes back that people DO want to author on
  iPad / phone, the M1 fallback may need to evolve toward something
  closer to multi-pane with smarter density.

**Load-bearing assumption:** users have at least `lg` viewport
(1024px+) for the multi-pane experience. If a meaningful slice of
authors works on smaller displays, the M1 fallback needs to grow up
into M2/M3 territory (small-but-still-multipane). Revisit after first
real signal.

## Alternatives considered

1. **Layout L1 — tabbed views, current behavior.**
   Status quo. Rejected — the workflow problem above persists. Single
   biggest UX gap in v0.1.

2. **Layout L2 — fixed three-column Source | Preview | Inspection.**
   Simpler than multi-pane but loses Source variant flexibility (only
   React visible). The whole point of multi-source is to debug the
   HBS-preserving HTML alongside the interpolated render — L2 still
   forces you to click through Source variants.

3. **Sub-tab nesting model — Inspection as panes too.**
   Could let Linter + Compatibility + Spam all be visible at once.
   Rejected because (a) the four inspection contents are each
   self-contained reports — there's no value seeing Linter scroll past
   Spam scroll past Compatibility in three small windows, (b) each
   inspection tab benefits from full width for its tables, (c) the
   tabs are designed as alternative views of the same artifact, not
   complementary panes. Stays single-block-with-tabs.

4. **Persistence — URL only (P1) or localStorage only (P2).**
   - P1 (URL only): shareable but no personal preference. User who
     prefers sidebar closed has to close it every fresh window.
   - P2 (localStorage only): personal preference works but no shareable
     deep-links. Lost the ability to send "look at this exact view."
   P3 hybrid is more code but captures both.

5. **Resizing library — `react-mosaic` / `golden-layout` / hand-roll.**
   - `react-mosaic`: too feature-heavy (drag-drop pane rearrangement,
     panel popouts) — solves problems we don't have. ~70 KB.
   - `golden-layout`: not React-native, vanilla DOM. Awkward integration.
   - Hand-roll: would take 1-2 weeks of careful work for resize +
     keyboard a11y + touch handling that `react-resizable-panels`
     gives for free.

6. **Mobile fallback M2 — multi-pane that scales density.**
   Considered (smaller panes, denser chips, single Source pane below
   `lg`). Rejected for v1 — too much complexity to validate on a
   workflow that may not exist. M1 simple fallback ships now; revisit
   when there's signal.

## Updates to PATCHES.md

This ADR adds a major patch entry (call it P7 in `PATCHES.md`) covering
the multi-pane layout. Sub-patches that fall under P7:

- New layout components: `panes/`, `inspection-dock/`, `chip-strip/`.
- Substantial rewrite of `preview.tsx` (composition shifts from
  conditional view switch to pane orchestration).
- `shell.tsx` adds dock-position handling around `<main>`.
- `toolbar.tsx` keeps its tab logic but loses its absolute-bottom
  positioning; becomes a child of the Inspection block.
- `topbar/active-view-toggle-group.tsx` removed; chip-strip replaces it.

`PATCHES.md` should be updated in the same PR as the implementation to
keep the rebase guide in sync.

## Updates to CONTEXT.md

This ADR introduces four canonical terms documented in
`docs/internal/CONTEXT.md`:

- **Pane** — a single resizable region inside the main authoring area
  (a Source variant or the Preview). Multiple panes can be open at
  once; together they form the **Source Area** and the **Preview
  Area**.
- **Source Area** — the horizontal region containing one or more
  Source panes (React / HTML / Plain Text / Data), opened via the
  Chip Strip.
- **Inspection Panel** — the dockable block hosting Linter /
  Compatibility / Spam / Resend tabs. Distinct from the Source /
  Preview panes — does not participate in the chip strip and is not a
  pane.
- **Chip Strip** — the toggle bar above the Source Area controlling
  which Source variants are open as panes.
