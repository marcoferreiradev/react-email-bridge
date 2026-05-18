import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Each, If, Unless, Else, Raw } from '../src/hbs/components/index';

/**
 * The sugar components are pure — they just emit HBS marker strings via JSX
 * text nodes. Tests verify the exact output is well-formed HBS.
 */
describe('hbs sugar components', () => {
  it('Each emits {{#each path}}...{{/each}}', () => {
    const html = renderToStaticMarkup(
      <Each path="items">
        <span>x</span>
      </Each>
    );
    expect(html).toContain('{{#each items}}');
    expect(html).toContain('{{/each}}');
  });

  it('Each with alias emits {{#each path as |alias|}}', () => {
    const html = renderToStaticMarkup(
      <Each path="items" as="item">
        <span>x</span>
      </Each>
    );
    expect(html).toContain('{{#each items as |item|}}');
  });

  it('If with path emits {{#if path}}...{{/if}}', () => {
    const html = renderToStaticMarkup(
      <If path="invoiceUrl">
        <span>x</span>
      </If>
    );
    expect(html).toContain('{{#if invoiceUrl}}');
    expect(html).toContain('{{/if}}');
  });

  it('If with eq emits {{#eq a b}}...{{/eq}}', () => {
    const html = renderToStaticMarkup(
      <If eq={['payment.type', '"creditCard"']}>
        <span>x</span>
      </If>
    );
    // Static-markup escapes quotes in text nodes. We assert the structure
    // exists; downstream unescapeMarkers fixes the entities.
    expect(html).toMatch(/\{\{#eq payment\.type [^}]+creditCard[^}]+\}\}/);
    expect(html).toContain('{{/eq}}');
  });

  it('If with compare emits {{#compare a "op" b}}', () => {
    const html = renderToStaticMarkup(
      <If compare={['items.length', '>', '1']}>
        <span>x</span>
      </If>
    );
    expect(html).toMatch(/\{\{#compare items\.length /);
    expect(html).toContain('{{/compare}}');
  });

  it('Unless emits {{#unless path}}...{{/unless}}', () => {
    const html = renderToStaticMarkup(
      <Unless path="cancelled">
        <span>x</span>
      </Unless>
    );
    expect(html).toContain('{{#unless cancelled}}');
    expect(html).toContain('{{/unless}}');
  });

  it('Else emits {{else}}', () => {
    const html = renderToStaticMarkup(<Else />);
    expect(html).toContain('{{else}}');
  });

  it('Raw passes children through as text', () => {
    const html = renderToStaticMarkup(<Raw>{`{{#group items by="x"}}`}</Raw>);
    expect(html).toMatch(/\{\{#group items by/);
  });

  it('If with no props throws', () => {
    expect(() => renderToStaticMarkup(<If>x</If>)).toThrow(/requires one of: path, eq, compare/);
  });
});
