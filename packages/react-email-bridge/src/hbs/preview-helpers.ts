import type Handlebars from 'handlebars';

/**
 * Neutral fake implementations of the VTEX-specific helpers (not in
 * `handlebars-helpers`). They produce plausible output without imposing a
 * locale — users override via config file for visual fidelity.
 *
 * `handlebars-helpers` already covers `#compare`, `math`, `#gt`/`#lt`,
 * `#contains`, `#group`, etc. — register those separately via the preview
 * runtime.
 */
export const vtexFakeHelpers: Record<string, Handlebars.HelperDelegate> = {
  formatCurrency: (n: unknown) => {
    if (typeof n !== 'number') return String(n ?? '');
    // Oficina's real implementation divides by 100 (cents → currency units).
    return (n / 100).toFixed(2);
  },
  formatCurrencyWithoutDecimals: (n: unknown) => {
    if (typeof n !== 'number') return String(n ?? '');
    return Math.floor(n / 100).toString();
  },
  formatUSDCurrency: (n: unknown) => {
    if (typeof n !== 'number') return String(n ?? '');
    return `$${(n / 100).toFixed(2)}`;
  },
  formatPENCurrency: (n: unknown) => {
    if (typeof n !== 'number') return String(n ?? '');
    return (n / 100).toFixed(2);
  },
  multiplyCurrency: (a: unknown, b: unknown) => (Number(a) * Number(b)).toFixed(2),

  formatDate: (d: unknown) => (d ? new Date(d as string).toISOString().slice(0, 10) : ''),
  formatTime: (d: unknown) => (d ? new Date(d as string).toISOString().slice(11, 16) : ''),
  formatDateTime: (d: unknown) =>
    d ? new Date(d as string).toISOString().replace('T', ' ').slice(0, 19) : '',
  formatUSDate: (d: unknown) => (d ? new Date(d as string).toLocaleDateString('en-US') : ''),
  formatUSDateTime: (d: unknown) => (d ? new Date(d as string).toLocaleString('en-US') : ''),
  formatDateUtc: (d: unknown) => (d ? new Date(d as string).toUTCString() : ''),
  formatDateNoTimezone: (d: unknown) => {
    if (!d) return '';
    const [y, m, dd] = String(d).split('T')[0]!.split('-');
    return `${dd}/${m}/${y}`;
  },
  addDaysToDate: (d: unknown, days: unknown) => {
    if (!d) return '';
    const date = new Date(d as string);
    date.setDate(date.getDate() + Number(days));
    return date.toISOString().slice(0, 10);
  },
  formatNumber: (value: unknown, locale: unknown, decimals: unknown) => {
    const num = isNaN(value as number) ? 0 : Number(value);
    try {
      return num.toLocaleString(String(locale ?? 'en-US'), {
        minimumFractionDigits: Number(decimals ?? 2),
      });
    } catch {
      return num.toFixed(Number(decimals ?? 2));
    }
  },

  hasSubStr(value: unknown, search: unknown, options: Handlebars.HelperOptions) {
    if (value != null && String(value).indexOf(String(search)) !== -1) {
      return options.fn(this);
    }
    return options.inverse(this);
  },
  ifCond(v1: unknown, operator: unknown, v2: unknown, options: Handlebars.HelperOptions) {
    switch (operator) {
      case '==':
        // biome-ignore lint/suspicious/noDoubleEquals: implements == operator for templates
        return v1 == v2 ? options.fn(this) : options.inverse(this);
      case '===':
        return v1 === v2 ? options.fn(this) : options.inverse(this);
      case '!=':
        // biome-ignore lint/suspicious/noDoubleEquals: implements != operator for templates
        return v1 != v2 ? options.fn(this) : options.inverse(this);
      case '<':
        return (v1 as number) < (v2 as number) ? options.fn(this) : options.inverse(this);
      case '<=':
        return (v1 as number) <= (v2 as number) ? options.fn(this) : options.inverse(this);
      case '>':
        return (v1 as number) > (v2 as number) ? options.fn(this) : options.inverse(this);
      case '>=':
        return (v1 as number) >= (v2 as number) ? options.fn(this) : options.inverse(this);
      case '&&':
        return v1 && v2 ? options.fn(this) : options.inverse(this);
      case '||':
        return v1 || v2 ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  },
  isMoreThanOneDay(d: unknown, options: Handlebars.HelperOptions) {
    const m = /^(\d)+(?=d|bd)/g.exec(String(d));
    if (!m) return options.inverse(this);
    return Number(m[0]) > 1 ? options.fn(this) : options.inverse(this);
  },

  /**
   * Oficina-style `math` helper. NOT in handlebars-helpers (which exposes
   * `add`, `subtract`, etc as individual helpers). Real templates use
   * `(math @index "%" 2)` so we polyfill the operator-string signature.
   */
  math(lvalue: unknown, operator: unknown, rvalue: unknown) {
    const a = parseFloat(String(lvalue));
    const b = parseFloat(String(rvalue));
    switch (String(operator)) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        return b === 0 ? 0 : a / b;
      case '%':
        return a % b;
      default:
        return '';
    }
  },

  /**
   * Oficina-style `group` block helper. Groups a list by a property and
   * yields each group's items. Block form:
   *   {{#group items by="category"}}
   *     {{value}}: {{#each items}}{{name}}{{/each}}
   *   {{/group}}
   */
  group(list: unknown, options: Handlebars.HelperOptions & { hash: { by?: string } }) {
    if (!Array.isArray(list) || !options.hash.by) {
      return options.inverse?.(this) ?? '';
    }
    const prop = options.hash.by;
    const groups: Record<string, { index: number; value: string; items: unknown[] }> = {};
    const order: string[] = [];
    for (const item of list as Record<string, unknown>[]) {
      const key = String(item[prop]);
      if (!groups[key]) {
        groups[key] = { index: order.length, value: key, items: [] };
        order.push(key);
      }
      groups[key].items.push(item);
    }
    return order.map((k) => options.fn(groups[k])).join('');
  },

  /**
   * Oficina-style `eval` helper. Evaluates an expression string with hash
   * params interpolated as `${name}`. **DANGEROUS** in real Node — but in our
   * preview sandbox it's evaluated safely via Function. Used by oficina
   * templates for simple string ops.
   */
  eval(expr: unknown, options: Handlebars.HelperOptions) {
    try {
      let compiled = String(expr);
      for (const [k, v] of Object.entries(options.hash)) {
        compiled = compiled.replaceAll(`\${${k}}`, String(v));
      }
      // eslint-disable-next-line no-new-func
      return new Function(`return (${compiled})`)();
    } catch (e) {
      return `[eval error: ${(e as Error).message}]`;
    }
  },

  /**
   * Oficina-style `richShippingData` block helper. Decorates each item with
   * derived shipping fields, then yields the modified context.
   */
  richShippingData(context: unknown, options: Handlebars.HelperOptions) {
    if (!context || typeof context !== 'object') return options.fn(context);
    const ctx = context as { logisticsInfo?: unknown[] };
    const items = ctx.logisticsInfo;
    if (!Array.isArray(items)) return options.fn(context);
    for (const item of items as Record<string, unknown>[]) {
      const slas = (item.slas as Record<string, unknown>[]) ?? [];
      for (const sla of slas) {
        if (item.selectedSla === sla.id) {
          const d = String(sla.shippingEstimate ?? '');
          const m = /^(\d+)(m|h|bd|d)$/.exec(d);
          item.shippingEstimateDays = m ? Number(m[1]) : 0;
          item.shippingEstimateDaysType = m ? m[2] : null;
          item.shippingEstimate = sla.shippingEstimate;
          item.shippingEstimateDate = sla.shippingEstimateDate;
        }
      }
    }
    return options.fn(context);
  },
};
