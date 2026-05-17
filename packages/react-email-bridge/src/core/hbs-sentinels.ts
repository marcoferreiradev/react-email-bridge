import { nanoid } from 'nanoid';

const sentinelMap = new Map<string, string>();

/**
 * Produces a CSS-safe sentinel that survives juice's CSS parsing.
 * After `renderToStaticMarkup`, `substituteSentinels()` swaps each
 * sentinel for its `{{path}}` HBS marker.
 *
 * Use inside `style` objects where React rejects non-string values:
 *
 *   <Section style={{ color: hbs('client.brandColor') }} />
 *
 * For string attributes (`src`, `alt`, `href`) and text nodes, you can
 * write the marker directly: `src={`{{logoUrl}}`}`.
 */
export function hbs(path: string): string {
  const id = `HBSSENTINEL${nanoid(12).replace(/[^A-Za-z0-9]/g, 'X')}`;
  sentinelMap.set(id, path);
  return id;
}

export function substituteSentinels(html: string): string {
  return html.replace(/HBSSENTINEL[A-Za-z0-9]{12}/g, (id) => {
    const path = sentinelMap.get(id);
    return path ? `{{${path}}}` : id;
  });
}

/**
 * React's `renderToStaticMarkup` escapes `"`, `'`, `>`, `<`, `&` inside text
 * nodes. HBS markers in text nodes (`{{#eq foo "bar"}}`) come out of render as
 * `{{#eq foo &quot;bar&quot;}}` — Handlebars cannot parse that.
 *
 * This pass walks the HTML and, for every `{{...}}` match, decodes the
 * common HTML entities. Only the inside of markers is touched; surrounding
 * HTML is left alone.
 *
 * Must be called both before AND after `juice()` — juice re-escapes during
 * CSS-aware serialization.
 */
export function unescapeMarkers(html: string): string {
  return html.replace(/\{\{[\s\S]*?\}\}/g, (marker) =>
    marker
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&')
  );
}
