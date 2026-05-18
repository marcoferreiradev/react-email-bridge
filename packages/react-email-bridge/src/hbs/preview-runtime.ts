import Handlebars from 'handlebars';
import handlebarsHelpers from 'handlebars-helpers';
import { vtexFakeHelpers } from './preview-helpers';

export interface PreviewRuntimeOptions {
  /**
   * Throw on missing variables. Default false — VTEX runtime tolerates gaps,
   * and real-world fixtures often have missing optional fields. Users can
   * opt-in via config when authoring new templates.
   */
  strict?: boolean;
  /** Additional helpers (from user's config file). Merged after defaults. */
  extraHelpers?: Record<string, Handlebars.HelperDelegate>;
}

/**
 * Build a Handlebars instance loaded with:
 * 1. All of `handlebars-helpers` (~150 helpers including `#compare`, `math`,
 *    `#contains`, `#group`, etc — same set oficina uses server-side)
 * 2. Neutral fakes for the VTEX-specific helpers
 * 3. User overrides from config
 * 4. `helperMissing` fallback that emits `[helperName(args)]` for unknown
 *    helpers so the preview doesn't crash on custom platform helpers.
 */
export function buildPreviewRuntime(options: PreviewRuntimeOptions = {}): typeof Handlebars {
  const hb = Handlebars.create();

  // 1. handlebars-helpers (compare, math, contains, group, ...)
  try {
    handlebarsHelpers({ handlebars: hb });
  } catch (e) {
    console.warn('[react-email-bridge] handlebars-helpers failed to register:', e);
  }

  // 2. VTEX-flavored fakes
  for (const [name, impl] of Object.entries(vtexFakeHelpers)) {
    hb.registerHelper(name, impl);
  }

  // 3. User overrides
  if (options.extraHelpers) {
    for (const [name, impl] of Object.entries(options.extraHelpers)) {
      hb.registerHelper(name, impl);
    }
  }

  // 4. helperMissing fallback.
  //
  // Handlebars invokes this for unknown helpers AND for unknown variables (in
  // non-strict mode). To preserve idiomatic behavior:
  //   - `{{missingVar}}` (no args)  → empty string (variable lookup semantics)
  //   - `{{customHelper "a" 1}}` (with args) → `[customHelper("a", 1)]` debug stub
  // Without this split, `{{orderId}}` against an empty fixture would render
  // `[orderId()]` instead of '', which is surprising and ugly.
  hb.registerHelper('helperMissing', (...args: unknown[]) => {
    const opts = args.pop() as Handlebars.HelperOptions & { name: string };
    if (args.length === 0) return '';
    const params = args.map((a) => JSON.stringify(a)).join(', ');
    return new hb.SafeString(`[${opts.name}(${params})]`);
  });

  return hb;
}

export interface PreviewResult {
  html: string;
  error?: { message: string; line?: number; column?: number };
}

/**
 * Run Handlebars against `fixture`. Returns `{ html }` on success, or
 * `{ html: '', error }` on parse/render failure (e.g. missing var in strict
 * mode, malformed marker).
 */
export function previewWithFixture(
  html: string,
  fixture: Record<string, unknown>,
  options: PreviewRuntimeOptions = {}
): PreviewResult {
  const { strict = false } = options;
  const hb = buildPreviewRuntime(options);
  try {
    const template = hb.compile(html, { strict });
    return { html: template(fixture) };
  } catch (e) {
    const err = e as Error & { lineNumber?: number; column?: number };
    return {
      html: '',
      error: {
        message: err.message,
        line: err.lineNumber,
        column: err.column,
      },
    };
  }
}
