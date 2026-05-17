/**
 * `{{else}}` — valid inside `<If>`, `<Unless>`, and `<Each>` (HBS emits the
 * "empty list" branch when the iterable is empty).
 *
 *   <If path="invoiceUrl">
 *     <Text>Link: ...</Text>
 *     <Else />
 *     <Text>Em breve.</Text>
 *   </If>
 */
export function Else() {
  return <>{`{{else}}`}</>;
}
