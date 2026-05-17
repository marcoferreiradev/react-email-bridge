import { describe, it, expect } from 'vitest';

/**
 * Mirror tests for the isTemplateMarker utility that lives in the vendored
 * UI (`react-email-bridge-ui/src/utils/is-template-marker.ts`). Keeping a
 * copy here in the core test suite so the contract is testable without
 * spinning up the Next app.
 */
const MARKER_PATTERNS: RegExp[] = [
  /\{\{[\s\S]*?\}\}/,
  /\{%\s*[\s\S]*?\s*%\}/,
  /\*\|[A-Z0-9_:]+\|\*/,
];

function isTemplateMarker(value: string | undefined | null): boolean {
  if (!value) return false;
  return MARKER_PATTERNS.some((p) => p.test(value));
}

describe('isTemplateMarker', () => {
  describe('Handlebars markers', () => {
    it('matches simple var', () => {
      expect(isTemplateMarker('{{name}}')).toBe(true);
    });
    it('matches dotted path', () => {
      expect(isTemplateMarker('{{customer.firstName}}')).toBe(true);
    });
    it('matches block opener', () => {
      expect(isTemplateMarker('{{#each items}}')).toBe(true);
    });
    it('matches helper with args', () => {
      expect(isTemplateMarker('{{formatCurrency price}}')).toBe(true);
    });
    it('matches marker inside longer URL', () => {
      expect(
        isTemplateMarker('https://cdn.example.com/{{accountSlug}}/logo.png')
      ).toBe(true);
    });
  });

  describe('Liquid markers', () => {
    it('matches output syntax', () => {
      expect(isTemplateMarker('{{ user.name }}')).toBe(true);
    });
    it('matches block tags', () => {
      expect(isTemplateMarker('{% if logged_in %}')).toBe(true);
    });
    it('matches filter syntax', () => {
      expect(isTemplateMarker('{{ price | money }}')).toBe(true);
    });
  });

  describe('Mailchimp merge tags', () => {
    it('matches FNAME', () => {
      expect(isTemplateMarker('*|FNAME|*')).toBe(true);
    });
    it('matches IF block', () => {
      expect(isTemplateMarker('*|IF:FNAME|*')).toBe(true);
    });
  });

  describe('non-markers', () => {
    it('rejects null/undefined/empty', () => {
      expect(isTemplateMarker(null)).toBe(false);
      expect(isTemplateMarker(undefined)).toBe(false);
      expect(isTemplateMarker('')).toBe(false);
    });
    it('rejects real URLs', () => {
      expect(isTemplateMarker('https://example.com/foo')).toBe(false);
    });
    it('rejects plain text', () => {
      expect(isTemplateMarker('hello world')).toBe(false);
    });
    it('rejects unmatched braces', () => {
      expect(isTemplateMarker('{ broken')).toBe(false);
      expect(isTemplateMarker('{{ unmatched')).toBe(false);
    });
  });
});
