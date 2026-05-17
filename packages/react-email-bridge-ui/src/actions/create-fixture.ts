'use server';

import fs from 'node:fs';
import path from 'node:path';

/**
 * Bridge-specific: create an empty <basename>.json fixture adjacent to the
 * email template. Used by the "Create empty fixture" banner button when a
 * template is opened with no fixture present.
 */
export async function createEmptyFixture(
  emailPath: string
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  try {
    const fixturePath = emailPath.replace(
      /\.(tsx|jsx|ts|js)$/,
      '.json'
    );
    if (fs.existsSync(fixturePath)) {
      return { ok: true, path: fixturePath };
    }
    const dir = path.dirname(fixturePath);
    if (!fs.existsSync(dir)) {
      return { ok: false, error: `Directory does not exist: ${dir}` };
    }
    fs.writeFileSync(fixturePath, '{}\n', 'utf-8');
    return { ok: true, path: fixturePath };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
