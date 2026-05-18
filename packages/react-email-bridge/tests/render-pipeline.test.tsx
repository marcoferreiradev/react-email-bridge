import { describe, it, expect } from 'vitest';
import { render, hbs, unescapeMarkers, substituteSentinels } from '../src/core/index';
import { Each, If, Unless, Else, Raw } from '../src/hbs/components/index';

/**
 * Integration tests for the full `render()` pipeline (sentinels → unescape →
 * juice → unescape). Tests every contextual location where a marker can
 * appear, replicating the matrix from validation/test-pipeline.tsx but at
 * test runtime.
 */
describe('render() pipeline', () => {
  describe('marker contexts', () => {
    it('text node markers survive', async () => {
      const html = await render(<p>Hi {`{{name}}`}!</p>);
      expect(html).toContain('{{name}}');
    });

    it('string-attr markers survive', async () => {
      const html = await render(<a href={`{{url}}`}>link</a>);
      expect(html).toContain('href="{{url}}"');
    });

    it('hbs() in style becomes {{path}}', async () => {
      const html = await render(<div style={{ color: hbs('theme.color') }}>x</div>);
      expect(html).toContain('color:{{theme.color}}');
    });

    it('hbs() multiple in same style obj', async () => {
      const html = await render(
        <div style={{ color: hbs('a'), backgroundColor: hbs('b') }}>x</div>
      );
      expect(html).toContain('color:{{a}}');
      expect(html).toContain('background-color:{{b}}');
    });

    it('no sentinels leak to output', async () => {
      const html = await render(<div style={{ color: hbs('x') }}>{`{{y}}`}</div>);
      expect(html).not.toMatch(/HBSSENTINEL/);
    });
  });

  describe('quoted args in block markers (Plano B)', () => {
    it('quotes in #eq survive unescape', async () => {
      const html = await render(
        <If eq={['payment.type', '"creditCard"']}>
          <p>x</p>
        </If>
      );
      expect(html).toContain('{{#eq payment.type "creditCard"}}');
      expect(html).not.toContain('&quot;');
    });

    it('compare operator > survives', async () => {
      const html = await render(
        <If compare={['n', '>', '1']}>
          <p>x</p>
        </If>
      );
      expect(html).toContain(`{{#compare n '>' 1}}`);
      expect(html).not.toContain('&gt;');
      expect(html).not.toContain('&#x27;');
    });
  });

  describe('block balance', () => {
    it('#each open/close count matches in nested loops', async () => {
      const html = await render(
        <Each path="orders">
          <Each path="items">
            <p>{`{{name}}`}</p>
          </Each>
        </Each>
      );
      const opens = (html.match(/\{\{#each /g) || []).length;
      const closes = (html.match(/\{\{\/each\}\}/g) || []).length;
      expect(opens).toBe(closes);
      expect(opens).toBe(2);
    });

    it('#each with parent path (..) survives end-to-end', async () => {
      // VTEX pattern: inside a nested loop, reach back to the outer scope's
      // sibling collection — {{#each ../../../../items}} appears in
      // refs/vtex-email-framework/source/templates/order-invoiced.
      const html = await render(
        <Each path="orders">
          <Each path="../items">
            <p>{`{{name}}`}</p>
          </Each>
        </Each>
      );
      expect(html).toContain('{{#each ../items}}');
    });

    it('if/else/closing tags balanced', async () => {
      const html = await render(
        <If path="x">
          <p>yes</p>
          <Else />
          <p>no</p>
        </If>
      );
      expect(html).toContain('{{#if x}}');
      expect(html).toContain('{{else}}');
      expect(html).toContain('{{/if}}');
    });

    it('Unless renders correctly', async () => {
      const html = await render(
        <Unless path="cancelled">
          <p>active</p>
        </Unless>
      );
      expect(html).toContain('{{#unless cancelled}}');
      expect(html).toContain('{{/unless}}');
    });
  });

  describe('CSS inlining', () => {
    it('juice runs (style attrs present)', async () => {
      const html = await render(<div style={{ color: 'red', padding: '8px' }}>x</div>);
      expect(html).toMatch(/style="[^"]*color:\s*red/);
    });

    it('inlineCss: false skips juice', async () => {
      const html = await render(<div style={{ color: hbs('c') }}>x</div>, { inlineCss: false });
      // markers still substituted, just no juice processing
      expect(html).toContain('{{c}}');
    });
  });
});

describe('substituteSentinels — direct', () => {
  it('preserves unrelated content', () => {
    expect(substituteSentinels('<p>hello</p>')).toBe('<p>hello</p>');
  });

  it('handles sentinel at end of string', () => {
    const id = hbs('end');
    expect(substituteSentinels(`prefix-${id}`)).toBe('prefix-{{end}}');
  });

  it('only replaces complete sentinel ids (length-bound regex)', () => {
    // A 13-char "sentinel-like" string should NOT be replaced
    const fake = 'HBSSENTINELabcdefghijklm'; // 13 chars after prefix
    expect(substituteSentinels(fake)).toBe(fake);
  });
});

describe('unescapeMarkers — direct', () => {
  it('handles markers split across newlines', () => {
    const input = '{{#if foo\n}}';
    // lazy regex matches across content
    expect(unescapeMarkers(input)).toBe('{{#if foo\n}}');
  });

  it('multiple entity types in one marker', () => {
    expect(unescapeMarkers('{{#cmp a &#x27;&gt;&#x27; &quot;b&quot;}}')).toBe(`{{#cmp a '>' "b"}}`);
  });
});

describe('Raw escape hatch', () => {
  it('emits children verbatim', async () => {
    const html = await render(<Raw>{`{{#group items by="cat"}}`}</Raw>);
    expect(html).toContain('{{#group items by="cat"}}');
  });
});
