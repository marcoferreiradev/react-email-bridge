import type { Preset } from '../core/types';
import { previewWithFixture } from './preview-runtime';

/**
 * Handlebars preset. v0.1 is the only preset shipped.
 */
export const hbsPreset: Preset = {
  name: 'hbs',
  fileExtension: '.hbs',
  previewRuntime: (html, fixture) => {
    // Non-strict by default: VTEX runtime tolerates missing fields and many
    // real-world fixtures have gaps. Users can opt into strict via config.
    const result = previewWithFixture(html, fixture, { strict: false });
    if (result.error) {
      // Surface the error as visible HTML — let the iframe show it instead of
      // crashing the whole dev server.
      return errorHtml(result.error.message);
    }
    return result.html;
  },
};

function errorHtml(message: string): string {
  return `<!doctype html><html><body style="font-family:ui-monospace,monospace;padding:24px;color:#b00020;background:#fff5f5">
    <h2 style="margin:0 0 12px">Handlebars error</h2>
    <pre style="white-space:pre-wrap;font-size:13px;line-height:1.5">${escapeHtml(message)}</pre>
  </body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
