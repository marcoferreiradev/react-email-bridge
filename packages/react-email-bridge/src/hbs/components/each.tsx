import type { ReactNode } from 'react';

export interface EachProps {
  /** HBS path to iterate, e.g. `"items"` or `"shippingData.logisticsInfo"`. */
  path: string;
  /** Optional alias, emits `{{#each path as |alias|}}`. */
  as?: string;
  children: ReactNode;
}

/**
 * `{{#each path}}...{{/each}}` block. Inside, bare variables reference the
 * current item: `{{productName}}` (not `{{items.0.productName}}`). Use `../` to
 * reach the parent context: `{{../accountName}}`.
 *
 *   <Each path="items">
 *     <Row>
 *       <Text>{`{{productName}}`}</Text>
 *     </Row>
 *   </Each>
 */
export function Each({ path, as, children }: EachProps) {
  const open = as ? `{{#each ${path} as |${as}|}}` : `{{#each ${path}}}`;
  return (
    <>
      {open}
      {children}
      {`{{/each}}`}
    </>
  );
}
