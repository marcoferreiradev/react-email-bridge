import { describe, it, expect } from 'vitest';
import { previewWithFixture } from '../src/hbs/preview-runtime';

describe('preview runtime', () => {
  it('interpolates variables', () => {
    const result = previewWithFixture('<p>Olá {{name}}</p>', { name: 'Marco' });
    expect(result.error).toBeUndefined();
    expect(result.html).toBe('<p>Olá Marco</p>');
  });

  it('runs handlebars-helpers #compare', () => {
    const result = previewWithFixture(
      `{{#compare n '>' 0}}positive{{else}}non-positive{{/compare}}`,
      { n: 5 }
    );
    expect(result.html).toBe('positive');
  });

  it('runs custom math helper with operator string', () => {
    const result = previewWithFixture(`{{math 7 "%" 2}}`, {});
    expect(result.html).toBe('1');
  });

  it('runs custom math helper as block ({{#math index "+" 1}}{{/math}})', () => {
    const result = previewWithFixture(`{{#math 5 "+" 3}}{{/math}}`, {});
    // Block form invokes the helper; with no body it returns the value via fn.
    // Some Handlebars expectations: block-form returns the body. Math is
    // typically expression-form; oficina uses it as block. We just assert it
    // doesn't throw.
    expect(result.error).toBeUndefined();
  });

  it('runs VTEX fake formatCurrency', () => {
    const result = previewWithFixture('R$ {{formatCurrency price}}', {
      price: 19990,
    });
    expect(result.html).toBe('R$ 199.90');
  });

  it('runs custom group helper with hash params', () => {
    const result = previewWithFixture(
      `{{#group items by="cat"}}{{value}}:{{#each items}}{{n}},{{/each}}|{{/group}}`,
      {
        items: [
          { cat: 'a', n: 1 },
          { cat: 'b', n: 2 },
          { cat: 'a', n: 3 },
        ],
      }
    );
    expect(result.html).toBe('a:1,3,|b:2,|');
  });

  it('unknown helper does not crash in non-strict', () => {
    // helperMissing for inline (non-block) helpers is tricky in Handlebars —
    // it only fires when args are provided AND the name isn't a context key.
    // In non-strict, the worst case is empty output (no crash).
    const result = previewWithFixture('before-{{customHelper "arg1" 42}}-after', {});
    expect(result.error).toBeUndefined();
    expect(result.html).toContain('before-');
    expect(result.html).toContain('-after');
  });

  it('strict mode surfaces missing variable as error', () => {
    const result = previewWithFixture('{{missing}}', {}, { strict: true });
    expect(result.error).toBeDefined();
    expect(result.error!.message).toMatch(/missing/);
  });

  it('extra helpers from config override defaults', () => {
    const result = previewWithFixture(
      '{{formatCurrency 100}}',
      {},
      {
        extraHelpers: {
          formatCurrency: (n: unknown) => `R$ ${Number(n).toFixed(2)} (custom)`,
        },
      }
    );
    expect(result.html).toBe('R$ 100.00 (custom)');
  });
});
