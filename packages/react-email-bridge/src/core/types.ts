import type Handlebars from 'handlebars';

/**
 * A preset describes how to render and preview a specific template engine
 * (Handlebars, Liquid, Mailchimp merge tags, etc.). v0.1 ships only `hbs`.
 */
export interface Preset {
  /** Identifier, e.g. 'hbs', 'liquid', 'mailchimp'. */
  name: string;
  /** File extension for the exported template (e.g. '.hbs', '.liquid'). */
  fileExtension: string;
  /** Interpolates `html` against `fixture` for live preview in the iframe. */
  previewRuntime: (html: string, fixture: Record<string, unknown>) => string;
}

/**
 * An inline Handlebars helper. Called with zero or more positional args:
 *
 *   {{myHelper}}                  → fn()
 *   {{myHelper value}}            → fn(value, options)
 *   {{myHelper a b "lit"}}        → fn(a, b, "lit", options)
 *
 * Last argument is always Handlebars's `options` object — most inline helpers
 * ignore it. Return value is rendered as text (string, number, etc) or used
 * as a `SafeString` to avoid HTML escaping.
 */
export type PreviewInlineHelper = (
  this: unknown,
  ...args: [...unknown[], Handlebars.HelperOptions]
) => unknown;

/**
 * A block Handlebars helper:
 *
 *   {{#myBlock arg}} ... {{else}} ... {{/myBlock}}
 *
 * Receives positional args + the `options` object. Call `options.fn(ctx)` to
 * render the truthy branch, `options.inverse(ctx)` for the `{{else}}` branch.
 */
export type PreviewBlockHelper = (
  this: unknown,
  ...args: [...unknown[], Handlebars.HelperOptions]
) => string | Handlebars.SafeString;

/**
 * A custom preview helper. Same shape as Handlebars's `HelperDelegate`, but
 * with friendlier docs and explicit union of inline vs block. You can return
 * a plain string (escaped) or a `new Handlebars.SafeString(...)` to opt out
 * of HTML escaping (useful for helpers that emit HTML).
 *
 * Examples:
 *
 * ```ts
 * // Inline helper
 * shout: (s) => String(s).toUpperCase()
 *
 * // Block helper with else
 * iconFor(name, options) {
 *   return name ? options.fn(this) : options.inverse(this)
 * }
 * ```
 */
export type PreviewHelper = PreviewInlineHelper | PreviewBlockHelper;

/**
 * User-facing config loaded from `react-email-bridge.config.ts` at the project root.
 */
export interface BridgeConfig {
  /**
   * Override the default export extension. Default `.hbs`.
   *
   * Common choices: `.hbs` (VTEX Message Center), `.html` (Mandrill), or any
   * extension your target platform recognises.
   */
  outputExtension?: string;

  /**
   * Custom Handlebars helpers registered into the preview runtime. These run
   * ONLY in preview — they do NOT travel with the exported `.hbs`. The
   * target platform (VTEX, etc.) supplies the real implementation at send
   * time. Use these to make preview match production visually.
   *
   * Keys are helper names as referenced in templates (`{{helperName arg}}`).
   * Merged with the built-in 16 VTEX-flavored fakes (formatCurrency, math,
   * group, etc.) — your version wins on collision.
   *
   * @example
   * previewHelpers: {
   *   // Inline helper
   *   shout: (s) => String(s).toUpperCase(),
   *
   *   // Block helper (note `options` arg)
   *   isAdmin(user, options) {
   *     return user?.role === 'admin'
   *       ? options.fn(this)
   *       : options.inverse(this)
   *   }
   * }
   */
  previewHelpers?: Record<string, PreviewHelper>;

  /**
   * Strict mode in Handlebars preview.
   *
   * - `false` (default) — missing variables render as empty string. Matches
   *   VTEX runtime behavior and tolerates real-world fixtures with gaps.
   * - `true` — throws on missing variables. Useful while authoring new
   *   templates to catch typos in fixture keys.
   */
  strict?: boolean;
}

export function defineConfig(config: BridgeConfig): BridgeConfig {
  return config;
}
