import { Font } from 'react-email';

/**
 * Loads Inter + Geist from Google Fonts. Mirrors Halo's `<TechFonts />`
 * pattern (refs/react-email/apps/demo/emails/05-Studio/tech-fonts.tsx).
 *
 * `Inter` is the default sans (used by `font-sans` class) and `Geist`
 * is the display font (used by `font-geist` class) for big headlines.
 *
 * `react-email`'s `<Font>` component renders the right `<link>` + style
 * tags inside `<Head>`. Falls back to Arial / system sans if Google
 * Fonts CDN isn't reachable (most email clients render fallback fine).
 */
export function Fonts() {
  return (
    <>
      <Font
        fontFamily="Inter"
        fallbackFontFamily="Arial"
        webFont={{
          url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
          format: 'woff2',
        }}
        fontWeight={400}
        fontStyle="normal"
      />
      <Font
        fontFamily="Geist"
        fallbackFontFamily="Arial"
        webFont={{
          url: 'https://fonts.googleapis.com/css2?family=Geist:wght@500;600;700&display=swap',
          format: 'woff2',
        }}
        fontWeight={500}
        fontStyle="normal"
      />
    </>
  );
}
