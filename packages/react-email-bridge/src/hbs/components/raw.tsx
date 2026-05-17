import type { ReactNode } from 'react';

export interface RawProps {
  children: ReactNode;
}

/**
 * Escape hatch for arbitrary HBS that doesn't have a sugar component:
 * `{{#group}}`, `{{#with}}`, `{{#math}}`, custom helpers, etc.
 *
 * Children are emitted as text nodes verbatim. Use grep-friendly markers
 * (`<Raw>`) so you can find every escape hatch in your codebase.
 *
 *   <Raw>{`{{#group items by="category"}}`}</Raw>
 *     <Each path="items">...</Each>
 *   <Raw>{`{{/group}}`}</Raw>
 */
export function Raw({ children }: RawProps) {
  return <>{children}</>;
}
