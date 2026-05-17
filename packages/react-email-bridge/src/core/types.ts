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
 * User-facing config loaded from `react-email-bridge.config.ts` in the project root.
 */
export interface BridgeConfig {
  /** Override the default export extension. Default `.hbs`. */
  outputExtension?: string;
  /** Custom Handlebars helpers registered into the preview runtime. */
  previewHelpers?: Record<string, Handlebars.HelperDelegate>;
  /** Strict mode in Handlebars preview. Default true. */
  strict?: boolean;
}

export function defineConfig(config: BridgeConfig): BridgeConfig {
  return config;
}
