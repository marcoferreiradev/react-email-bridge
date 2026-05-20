// Multi-pane Source Area shape (ADR-0004).
// Each SourceKind is one chip in the strip and one possible pane.

export type SourceKind = 'react' | 'html' | 'plain' | 'data';

export const SOURCE_KINDS: readonly SourceKind[] = [
  'react',
  'html',
  'plain',
  'data',
] as const;

export const SOURCE_LABELS: Record<SourceKind, string> = {
  react: 'React',
  html: 'HTML',
  plain: 'Plain Text',
  data: 'Data',
};

export const SOURCE_EXTENSIONS: Record<SourceKind, string> = {
  react: 'tsx',
  html: 'html',
  plain: 'md',
  data: 'json',
};

// Maps each SourceKind to the prism-react-renderer language used for highlighting.
export const SOURCE_PRISM_LANGUAGES = {
  react: 'tsx',
  html: 'html',
  plain: 'markdown',
  data: 'json',
} as const;

export function parseSourceParam(raw: string | null | undefined): SourceKind[] {
  if (raw === null || raw === undefined) return ['react'];
  if (raw === '') return [];
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is SourceKind => SOURCE_KINDS.includes(s as SourceKind));
}

export function serializeSourceParam(kinds: SourceKind[]): string {
  return kinds.join(',');
}
