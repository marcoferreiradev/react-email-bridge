import fs from 'node:fs';
import path from 'node:path';

const SAMPLE_TEMPLATE = `import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Link,
} from '@react-email/components';
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

  if (!fs.existsSync(emailsDir)) {
    fs.mkdirSync(emailsDir, { recursive: true });
    console.log(`  ✓ created ${path.relative(cwd, emailsDir)}/`);
  }

  const tsxPath = path.join(emailsDir, 'welcome.tsx');
  if (!fs.existsSync(tsxPath)) {
    fs.writeFileSync(tsxPath, SAMPLE_TEMPLATE, 'utf-8');
    console.log(`  ✓ created ${path.relative(cwd, tsxPath)}`);
  }

  const jsonPath = path.join(emailsDir, 'welcome.json');
  if (!fs.existsSync(jsonPath)) {
    fs.writeFileSync(jsonPath, SAMPLE_FIXTURE, 'utf-8');
    console.log(`  ✓ created ${path.relative(cwd, jsonPath)}`);
  }

  const configPath = path.resolve(cwd, 'react-email-bridge.config.ts');
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, SAMPLE_CONFIG, 'utf-8');
    console.log(`  ✓ created ${path.relative(cwd, configPath)}`);
  }

  const tsconfigPath = path.resolve(cwd, 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    fs.writeFileSync(tsconfigPath, TSCONFIG, 'utf-8');
    console.log(`  ✓ created ${path.relative(cwd, tsconfigPath)}`);
  }

  console.log(
    `\n  Next: pnpm react-email-bridge dev\n  Preview will open at http://localhost:3737\n`
  );
}
