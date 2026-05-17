import fs from 'node:fs';
import path from 'node:path';
import * as p from '@clack/prompts';
import pc from 'picocolors';

const SAMPLE_TEMPLATE = `import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Link,
} from 'react-email';
import { hbs } from 'react-email-bridge';
import { Each, If, Else } from 'react-email-bridge/hbs';

export default function Welcome() {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#fff', fontFamily: 'Arial' }}>
        <Container style={{ padding: '24px', maxWidth: '600px' }}>
          <Heading style={{ color: hbs('theme.primaryColor') }}>
            Welcome, {\`{{customer.firstName}}\`}!
          </Heading>

          <Text>
            Your order <strong>#{\`{{orderId}}\`}</strong> is confirmed.
          </Text>

          <Each path="items">
            <Text>
              • {\`{{name}}\`} × {\`{{quantity}}\`}
            </Text>
          </Each>

          <If path="trackingUrl">
            <Text>
              <Link href={\`{{trackingUrl}}\`}>Track your order</Link>
            </Text>
            <Else />
            <Text>Tracking will be available soon.</Text>
          </If>
        </Container>
      </Body>
    </Html>
  );
}
`;

const SAMPLE_FIXTURE = JSON.stringify(
  {
    theme: { primaryColor: '#4f46e5' },
    customer: { firstName: 'Marco' },
    orderId: '12345',
    items: [
      { name: 'Black helmet', quantity: 1 },
      { name: 'Leather gloves', quantity: 2 },
    ],
    trackingUrl: 'https://example.com/track/12345',
  },
  null,
  2
);

const SAMPLE_CONFIG = `import { defineConfig } from 'react-email-bridge';

export default defineConfig({
  // outputExtension: '.html',
  // strict: true,
  // previewHelpers: {
  //   myCustomHelper: (value) => String(value).toUpperCase(),
  // },
});
`;

const TSCONFIG = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["emails/**/*", "react-email-bridge.config.ts"]
}
`;

interface Args {
  dir: string;
}

export async function init({ dir }: Args) {
  const cwd = process.cwd();
  const emailsDir = path.resolve(cwd, dir);

  p.intro(pc.bgCyan(pc.black(' react-email-bridge init ')));

  const created: string[] = [];
  const skipped: string[] = [];

  function writeIfMissing(filePath: string, content: string) {
    const rel = path.relative(cwd, filePath) || filePath;
    if (fs.existsSync(filePath)) {
      skipped.push(rel);
      return;
    }
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf-8');
    created.push(rel);
  }

  if (!fs.existsSync(emailsDir)) {
    fs.mkdirSync(emailsDir, { recursive: true });
    created.push(`${path.relative(cwd, emailsDir)}/`);
  }

  writeIfMissing(path.join(emailsDir, 'welcome.tsx'), SAMPLE_TEMPLATE);
  writeIfMissing(path.join(emailsDir, 'welcome.json'), SAMPLE_FIXTURE);
  writeIfMissing(path.resolve(cwd, 'react-email-bridge.config.ts'), SAMPLE_CONFIG);
  writeIfMissing(path.resolve(cwd, 'tsconfig.json'), TSCONFIG);

  if (created.length > 0) {
    p.log.step(
      `Created:\n${created.map((f) => `  ${pc.green('+')} ${f}`).join('\n')}`
    );
  }
  if (skipped.length > 0) {
    p.log.step(
      pc.dim(
        `Already present:\n${skipped.map((f) => `  ${pc.dim('·')} ${f}`).join('\n')}`
      )
    );
  }

  p.outro(
    `${pc.green('✓ Done')}

  ${pc.dim('Next:')}
    ${pc.cyan('pnpm react-email-bridge dev')}
    ${pc.dim('Preview at http://localhost:3737')}
`
  );
}
