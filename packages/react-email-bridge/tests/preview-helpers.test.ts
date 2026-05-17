import { describe, it, expect } from 'vitest';
import Handlebars from 'handlebars';
import { vtexFakeHelpers } from '../src/hbs/preview-helpers.js';
import { buildPreviewRuntime } from '../src/hbs/preview-runtime.js';

/**
 * Direct tests of the VTEX-flavored fake helpers we ship in
 * src/hbs/preview-helpers.ts. The values match real oficina expectations
 * (cents → fractional units, etc).
 */
describe('VTEX fake helpers', () => {
  function run(template: string, ctx: Record<string, unknown> = {}) {
    const hb = buildPreviewRuntime({ strict: false });
    return hb.compile(template)(ctx);
  }

  describe('formatCurrency', () => {
    it('divides cents by 100', () => {
      expect(run('{{formatCurrency 19990}}')).toBe('199.90');
    });
    it('handles non-numeric input', () => {
      expect(run('{{formatCurrency "abc"}}')).toBe('abc');
    });
    it('handles undefined', () => {
      expect(run('{{formatCurrency v}}', {})).toBe('');
    });
  });

  describe('formatCurrencyWithoutDecimals', () => {
    it('floors to integer', () => {
      expect(run('{{formatCurrencyWithoutDecimals 19990}}')).toBe('199');
    });
  });

  describe('formatUSDCurrency', () => {
    it('prefixes with $', () => {
      expect(run('{{formatUSDCurrency 12345}}')).toBe('$123.45');
    });
  });

  describe('multiplyCurrency', () => {
    it('multiplies values', () => {
      expect(run('{{multiplyCurrency 5 10}}')).toBe('50.00');
    });
  });

  describe('formatDate', () => {
    it('formats ISO to YYYY-MM-DD', () => {
      expect(run('{{formatDate "2024-03-15T10:00:00Z"}}')).toBe('2024-03-15');
    });
    it('empty for null', () => {
      expect(run('{{formatDate v}}', { v: null })).toBe('');
    });
  });

  describe('formatDateNoTimezone', () => {
    it('converts YYYY-MM-DD to DD/MM/YYYY', () => {
      expect(run('{{formatDateNoTimezone "2024-03-15T00:00:00Z"}}')).toBe('15/03/2024');
    });
  });

  describe('addDaysToDate', () => {
    it('shifts date forward', () => {
      expect(run('{{addDaysToDate "2024-03-15" 5}}')).toBe('2024-03-20');
    });
  });

  describe('hasSubStr', () => {
    it('matches substring', () => {
      expect(run('{{#hasSubStr "hello world" "world"}}yes{{else}}no{{/hasSubStr}}')).toBe('yes');
    });
    it('negative branch', () => {
      expect(run('{{#hasSubStr "hello" "xyz"}}yes{{else}}no{{/hasSubStr}}')).toBe('no');
    });
  });

  describe('ifCond', () => {
    it.each([
      ['==', 5, 5, 'yes'],
      ['!=', 5, 6, 'yes'],
      ['>', 10, 5, 'yes'],
      ['<=', 5, 5, 'yes'],
      ['&&', 1, 1, 'yes'],
      ['||', 0, 1, 'yes'],
      ['unknown', 1, 1, 'no'],
    ])('%s with %s and %s → %s', (op, a, b, expected) => {
      expect(run(`{{#ifCond a "${op}" b}}yes{{else}}no{{/ifCond}}`, { a, b })).toBe(expected);
    });
  });

  describe('isMoreThanOneDay', () => {
    it('true for 5d', () => {
      expect(run('{{#isMoreThanOneDay "5d"}}yes{{else}}no{{/isMoreThanOneDay}}')).toBe('yes');
    });
    it('false for 1d', () => {
      expect(run('{{#isMoreThanOneDay "1d"}}yes{{else}}no{{/isMoreThanOneDay}}')).toBe('no');
    });
    it('false for non-day duration', () => {
      expect(run('{{#isMoreThanOneDay "3h"}}yes{{else}}no{{/isMoreThanOneDay}}')).toBe('no');
    });
  });

  describe('math (oficina-style operator-string)', () => {
    it('addition', () => expect(run('{{math 2 "+" 3}}')).toBe('5'));
    it('subtraction', () => expect(run('{{math 10 "-" 4}}')).toBe('6'));
    it('multiplication', () => expect(run('{{math 6 "*" 7}}')).toBe('42'));
    it('division', () => expect(run('{{math 10 "/" 2}}')).toBe('5'));
    it('modulo', () => expect(run('{{math 7 "%" 2}}')).toBe('1'));
    it('div-by-zero → 0', () => expect(run('{{math 10 "/" 0}}')).toBe('0'));
    it('unknown op → empty', () => expect(run('{{math 1 "@" 2}}')).toBe(''));
  });

  describe('group', () => {
    it('groups by property', () => {
      const items = [
        { cat: 'a', n: 1 },
        { cat: 'b', n: 2 },
        { cat: 'a', n: 3 },
      ];
      expect(
        run(
          '{{#group items by="cat"}}[{{index}}.{{value}}:{{#each items}}{{n}},{{/each}}]{{/group}}',
          { items }
        )
      ).toBe('[0.a:1,3,][1.b:2,]');
    });

    it('returns inverse when not an array', () => {
      expect(
        run('{{#group items by="x"}}yes{{else}}no{{/group}}', {
          items: 'not array',
        })
      ).toBe('no');
    });
  });

  describe('eval', () => {
    it('interpolates hash params and evaluates', () => {
      expect(run(`{{eval "'${'$'}{name}'.split(' ')[0]" name="Marco Silva"}}`)).toBe('Marco');
    });

    it('errors render inline', () => {
      const out = run(`{{eval "throw new Error('boom')" }}`);
      expect(out).toContain('[eval error');
    });
  });

  describe('richShippingData', () => {
    it('augments items + yields context', () => {
      const fixture = {
        ctx: {
          logisticsInfo: [
            {
              selectedSla: 'SLA1',
              slas: [
                {
                  id: 'SLA1',
                  shippingEstimate: '5bd',
                  shippingEstimateDate: '2024-04-01',
                },
              ],
            },
          ],
        },
      };
      const out = run(
        `{{#richShippingData ctx}}{{#each logisticsInfo}}d={{shippingEstimateDays}}t={{shippingEstimateDaysType}}{{/each}}{{/richShippingData}}`,
        fixture
      );
      expect(out).toBe('d=5t=bd');
    });
  });
});

describe('helperMissing — variable lookup vs unknown helper', () => {
  it('missing variable (0 args) → empty string', () => {
    const hb = buildPreviewRuntime({ strict: false });
    expect(hb.compile('before-{{missing}}-after')({})).toBe('before--after');
  });

  it('unknown helper with args → debug stub', () => {
    const hb = buildPreviewRuntime({ strict: false });
    const out = hb.compile('{{customHelper "arg1" 42}}')({});
    expect(out).toContain('customHelper');
    expect(out).toContain('arg1');
    expect(out).toContain('42');
  });
});

describe('extraHelpers override', () => {
  it('user helpers win over defaults', () => {
    const hb = buildPreviewRuntime({
      strict: false,
      extraHelpers: {
        formatCurrency: (n: unknown) => `R$ ${Number(n)}`,
      },
    });
    expect(hb.compile('{{formatCurrency 100}}')({})).toBe('R$ 100');
  });

  it('and brand-new helpers register cleanly', () => {
    const hb = buildPreviewRuntime({
      strict: false,
      extraHelpers: {
        shout: (s: unknown) => String(s).toUpperCase(),
      },
    });
    expect(hb.compile('{{shout "hello"}}')({})).toBe('HELLO');
  });
});
