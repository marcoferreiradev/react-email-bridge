# DECISIONS — react-email-bridge

Decisões tomadas durante o grilling de design (2026-05-16, sábado). Atualizar inline conforme novas perguntas forem fechadas. Promover qualquer item pra ADR formal em `docs/adr/` se virar irreversível ou se um colaborador novo precisar do contexto detalhado.

---

## D1 — Loader de TSX: `jiti`

`jiti` carrega `.tsx` do usuário em runtime, tanto no comando `export` quanto no `dev`. Mesmo módulo, mesmo comportamento — bug no preview = bug no export.

**Por quê**: react-email usa exatamente esse stack em produção (`jiti` + `esbuild` + `chokidar`). Bundle de Vite/Next foi descartado por peso de install e por não dar controle do pipeline de pós-processamento HBS.

## D2 — Vendoring de `@react-email/ui` como pacote do monorepo

O editor (sidebar + iframe + tabs Linter/Compatibility/Spam/Resend + dark mode + responsividade + code view) **não é construído do zero**. A gente fork-e-vendora o `@react-email/ui` upstream pra `packages/react-email-bridge-ui/`. MIT, crédito mantido na LICENSE e README.

**Por quê**: prazo de segunda inviabiliza construir UI equivalente do zero. Ponto de extensão limpo no `renderEmailByPath()` action — pipeline HBS entra como uma string transform localizada.

**Custo aceito**: carregamos um fork. Plano: marcar commit-pointer do upstream SHA e revisitar trimestralmente.

## D3 — Estrutura: monorepo pnpm com dois pacotes publicados

```
react-email-bridge/                # monorepo
├── packages/
│   ├── react-email-bridge/        # npm: react-email-bridge (core + hbs + cli)
│   └── react-email-bridge-ui/     # npm: react-email-bridge-ui (vendored Next app)
├── examples/
│   ├── generic-hbs/
│   └── vtex-store/
└── refs/                          # gitignored
```

**Distribuição**: igual react-email — pacote CLI leve, UI pesada instalada on-demand no primeiro `dev`. API pública (`import { render, hbs } from 'react-email-bridge'`, `import { Each, If } from 'react-email-bridge/hbs'`) permanece como no briefing.

## D4 — Modelo de fixture

- Fixture = `<basename>.json` adjacente ao `<basename>.tsx`.
- **Não vai pro React component** (componente sempre recebe props vazias). Vai pro Handlebars depois do render.
- **Read-only na v0.1** num painel lateral colapsável à direita. Botão "Open in IDE".
- Fixture ausente → banner no iframe + botão "Create empty fixture" que gera `<basename>.json` com `{}`.
- Uma fixture por template na v0.1. Múltiplas variantes (`<basename>.<variant>.json` + dropdown) → v0.2.
- **`Email.PreviewProps` do react-email original = dropado**. Único caminho de dados é o `.json` adjacente. Templates copiados do demo do react-email perdem PreviewProps na importação — usuário cria `.json` equivalente.

## D5 — Code view: 3 tabs como react-email original

| Tab | Conteúdo |
|---|---|
| React | `.tsx` fonte |
| HTML | output do `core.render()` **com `{{var}}` literal** — o que cola na VTEX |
| Plain Text | versão plaintext do mesmo HTML, markers literais preservados |

Iframe = post-interpolação (Handlebars já rodou contra fixture). Espelha o admin da VTEX 1:1.

**Sem tab "HBS" separado** — pro usuário "HTML com markers" é só HTML.

## D6 — Extensão de arquivo do export

**Configurável via `react-email-bridge.config.ts`**, default `.hbs`. Default cobre o caso VTEX e fornece IDE highlighting; usuários de outras plataformas (Mandrill, etc) podem trocar pra `.html`.

## D7 — Bottom tabs: split entre pre e post-interpolação

| Tab | Roda contra | Motivo |
|---|---|---|
| Linter | pre-interpolação | verdade estrutural independente da fixture |
| Compatibility | pre-interpolação | consistência com Linter; CSS é igual nos dois estados |
| Spam | **post**-interpolação | scanners reais leem o email final |
| Send (Resend) | **post**-interpolação | óbvio — emails reais |

Linter precisa de regra "valor é `{{...}}`" = "valor está presente" pra evitar falsos positivos em `alt={`{{name}}`}`.

Badge no topo da tab mostrando contra qual estado a análise rodou ("checked against: template" ou "checked against: preview data").

## D8 — Paridade com oficina = ground truth

Tudo que `refs/email-templates-oficina` é capaz de fazer hoje, a v0.1 precisa cobrir. Análise do gulpfile + templates revelou:

**Pipeline oficina ↔ Nosso pipeline:**

| oficina | nosso |
|---|---|
| `yarn dev` / `yarn preview` (com fixture) | `dev` server iframe |
| `yarn dist` (markers preservados) | `export` |
| `source/templates/*.hbs` | `emails/*.tsx` |
| `source/data/vtex/*.json` | `emails/*.json` |
| `partials/*.hbs` injetados | React components importados (achatam no render) |
| `i18n` delimeters `((key))` | v0.2 (por enquanto, condicional `<If compare={['locale', '==', '"pt-BR"']}>`) |
| `handlebars-helpers` + custom helpers em `helpers.js` | preview runtime do `/hbs` + config file pra customs |
| `gulp-strip-comments`, `gulp-email-remove-unused-css` | v0.2 (otimizações pós-MVP) |
| sass + juice CSS inline | react-email styles + juice no export |

**Implicação central**: VTEX runtime suporta **muito mais** do que o briefing original listava. `#compare`, `math`, sub-expressions, `@index`, e helpers customizados (`eval`, `group`, `richShippingData`) sobrevivem no dist e funcionam em produção. **Nossa lib não policia helpers** — apenas preserva o que o usuário escreveu.

## D9 — Preview runtime do `/hbs`

1. Carrega **`handlebars-helpers` inteiro** (~50KB). Cobre `#compare`, `math`, `#gt`, `#lt`, `#contains`, `#group`, formatters, etc.
2. Registra fakes neutros (sem locale) pros helpers VTEX-específicos não presentes em `handlebars-helpers`: `formatCurrency`, `formatCurrencyWithoutDecimals`, `formatUSDCurrency`, `formatPENCurrency`, `multiplyCurrency`, `formatDate`, `formatTime`, `formatDateTime`, `formatUSDate`, `formatUSDateTime`, `formatDateNoTimezone`, `addDaysToDate`, `formatNumber`, `hasSubStr`, `ifCond`, `isMoreThanOneDay`.
3. `helperMissing` fallback → `[helperName(args)]`.
4. **Config file opt-in**: `react-email-bridge.config.ts` exporta `{ previewHelpers: {...} }` pra registrar/override (carregado via jiti).

## D16 — Plano B (unescape de markers) é obrigatório, não opcional

**Descoberta da validação P0**: `@react-email/render` chama `renderToStaticMarkup` que escapa `"`, `'`, `>`, `<`, `&` em text nodes. Markers HBS em text node (`{{#eq foo "bar"}}`) saem do render como `{{#eq foo &quot;bar&quot;}}` — Handlebars não parseia.

Pipeline final do `core.render`:

```ts
async function render(element) {
  const html = await reactEmailRender(element, { pretty: false });
  const withMarkers = substituteSentinels(html);
  const unescaped1 = unescapeMarkers(withMarkers);
  const inlined = juice(unescaped1);
  return unescapeMarkers(inlined);  // juice re-escapa, passar duas vezes
}

function unescapeMarkers(html) {
  return html.replace(/\{\{[\s\S]*?\}\}/g, marker =>
    marker
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&')
  );
}
```

Importante: o regex `/\{\{[\s\S]*?\}\}/g` é **lazy** — pega menor marker possível. Senão um `{{x}} ... {{y}}` viraria um marker só.

**Comentários `<!-- -->` aparecem entre text nodes** (React serializa fragments). Inofensivos pra HBS (HTML comments ignorados). Pra v0.1 não tratar; v0.2 pode adicionar passo de strip.

## D11 — Sentinela do `hbs()` em atributos `style`

Formato: **identificador CSS-safe + side table em memória**.

```ts
// /core/render/hbs-sentinels.ts
const sentinelMap = new Map<string, string>();

export function hbs(path: string): string {
  const id = `HBSSENTINEL${nanoid(12)}`;  // só [A-Za-z0-9]
  sentinelMap.set(id, path);
  return id;
}

export function substituteSentinels(html: string): string {
  return html.replace(/HBSSENTINEL[A-Za-z0-9]{12}/g, (id) => {
    const path = sentinelMap.get(id);
    return path ? `{{${path}}}` : id;
  });
}
```

**Por quê não marker literal direto (`return '{{' + path + '}}'`):** `juice` parseia o conteúdo de `style="..."` antes de inlinar. `{{x}}` não é CSS válido (colons, braces) — juice pode strippar/quebrar. Identificador puro sobrevive o parsing.

**Validação empírica é o primeiro passo de implementação** (passo 5 do briefing original, o "PROVA DE CONCEITO"). Não pular.

## D12 — Strict mode do Handlebars no preview (REVISADO)

**Default agora é non-strict** (revisado depois da implementação P6). Razão: fixture VTEX real (`vtex-email-framework/source/data/`) tem 1119 linhas com muitos campos opcionais; strict mode trava em campos ausentes que VTEX runtime aceita normalmente.

Comportamento atual:
- Default `strict: false` — variável ausente vira string vazia.
- Usuário opta in via `react-email-bridge.config.ts`: `{ strict: true }`.
- Erros de parsing/sintaxe ainda são mostrados no iframe (parser errors, helpers que crasham, etc).

## D13 — Build tool: `tsdown`

Mesmo build tool do react-email upstream. Reduz divergência de toolchain entre `react-email-bridge` e o `@react-email/ui` que vendamos.

## D15 — Escopo da v0.1 (entrega segunda)

**Tudo abaixo é must-have:**

1. Editor (sidebar + iframe + tabs Linter/Compatibility/Spam/Resend + dark mode + responsividade + code view 3-tabs) — vendado do `@react-email/ui`
2. Pipeline export gerando arquivo colável na VTEX
3. Config file (`react-email-bridge.config.ts`) suportando: helpers custom, extensão de output, locale
4. Painel de fixture read-only ao lado do iframe
5. **Exemplo `vtex-store` com 2-3 templates portados** dos mais completos do `vtex-email-framework` (ex: `01-confirmed.hbs` que usa `#richShippingData`, `#group`, `#math`, parent paths profundos — stress test de paridade)
6. CLI: `init`, `dev`, `export <template>`, `export --all`
7. Componentes-açúcar do `/hbs` (D10) incluindo `<Raw>`
8. Preview runtime do `/hbs` (D9) com `handlebars-helpers` + fakes neutros + helperMissing
9. Sentinela CSS-safe (D11) + validação empírica end-to-end como **primeiro passo de implementação**

**Pra v0.2 (não bloqueia segunda):**
- i18n (delimitadores customizados ou framework próprio)
- Edição inline de fixture
- Múltiplas variantes de fixture (`<name>.<variant>.json` + dropdown)
- Presets além de HBS (Liquid, Mailchimp)
- ESLint plugin / type generation a partir de schemas
- Faker / auto-geração de fixtures

## D14 — Sidebar agrupa por pasta

`emails/foo/template.tsx` → grupo "foo" colapsável. Igual ao demo do react-email (`01-Barebone`, `02-Matte`, etc). UI vendada já suporta — sem config extra. Pasta única = vira flat naturalmente.

## D10 — API dos componentes-açúcar do `/hbs`

```tsx
// Block helpers
<Each path="items">...</Each>                          // {{#each items}}
<Each path="items" as="item">...</Each>                // {{#each items as |item|}}
<If path="invoiceUrl">...</If>                         // {{#if invoiceUrl}}
<If eq={['a', '"b"']}>...</If>                         // {{#eq a "b"}} (atalho)
<If compare={['a', '==', '"b"']}>...</If>              // {{#compare a '==' "b"}}
<Unless path="cancelled">...</Unless>                  // {{#unless cancelled}}
<Else />                                               // {{else}} (válido em #if/#unless/#each)
<Raw>{`{{#group items by="addessId"}}`}</Raw>...<Raw>{`{{/group}}`}</Raw>
```

`<Raw>` (escape hatch oficial): emite children como text node. Pra qualquer HBS arbitrário — `#group`, `#with`, `#math`, helpers customizados, sub-expressions complexas. Grep-able (`rg '<Raw>'` lista todo HBS não-açucarado do projeto).

**Paths complexos** observados em `vtex-email-framework` (e que precisam funcionar):
- Parent paths profundos: `../../../../items` — uso direto em string, sem componente
- Index access: `items.0.slas`, `orders.0.paymentData.transactions` — uso direto
- Hash params em helpers: `{{#group items by="addessId"}}` — via `<Raw>`

**Sub-expressions** (`(math @index "%" 2)`): aceitos como strings literais nos arrays de `compare` / `eq`. Ex: `<If compare={['(math @index "%" 2)', '==', '0']}>`.

**Variáveis especiais** (`@index`, `@first`, `@last`, `this`, `..`, `@key`): uso direto via string `{`{{@index}}`}` em JSX. Documentar no README.
