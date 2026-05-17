/**
 * P0 — Validação empírica do pipeline core.
 *
 * Provar que: renderToStaticMarkup → substituir sentinelas → juice CSS inline
 * preserva markers HBS em TODOS os contextos onde podem aparecer.
 *
 * Se algum check falhar, ajustar antes de seguir com monorepo/UI/CLI.
 */

import React, { type ReactNode } from 'react';
import { render } from 'react-email';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Img,
  Link,
} from 'react-email';
import juice from 'juice';
import { nanoid } from 'nanoid';
import Handlebars from 'handlebars';
// @ts-expect-error - handlebars-helpers has no types
import handlebarsHelpers from 'handlebars-helpers';
import fs from 'node:fs';
import path from 'node:path';

// ────────────────────────────────────────────────────────────────────
// CORE: hbs() sentinel + substituteSentinels
// ────────────────────────────────────────────────────────────────────

const sentinelMap = new Map<string, string>();

function hbs(hbsPath: string): string {
  const id = `HBSSENTINEL${nanoid(12).replace(/[^A-Za-z0-9]/g, 'X')}`;
  sentinelMap.set(id, hbsPath);
  return id;
}

function substituteSentinels(html: string): string {
  return html.replace(/HBSSENTINEL[A-Za-z0-9]{12}/g, (id) => {
    const p = sentinelMap.get(id);
    return p ? `{{${p}}}` : id;
  });
}

/**
 * React `renderToStaticMarkup` escapa `"`, `'`, `>`, `<`, `&` em text nodes.
 * Markers HBS dentro de text node ficam com entidades HTML — Handlebars
 * não consegue parsear `{{#eq foo &quot;bar&quot;}}`. Unescape AQUI, e SÓ
 * dentro dos markers `{{...}}`, pra não interferir com HTML do entorno.
 */
function unescapeMarkers(html: string): string {
  return html.replace(/\{\{[\s\S]*?\}\}/g, (marker) =>
    marker
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&')
  );
}

// ────────────────────────────────────────────────────────────────────
// PRESET /hbs: componentes-açúcar
// ────────────────────────────────────────────────────────────────────

function Each({
  path: p,
  as,
  children,
}: {
  path: string;
  as?: string;
  children: ReactNode;
}) {
  const open = as ? `{{#each ${p} as |${as}|}}` : `{{#each ${p}}}`;
  return (
    <>
      {open}
      {children}
      {`{{/each}}`}
    </>
  );
}

function If({
  path: p,
  eq,
  compare,
  children,
}: {
  path?: string;
  eq?: [string, string];
  compare?: [string, string, string];
  children: ReactNode;
}) {
  if (compare) {
    return (
      <>
        {`{{#compare ${compare[0]} '${compare[1]}' ${compare[2]}}}`}
        {children}
        {`{{/compare}}`}
      </>
    );
  }
  if (eq) {
    return (
      <>
        {`{{#eq ${eq[0]} ${eq[1]}}}`}
        {children}
        {`{{/eq}}`}
      </>
    );
  }
  return (
    <>
      {`{{#if ${p}}}`}
      {children}
      {`{{/if}}`}
    </>
  );
}

function Unless({ path: p, children }: { path: string; children: ReactNode }) {
  return (
    <>
      {`{{#unless ${p}}}`}
      {children}
      {`{{/unless}}`}
    </>
  );
}

function Else() {
  return <>{`{{else}}`}</>;
}

function Raw({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// ────────────────────────────────────────────────────────────────────
// STRESS-TEST EMAIL: cobre TODOS os contextos de marker
// ────────────────────────────────────────────────────────────────────

function StressTest() {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Arial' }}>
        <Container style={{ padding: '20px' }}>
          {/* 1. Variável em text node */}
          <Text>Olá {`{{client.firstName}}`}, bem-vindo!</Text>

          {/* 2. Variável em atributo string */}
          <Img
            src={`{{logoUrl}}`}
            alt={`{{accountName}}`}
            width="150"
            height="50"
          />

          {/* 3. Variável em atributo style (via hbs()) */}
          <Section
            style={{
              color: hbs('client.brandColor'),
              padding: '10px',
              backgroundColor: hbs('client.bgColor'),
            }}
          >
            <Text>Seção com cor dinâmica</Text>
          </Section>

          {/* 4. Helper em texto */}
          <Text>Total: {`{{formatCurrency total}}`}</Text>
          <Text>Data: {`{{formatDate orderDate}}`}</Text>

          {/* 5. Each loop */}
          <Section>
            <Each path="items">
              <Row>
                <Column>
                  <Text>{`{{productName}}`}</Text>
                </Column>
                <Column>
                  <Text>{`{{formatCurrency sellingPrice}}`}</Text>
                </Column>
              </Row>
            </Each>
          </Section>

          {/* 6. If/Else com path */}
          <If path="invoiceUrl">
            <Text>
              Nota fiscal:{' '}
              <Link href={`{{invoiceUrl}}`}>{`{{invoiceUrl}}`}</Link>
            </Text>
            <Else />
            <Text>Sua nota será enviada em breve.</Text>
          </If>

          {/* 7. If com eq (shortcut) */}
          <If eq={['payment.type', '"creditCard"']}>
            <Text>Pagamento aprovado no cartão.</Text>
          </If>

          {/* 8. If com compare (operator) */}
          <If compare={['items.length', '>', '1']}>
            <Text>Você comprou múltiplos itens.</Text>
          </If>

          {/* 9. Unless */}
          <Unless path="cancelled">
            <Text>Pedido ativo.</Text>
          </Unless>

          {/* 10. Loop aninhado dentro de condicional */}
          <If path="hasShipping">
            <Each path="shippingPackages">
              <Section>
                <Text>Pacote: {`{{packageId}}`}</Text>
                <Each path="items">
                  <Text>
                    - {`{{name}}`} (qtd: {`{{quantity}}`})
                  </Text>
                </Each>
              </Section>
            </Each>
          </If>

          {/* 11. Sub-expression via <Raw> */}
          <Raw>{`{{#each items}}`}</Raw>
          <Raw>{`{{#eq (math @index "%" 2) 0}}`}</Raw>
          <Row style={{ backgroundColor: hbs('theme.stripe') }}>
            <Column>
              <Text>par: {`{{@index}}`}</Text>
            </Column>
          </Row>
          <Raw>{`{{else}}`}</Raw>
          <Row>
            <Column>
              <Text>impar: {`{{@index}}`}</Text>
            </Column>
          </Row>
          <Raw>{`{{/eq}}`}</Raw>
          <Raw>{`{{/each}}`}</Raw>

          {/* 12. Parent path (..) — sem componente, string direto */}
          <Each path="shippingData.logisticsInfo">
            <Text>
              parent: {`{{../accountName}}`}; addr id: {`{{addressId}}`}
            </Text>
          </Each>

          {/* 13. Custom block via <Raw> (#group de handlebars-helpers) */}
          <Raw>{`{{#group items by="category"}}`}</Raw>
          <Text>grupo: {`{{value}}`}</Text>
          <Each path="items">
            <Text>- {`{{productName}}`}</Text>
          </Each>
          <Raw>{`{{/group}}`}</Raw>
        </Container>
      </Body>
    </Html>
  );
}

// ────────────────────────────────────────────────────────────────────
// PIPELINE: render → substituteSentinels → juice
// ────────────────────────────────────────────────────────────────────

async function exportTemplate(element: React.ReactElement): Promise<string> {
  const rawHtml = await render(element, { pretty: false });
  const withMarkers = substituteSentinels(rawHtml);
  const unescaped = unescapeMarkers(withMarkers);
  const inlined = juice(unescaped);
  // juice pode re-escapar dentro dos markers ao serializar — passar de novo
  return unescapeMarkers(inlined);
}

// ────────────────────────────────────────────────────────────────────
// PREVIEW PIPELINE: + Handlebars.compile contra fixture
// ────────────────────────────────────────────────────────────────────

function buildPreviewRuntime() {
  const hb = Handlebars.create();

  // Carrega handlebars-helpers (cobre #compare, math, #group, etc)
  // @ts-expect-error - typing
  handlebarsHelpers({ handlebars: hb });

  // Fakes neutros pros helpers VTEX específicos
  hb.registerHelper('formatCurrency', (n: unknown) =>
    typeof n === 'number' ? n.toFixed(2) : String(n ?? '')
  );
  hb.registerHelper('formatDate', (d: unknown) =>
    d ? new Date(d as string).toISOString().slice(0, 10) : ''
  );

  // helperMissing fallback
  hb.registerHelper('helperMissing', function (...args: any[]) {
    const options = args.pop();
    const params = args.map((a) => JSON.stringify(a)).join(', ');
    return new hb.SafeString(`[${options.name}(${params})]`);
  });

  return hb;
}

async function previewTemplate(
  element: React.ReactElement,
  fixture: Record<string, unknown>
): Promise<string> {
  const html = await exportTemplate(element);
  const hb = buildPreviewRuntime();
  const template = hb.compile(html, { strict: false });
  return template(fixture);
}

// ────────────────────────────────────────────────────────────────────
// ASSERTIONS: o que o output PRECISA conter
// ────────────────────────────────────────────────────────────────────

interface Check {
  name: string;
  test: (html: string) => boolean;
}

const exportChecks: Check[] = [
  {
    name: '1. Variável em texto (`{{client.firstName}}`)',
    test: (h) => h.includes('{{client.firstName}}'),
  },
  {
    name: '2a. Variável em atributo src (`{{logoUrl}}`)',
    test: (h) => /src="\{\{logoUrl\}\}"/.test(h),
  },
  {
    name: '2b. Variável em atributo alt (`{{accountName}}`)',
    test: (h) => /alt="\{\{accountName\}\}"/.test(h),
  },
  {
    name: '3a. hbs() em style virou {{client.brandColor}}',
    test: (h) => /color:\s*\{\{client\.brandColor\}\}/.test(h),
  },
  {
    name: '3b. hbs() em style virou {{client.bgColor}}',
    test: (h) => /background-color:\s*\{\{client\.bgColor\}\}/.test(h),
  },
  {
    name: '4a. Helper formatCurrency literal',
    test: (h) => h.includes('{{formatCurrency total}}'),
  },
  {
    name: '4b. Helper formatDate literal',
    test: (h) => h.includes('{{formatDate orderDate}}'),
  },
  {
    name: '5a. {{#each items}} abriu',
    test: (h) => h.includes('{{#each items}}'),
  },
  { name: '5b. {{/each}} fechou', test: (h) => h.includes('{{/each}}') },
  {
    name: '5c. Variável bare dentro do each ({{productName}})',
    test: (h) => h.includes('{{productName}}'),
  },
  {
    name: '6a. {{#if invoiceUrl}} abriu',
    test: (h) => h.includes('{{#if invoiceUrl}}'),
  },
  { name: '6b. {{else}} presente', test: (h) => h.includes('{{else}}') },
  { name: '6c. {{/if}} fechou', test: (h) => h.includes('{{/if}}') },
  {
    name: '7. {{#eq payment.type "creditCard"}} preservado',
    test: (h) => h.includes('{{#eq payment.type "creditCard"}}'),
  },
  {
    name: "8. {{#compare items.length '>' 1}} preservado",
    test: (h) => h.includes("{{#compare items.length '>' 1}}"),
  },
  {
    name: '9. {{#unless cancelled}} preservado',
    test: (h) => h.includes('{{#unless cancelled}}'),
  },
  {
    name: '10. Each aninhado dentro de If — open count == close count',
    test: (h) => {
      const opens = (h.match(/\{\{#each /g) || []).length;
      const closes = (h.match(/\{\{\/each\}\}/g) || []).length;
      return opens === closes && opens >= 3;
    },
  },
  {
    name: '11a. Sub-expression {{#eq (math @index "%" 2) 0}} preservada via <Raw>',
    test: (h) => h.includes('{{#eq (math @index "%" 2) 0}}'),
  },
  {
    name: '11b. @index preservado',
    test: (h) => h.includes('{{@index}}'),
  },
  {
    name: '12. Parent path {{../accountName}} preservado',
    test: (h) => h.includes('{{../accountName}}'),
  },
  {
    name: '13. {{#group items by="category"}} preservado',
    test: (h) => h.includes('{{#group items by="category"}}'),
  },
  {
    name: 'CSS: existe inline style="..." (juice rodou)',
    test: (h) => /style="[^"]*background-color/.test(h),
  },
  {
    name: 'Sentinelas: nenhuma HBSSENTINEL sobrou no output',
    test: (h) => !h.includes('HBSSENTINEL'),
  },
];

// Preview checks: o HTML interpolado contra fixture deve ter os dados resolvidos
const previewChecks: Check[] = [
  {
    name: 'Preview: client.firstName virou "Marco"',
    test: (h) => h.includes('Marco'),
  },
  {
    name: 'Preview: formatCurrency rodou (não tem mais {{)',
    test: (h) => !h.includes('{{formatCurrency'),
  },
  {
    name: 'Preview: #each items expandiu (3 productNames)',
    test: (h) => {
      const matches = h.match(/Capacete|Luva|Camisa/g) || [];
      return matches.length >= 3;
    },
  },
  {
    name: 'Preview: #if invoiceUrl true → mostra link',
    test: (h) => h.includes('Nota fiscal'),
  },
  {
    name: 'Preview: #compare items.length > 1 → "múltiplos"',
    test: (h) => h.includes('múltiplos'),
  },
];

// ────────────────────────────────────────────────────────────────────
// RUN
// ────────────────────────────────────────────────────────────────────

const fixture = {
  client: {
    firstName: 'Marco',
    brandColor: '#ff6600',
    bgColor: '#fafafa',
  },
  accountName: 'Oficina Reserva',
  logoUrl: 'https://example.com/logo.png',
  total: 524.9,
  orderDate: '2026-05-16',
  items: [
    { productName: 'Capacete', sellingPrice: 199.9, category: 'safety' },
    { productName: 'Luva', sellingPrice: 89.9, category: 'safety' },
    { productName: 'Camisa', sellingPrice: 235.1, category: 'apparel' },
  ],
  payment: { type: 'creditCard' },
  invoiceUrl: 'https://example.com/invoice/123',
  cancelled: false,
  hasShipping: true,
  shippingPackages: [
    {
      packageId: 'PKG-1',
      items: [{ name: 'Capacete', quantity: 1 }],
    },
  ],
  shippingData: {
    logisticsInfo: [{ addressId: 'addr-1' }, { addressId: 'addr-2' }],
  },
  theme: { stripe: '#f0f0f0' },
};

async function main() {
  console.log('\n━━━ P0: Pipeline Validation ━━━\n');

  const element = <StressTest />;

  console.log('• Rendering export pipeline (render → sentinels → juice)...');
  const exported = await exportTemplate(element);

  fs.writeFileSync(
    path.join(import.meta.dirname, 'output-export.hbs'),
    exported,
    'utf-8'
  );
  console.log(
    `  → wrote validation/output-export.hbs (${exported.length} bytes)\n`
  );

  let passed = 0;
  let failed = 0;
  console.log('• Checking EXPORT output (markers literais preservados):\n');
  for (const check of exportChecks) {
    const ok = check.test(exported);
    console.log(`  ${ok ? '✓' : '✗'}  ${check.name}`);
    if (ok) passed++;
    else failed++;
  }

  console.log('\n• Running PREVIEW pipeline (Handlebars.compile + fixture)...');
  let preview = '';
  try {
    preview = await previewTemplate(element, fixture);
    fs.writeFileSync(
      path.join(import.meta.dirname, 'output-preview.html'),
      preview,
      'utf-8'
    );
    console.log(
      `  → wrote validation/output-preview.html (${preview.length} bytes)\n`
    );

    console.log('• Checking PREVIEW output (dados interpolados):\n');
    for (const check of previewChecks) {
      const ok = check.test(preview);
      console.log(`  ${ok ? '✓' : '✗'}  ${check.name}`);
      if (ok) passed++;
      else failed++;
    }
  } catch (err) {
    console.log(`  ✗  Preview FALHOU: ${(err as Error).message}`);
    failed += previewChecks.length;
  }

  const total = passed + failed;
  console.log(`\n━━━ Result: ${passed}/${total} checks passed ━━━`);
  if (failed > 0) {
    console.log(`\n${failed} check(s) failed. Inspecione os outputs:`);
    console.log(`  - validation/output-export.hbs`);
    console.log(`  - validation/output-preview.html`);
    process.exit(1);
  } else {
    console.log('\nPipeline survived. Seguro pra avançar pra P1.\n');
  }
}

main().catch((e) => {
  console.error('\nFatal error:', e);
  process.exit(2);
});
