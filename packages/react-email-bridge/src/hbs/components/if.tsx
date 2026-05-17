import type { ReactNode } from 'react';

export interface IfProps {
  /** `{{#if path}}` — truthiness check. */
  path?: string;
  /** `{{#eq a b}}` shortcut. Pass both sides as HBS string fragments. */
  eq?: [string, string];
  /**
   * `{{#compare a 'op' b}}` — general comparator (handlebars-helpers).
   * Operators: `==`, `!=`, `>`, `<`, `>=`, `<=`, `&&`, `||`, etc.
   * Pass both sides as HBS string fragments; remember to quote literals.
   *
   *   <If compare={['payment.type', '==', '"creditCard"']}>...
   *   <If compare={['(math @index "%" 2)', '==', '0']}>...
   */
  compare?: [string, string, string];
  children: ReactNode;
}

export function If({ path, eq, compare, children }: IfProps) {
  if (compare) {
    return (
      <>
        {`{{#compare ${compare[0]} '${compare[1]}' ${compare[2]}}}`}
        {children}
        {`{{/compare}}`}
      </>
    );
  }
  if (eq) {
    return (
      <>
        {`{{#eq ${eq[0]} ${eq[1]}}}`}
        {children}
        {`{{/eq}}`}
      </>
    );
  }
  if (path) {
    return (
      <>
        {`{{#if ${path}}}`}
        {children}
        {`{{/if}}`}
      </>
    );
  }
  throw new Error('<If> requires one of: path, eq, compare');
}
