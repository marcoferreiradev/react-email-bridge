import { describe, it, expect } from 'vitest';
import { render, hbs } from '../src/core/index';
import { Each, If, Else } from '../src/hbs/components/index';
import { previewWithFixture } from '../src/hbs/preview-runtime';

/**
 * End-to-end pipeline test: TSX → render() → marker-literal HTML → Handlebars
 * preview → interpolated HTML. Mirrors what production uses.
 */
describe('end-to-end pipeline', () => {
  function Template() {
    return (
      <div style={{ color: hbs('theme.color') }}>
        Hi {`{{name}}`}!
        <ul>
          <Each path="items">
            <li>
              {`{{label}}`}: {`{{formatCurrency price}}`}
            </li>
          </Each>
        </ul>
        <If path="hasInvoice">
          <p>Invoice: {`{{invoiceUrl}}`}</p>
          <Else />
          <p>Pending</p>
        </If>
      </div>
    );
  }

  it('export preserves all markers', async () => {
    const html = await render(<Template />);
    expect(html).toContain('color:{{theme.color}}');
    expect(html).toContain('{{name}}');
    expect(html).toContain('{{#each items}}');
    expect(html).toContain('{{label}}');
    expect(html).toContain('{{formatCurrency price}}');
    expect(html).toContain('{{/each}}');
    expect(html).toContain('{{#if hasInvoice}}');
    expect(html).toContain('{{else}}');
    expect(html).toContain('{{/if}}');
    expect(html).not.toMatch(/HBSSENTINEL/);
  });

  it('preview interpolates against fixture', async () => {
    const html = await render(<Template />);
    const result = previewWithFixture(html, {
      theme: { color: '#f00' },
      name: 'Marco',
      items: [
        { label: 'A', price: 100 },
        { label: 'B', price: 250 },
      ],
      hasInvoice: true,
      invoiceUrl: 'https://example.com/inv',
    });
    expect(result.error).toBeUndefined();
    expect(result.html).toContain('color:#f00');
    // React's renderToStaticMarkup inserts <!-- --> between adjacent fragments.
    // We assert on individual text fragments rather than concatenated strings.
    expect(result.html).toMatch(/Hi <!-- -->Marco/);
    expect(result.html).toMatch(/>A<!-- -->:/); // formatCurrency runs
    expect(result.html).toContain('Invoice:');
    expect(result.html).toContain('https://example.com/inv');
    expect(result.html).not.toContain('Pending'); // else branch suppressed
  });

  it('preview shows else branch when condition false', async () => {
    const html = await render(<Template />);
    if (process.env.DEBUG_E2E) console.log('HTML:', html);
    const result = previewWithFixture(html, {
      name: 'Marco',
      items: [],
      hasInvoice: false,
    });
    if (process.env.DEBUG_E2E) console.log('OUT:', result.html, 'ERR:', result.error);
    expect(result.html).toContain('Pending');
    expect(result.html).not.toContain('Invoice:');
  });
});
