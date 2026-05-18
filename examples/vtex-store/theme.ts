/**
 * Halo-inspired design tokens for the vtex-store templates.
 *
 * One source of truth: every template imports from here and never
 * hard-codes colors, spacing, or typography. To rebrand the whole
 * starter, edit this file.
 *
 * Inspired by react-email's Studio/Halo aesthetic
 * (https://demo.react.email/preview/05-Studio/) — clean minimal layout,
 * generous whitespace, sharp typography, neutral palette with subtle
 * accents. Adapted to the 13 VTEX transactional templates.
 *
 * Outlook desktop note: `border-radius` degrades to square corners
 * gracefully in older Outlook for Windows (no VML fallback). Acceptable
 * for ecommerce targets (mostly webmail / mobile clients).
 */

// ─── Color palette ────────────────────────────────────────────────────────

export const color = {
  // Backgrounds
  bg: '#ffffff', // primary surface
  bgMuted: '#f7f7f5', // page background (outside the email card)
  bgSubtle: '#fafafa', // soft card background

  // Text
  text: '#0a0a0a', // primary text — near black for contrast
  textMuted: '#737373', // secondary text, captions
  textSubtle: '#a3a3a3', // tertiary text, timestamps

  // Borders
  border: '#e5e5e5', // standard divider / card border
  borderStrong: '#d4d4d4', // emphasized border

  // Accents
  accent: '#0a0a0a', // primary CTA / brand (Halo uses near-black)
  accentText: '#ffffff', // text on accent surfaces

  // Status
  warning: '#fef3c7', // soft yellow for alerts (cant-cancel, etc.)
  warningText: '#78350f',
  success: '#dcfce7',
  successText: '#14532d',
} as const;

// ─── Typography ───────────────────────────────────────────────────────────

export const font = {
  // Stack: Figtree first (loaded via HtmlHead), then system fallbacks.
  family:
    "Figtree, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  // Mono for orderIds / tracking codes if needed.
  mono: "'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
} as const;

export const heading = {
  h1: {
    fontSize: '32px',
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    margin: '0 0 8px',
  },
  h2: {
    fontSize: '22px',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
    margin: '0 0 8px',
  },
  h3: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: 1.3,
    margin: '0 0 8px',
  },
  h4: {
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: 1.3,
    margin: '0 0 4px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: color.textMuted,
  },
} as const;

export const text = {
  body: {
    fontSize: '15px',
    lineHeight: 1.6,
    color: color.text,
    margin: '0 0 12px',
  },
  bodyMuted: {
    fontSize: '15px',
    lineHeight: 1.6,
    color: color.textMuted,
    margin: '0 0 12px',
  },
  caption: {
    fontSize: '13px',
    lineHeight: 1.5,
    color: color.textMuted,
    margin: '0',
  },
  small: {
    fontSize: '13px',
    lineHeight: 1.5,
    color: color.text,
    margin: '0',
  },
} as const;

// ─── Spacing scale ────────────────────────────────────────────────────────

export const space = {
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
  '2xl': '64px',
} as const;

// ─── Layout primitives ────────────────────────────────────────────────────

export const layout = {
  bodyStyle: {
    backgroundColor: color.bgMuted,
    fontFamily: font.family,
    color: color.text,
    margin: 0,
    padding: '32px 0',
  },
  containerStyle: {
    backgroundColor: color.bg,
    maxWidth: '600px',
    margin: '0 auto',
    borderRadius: '8px',
    overflow: 'hidden' as const,
  },
  /** Standard internal padding for a section block. */
  sectionPad: { padding: `${space.lg} ${space.md}` } as const,
  /** Tighter padding (used between adjacent sections). */
  sectionPadTight: { padding: `${space.md} ${space.md}` } as const,
  /** A horizontal divider line between sections. */
  divider: {
    borderTop: `1px solid ${color.border}`,
    margin: 0,
  } as const,
} as const;

// ─── Card (used for shipping cards, totals box, etc.) ─────────────────────

export const card = {
  base: {
    backgroundColor: color.bgSubtle,
    border: `1px solid ${color.border}`,
    borderRadius: '8px',
    padding: space.md,
    margin: `${space.sm} 0`,
  } as const,
  subtle: {
    backgroundColor: color.bgSubtle,
    borderRadius: '6px',
    padding: space.sm,
    margin: `${space.xs} 0`,
  } as const,
} as const;

// ─── Buttons / CTAs ───────────────────────────────────────────────────────

export const button = {
  primary: {
    display: 'inline-block' as const,
    backgroundColor: color.accent,
    color: color.accentText,
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: 1,
    padding: '14px 24px',
    borderRadius: '6px',
    textDecoration: 'none' as const,
  },
  secondary: {
    display: 'inline-block' as const,
    backgroundColor: 'transparent',
    color: color.text,
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: 1,
    padding: '13px 23px',
    border: `1px solid ${color.borderStrong}`,
    borderRadius: '6px',
    textDecoration: 'none' as const,
  },
  textLink: {
    color: color.text,
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
  } as const,
} as const;

// ─── Status pills (Aguardando pagamento, etc.) ────────────────────────────

export const pill = {
  warning: {
    display: 'inline-block' as const,
    backgroundColor: color.warning,
    color: color.warningText,
    fontSize: '12px',
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: '999px',
    lineHeight: 1.4,
  },
  success: {
    display: 'inline-block' as const,
    backgroundColor: color.success,
    color: color.successText,
    fontSize: '12px',
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: '999px',
    lineHeight: 1.4,
  },
} as const;

// ─── Image placeholders ───────────────────────────────────────────────────

/**
 * Centralized placeholder URLs. Each user of the starter is expected to
 * swap these for their own CDN URLs.
 */
export const placeholder = {
  logo: 'https://placehold.co/180x60/f4f4f4/737373?text=YOUR+LOGO',
  /** Random-but-stable product photo from picsum.photos. Seed by item id. */
  productImage: (seed: string, w = 200, h = 200) => `https://picsum.photos/seed/${seed}/${w}/${h}`,
  /** Hero/banner photo from picsum.photos (for marketing templates). */
  hero: (seed: string, w = 600, h = 300) => `https://picsum.photos/seed/${seed}/${w}/${h}`,
} as const;
