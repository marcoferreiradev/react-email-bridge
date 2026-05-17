import { render as reactEmailRender } from 'react-email';
import juice from 'juice';
import type { ReactElement } from 'react';
import { substituteSentinels, unescapeMarkers } from './hbs-sentinels.js';

export interface RenderOptions {
  /** Run juice to inline CSS. Default true. */
  inlineCss?: boolean;
}

/**
 * Renders a React Email template to HTML with template markers preserved
 * (e.g. `{{var}}`, `{{#each items}}`). Output is meant to be pasted into a
 * platform (VTEX Message Center, Mandrill, Mailchimp, etc.) where the
 * template engine runs against real data.
 *
 * Pipeline: renderToStaticMarkup → substitute hbs() sentinels →
 * unescape markers → juice → unescape again.
 */
export async function render(
  element: ReactElement,
  options: RenderOptions = {}
): Promise<string> {
  const { inlineCss = true } = options;
  const rawHtml = await reactEmailRender(element, { pretty: false });
  const withMarkers = substituteSentinels(rawHtml);
  const unescaped = unescapeMarkers(withMarkers);
  if (!inlineCss) return unescaped;
  const inlined = juice(unescaped);
  return unescapeMarkers(inlined);
}

/**
 * Renders a template to plain text (for fallback when HTML is not supported).
 * Markers are preserved as literal text.
 */
export async function renderPlainText(element: ReactElement): Promise<string> {
  return reactEmailRender(element, { plainText: true });
}
