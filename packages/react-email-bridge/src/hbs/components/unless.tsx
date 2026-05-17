import type { ReactNode } from 'react';

export interface UnlessProps {
  path: string;
  children: ReactNode;
}

/**
 * `{{#unless path}}...{{/unless}}` — inverse of `<If>`.
 */
export function Unless({ path, children }: UnlessProps) {
  return (
    <>
      {`{{#unless ${path}}}`}
      {children}
      {`{{/unless}}`}
    </>
  );
}
