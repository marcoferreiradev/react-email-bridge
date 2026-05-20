import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

export type TemplateSource =
  | { kind: 'local'; path: string }
  | { kind: 'giget'; specifier: string; fallbackSpecifier: string };

const GITHUB_REPO = 'marcoferreiradev/react-email-bridge';

function gigetSpecifier(templateName: string, ref: string): string {
  return `github:${GITHUB_REPO}/examples/${templateName}#${ref}`;
}

function findWorkspaceExamples(templateName: string): string | null {
  let dir = path.dirname(url.fileURLToPath(import.meta.url));
  const root = path.parse(dir).root;
  while (dir !== root) {
    const workspaceMarker = path.join(dir, 'pnpm-workspace.yaml');
    const candidate = path.join(dir, 'examples', templateName);
    if (fs.existsSync(workspaceMarker) && fs.existsSync(candidate)) {
      return candidate;
    }
    dir = path.dirname(dir);
  }
  return null;
}

export function resolveTemplateSource(templateName: string, cliVersion: string): TemplateSource {
  const localPath = findWorkspaceExamples(templateName);
  if (localPath) {
    return { kind: 'local', path: localPath };
  }
  return {
    kind: 'giget',
    specifier: gigetSpecifier(templateName, `react-email-bridge@${cliVersion}`),
    fallbackSpecifier: gigetSpecifier(templateName, 'main'),
  };
}
