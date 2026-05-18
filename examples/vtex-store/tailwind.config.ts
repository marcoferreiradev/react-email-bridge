/**
 * Tailwind config for the vtex-store starter — Halo-inspired.
 *
 * Mirrors the structure of refs/react-email/apps/demo/emails/05-Studio/theme.ts
 * (Resend's Halo template):
 *   - Semantic color tokens (`bg`, `bg-2`, `fg`, `fg-2`, …)
 *   - Numeric font-size scale (`font-14`, `font-22`, …) registered as
 *     utilities via a custom plugin
 *   - `mobile:` variant for `@media (max-width: 600px)`
 *
 * Used by every email via `<Tailwind config={vtexStoreTailwindConfig}>`.
 * Edit this one file to rebrand the whole starter — every template
 * inherits the change.
 */

import type { TailwindConfig } from 'react-email';
import plugin from 'tailwindcss/plugin';

const colors = {
  // Backgrounds — page outer + email inner surfaces
  bg: '#DCE1E4',
  'bg-2': '#FFFFFF',
  'bg-3': '#F6F6F6',
  'bg-4': '#F0F0F0',

  // Foreground (text) — strong to subtle
  fg: '#1A1A1A',
  'fg-2': '#5B5B5B',
  'fg-3': '#A2A9AA',

  // Lines / borders
  stroke: '#E5E5E5',
  'button-border': '#E8E9E9',

  // Status surfaces (VTEX-specific addition vs Halo) — soft pills
  // for "Aguardando pagamento", "Mais de um pacote", "Não foi possível
  // cancelar", etc.
  'status-warning-bg': '#FEF3C7',
  'status-warning-fg': '#78350F',
  'status-success-bg': '#DCFCE7',
  'status-success-fg': '#14532D',
} as const;

/**
 * Numeric font-size tokens (`font-14`, `font-22`, …) — same scale as Halo
 * with line-height + letter-spacing + weight baked in. Registered as
 * utilities via the plugin below so JSX reads `className="font-22"`.
 */
const fontScale = {
  11: { fontSize: '11px', lineHeight: '1.5', letterSpacing: '-0.11px' },
  13: { fontSize: '13px', lineHeight: '1.5', letterSpacing: '-0.13px' },
  14: {
    fontSize: '14px',
    lineHeight: '1.6',
    letterSpacing: '-0.042px',
    fontWeight: '450',
  },
  15: {
    fontSize: '15px',
    lineHeight: '1.6',
    letterSpacing: '-0.042px',
    fontWeight: '500',
  },
  16: { fontSize: '16px', lineHeight: '1.5', letterSpacing: '-0.16px' },
  18: { fontSize: '18px', lineHeight: '1.5', letterSpacing: '-0.11px' },
  20: { fontSize: '20px', lineHeight: '1.5', letterSpacing: '-0.1px' },
  22: {
    fontSize: '22px',
    lineHeight: '1.4',
    letterSpacing: '-0.176px',
    fontWeight: '500',
  },
  24: {
    fontSize: '24px',
    lineHeight: '1.4',
    letterSpacing: '-0.12px',
    fontWeight: '600',
  },
  32: {
    fontSize: '32px',
    lineHeight: '1.2',
    letterSpacing: '-0.64px',
    fontWeight: '500',
  },
  40: {
    fontSize: '40px',
    lineHeight: '1.2',
    letterSpacing: '-0.8px',
    fontWeight: '700',
  },
} as const;

export const vtexStoreTailwindConfig: TailwindConfig = {
  plugins: [
    plugin(({ addVariant, addUtilities }) => {
      addVariant('mobile', '@media (max-width: 600px)');
      const utilities: Record<string, Record<string, string>> = {};
      for (const [step, token] of Object.entries(fontScale)) {
        utilities[`.font-${step}`] = token;
      }
      addUtilities(utilities);
    }),
  ],
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
        geist: ['Geist', 'Inter', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        button: '0px 1px 1px 0px rgba(22,29,29,0.09),0px 0px 1px 0px rgba(22,29,29,0.1)',
      },
    },
  },
};
