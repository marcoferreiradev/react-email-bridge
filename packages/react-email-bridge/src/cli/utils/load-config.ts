import fs from 'node:fs';
import path from 'node:path';
import { createJiti } from 'jiti';
import type { BridgeConfig } from '../../core/types.js';

const CONFIG_CANDIDATES = [
  'react-email-bridge.config.ts',
  'react-email-bridge.config.mts',
  'react-email-bridge.config.js',
  'react-email-bridge.config.mjs',
];

export async function loadConfig(cwd: string): Promise<BridgeConfig> {
  for (const name of CONFIG_CANDIDATES) {
    const p = path.join(cwd, name);
    if (fs.existsSync(p)) {
      const jiti = createJiti(cwd, { interopDefault: true });
      const mod = await jiti.import<BridgeConfig | { default: BridgeConfig }>(p);
      return 'default' in (mod as object)
        ? (mod as { default: BridgeConfig }).default
        : (mod as BridgeConfig);
    }
  }
  return {};
}
