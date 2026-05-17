import { describe, it, expect } from 'vitest';
import {
  hbs,
  substituteSentinels,
  unescapeMarkers,
} from '../src/core/hbs-sentinels.js';

describe('hbs() sentinel + substitution', () => {
  it('produces a CSS-safe identifier (no special chars)', () => {
    const id = hbs('client.brandColor');
    expect(id).toMatch(/^HBSSENTINEL[A-Za-z0-9]{12}$/);
  });

  it('substituteSentinels replaces sentinels with {{path}}', () => {
    const id = hbs('client.brandColor');
    const html = `<div style="color:${id}">x</div>`;
    expect(substituteSentinels(html)).toBe(
      '<div style="color:{{client.brandColor}}">x</div>'
    );
  });

  it('substituteSentinels handles multiple sentinels', () => {
    const a = hbs('a');
    const b = hbs('b');
    expect(substituteSentinels(`${a}-${b}`)).toBe('{{a}}-{{b}}');
  });
});

describe('unescapeMarkers', () => {
  it('decodes &quot; inside markers', () => {
    expect(unescapeMarkers('{{#eq foo &quot;bar&quot;}}')).toBe(
      '{{#eq foo "bar"}}'
    );
  });

  it('decodes &#x27; inside markers', () => {
    expect(unescapeMarkers("{{#compare a &#x27;==&#x27; b}}")).toBe(
      "{{#compare a '==' b}}"
    );
  });

  it('decodes &gt; and &lt; inside markers', () => {
    expect(
      unescapeMarkers("{{#compare a &#x27;&gt;&#x27; b}}")
    ).toBe("{{#compare a '>' b}}");
  });

  it('does NOT decode outside markers', () => {
    expect(unescapeMarkers('<p>a &quot;b&quot; c</p>')).toBe(
      '<p>a &quot;b&quot; c</p>'
    );
  });

  it('handles adjacent markers without consuming between them', () => {
    expect(unescapeMarkers('{{a}} text {{b}}')).toBe('{{a}} text {{b}}');
  });
});
