# STATUS — react-email-bridge

> Snapshot do estado da v0.1 após várias rodadas de implementação + feedback. Estruturado em contraste com o **briefing original** (não revisitar a história aqui, está nos commits). Pensado pra outro Claude — ou outro humano — pegar isso e atualizar um plano de v0.2+ sem precisar reler 5 conversas.
>
> Última atualização: 2026-05-17.
> Outros docs canônicos: [DECISIONS.md](./DECISIONS.md) (16 design decisions tomadas), [ROADMAP.md](./ROADMAP.md) (v0.2+ pendente), [README.md](./README.md) (quickstart).

---

## 1. Headline

**v0.1 shippable.** Todos os 5 critérios do "v0.1 pronto" do briefing estão verdes. Tutorial flow validado end-to-end de uma máquina limpa. 107 testes + 28 stress-test asserts. Editor com paridade visual ao `demo.react.email`, mas entendendo Handlebars.

**O que está fora do v0.1**: portar os 13 templates do `vtex-email-framework` (infra existe, conteúdo no roadmap), fixture-typing inference (killer feature do roadmap), publish no npm (depende de bump de license/CI).

---

## 2. Critério de "v0.1 pronto" — do briefing, item por item

| # | Critério (briefing) | Status | Caveat |
|---|---|---|---|
| 1 | `pnpm add react-email-bridge` + `pnpm react-email-bridge init` produz scaffold funcional | ✓ | Hoje via tarball local (`pnpm pack-all` + `new-project`) até publicar no npm |
| 2 | `pnpm react-email-bridge dev` sobe servidor, abre browser, mostra templates renderizados com fixtures | ✓ | Default port 3737 |
| 3 | Editar `.tsx` ou `.json` reflete no preview (hot reload) | ✓ | Socket.io + chokidar; o upstream só observava `.tsx`, patchamos pra também reagir a `.json` |
| 4 | `pnpm react-email-bridge export order-invoiced` gera `dist/order-invoiced.hbs` colável no Message Center | ✓ | Validação visual contra fixture real (1119 linhas do vtex-email-framework) |
| 5 | `examples/vtex-store/` é um projeto rodável que demonstra o fluxo completo | ✓ | 2 templates portados (`order-confirmed`, `order-invoiced`), com richShippingData/group/math sub-expressions |

---

## 3. Arquitetura final (vs briefing)

**Briefing pedia:** pacote único `react-email-bridge` com subpath exports (`.`, `/hbs`, futuros `/liquid`, `/mailchimp`).

**Realidade hoje:** monorepo pnpm com **2 pacotes npm publicáveis**:

```
react-email-bridge/                            # repo
├── packages/
│   ├── react-email-bridge/                    # ~38KB built — CLI + core + HBS preset
│   │   └── exports: . | /hbs | /hbs/preview-helpers
│   └── react-email-bridge-ui/                 # ~13MB — Next.js preview server (forked @react-email/ui)
├── starters/
│   ├── default/                               # generic scaffold
│   └── vtex-full/                             # VTEX-tuned scaffold (templates pendentes — ROADMAP)
├── examples/
│   ├── generic-hbs/                           # baseline didático
│   └── vtex-store/                            # 2 templates VTEX reais
├── scripts/
│   ├── new-project.mjs                        # bootstrap CLI
│   └── distribute-tarballs.mjs                # post-pack helper
├── refs/                                      # gitignored: react-email, vtex-emails, vtex-email-framework, email-templates-oficina
├── validation/test-pipeline.tsx               # P0 stress test (28 asserts)
└── .github/workflows/ci.yml                   # CI: install, validate, build, test, smoke export
```

**Por que mudou**: a UI vendada (Next.js app pré-buildado, ~13MB) NÃO cabe num pacote leve sem inflar o install pra quem só usa `export`. Mesma estratégia do upstream (`react-email` + `@react-email/ui` separados).

**API pública pro usuário continua exatamente como o briefing pediu:**

```ts
import { render, hbs, defineConfig, type Preset, type BridgeConfig } from 'react-email-bridge';
import { Each, If, Unless, Else, Raw } from 'react-email-bridge/hbs';
```

---

## 4. Decisões "não revisitar" do briefing — status

| # | Decisão | Status | Razão se mudou |
|---|---|---|---|
| 1 | Sintaxe variáveis = strings literais no JSX | ✓ mantida | — |
| 2 | Blocos = componentes-açúcar que emitem strings | ✓ mantida + adicionamos `<Raw>` | escape hatch necessário pra `#group`, `#with`, `#math`, helpers customizados |
| 3 | Marcadores em atributos: função `hbs()` no core | ✓ mantida | formato refinado: `HBSSENTINEL${nanoid}` (CSS-safe) em vez de `__HBS_SENTINEL_${uuid}__:${path}` (quebrava juice) |
| 4 | Fixture co-localizada, mesmo nome do template | ✓ mantida | — |
| 5 | Contexto do `<Each>` = padrão Handlebars | ✓ mantida | — |
| 6 | i18n fora do MVP | ✓ mantida | — |
| 7 | VTEX é exemplo, não preset | ✓ mantida | — |

**Revisões necessárias** (briefing pediu "não revisitar", mas a realidade forçou):

| Decisão original | Revisão | Razão |
|---|---|---|
| Pacote único com subpath exports | **2 pacotes npm** (`react-email-bridge` + `react-email-bridge-ui`) | UI vendada é Next app de ~13MB; não cabe na CLI leve |
| (implícito) Strict mode no Handlebars preview | **Default `strict: false`** | Fixtures VTEX reais têm campos opcionais comuns; strict trava com `"X" not defined in undefined` em campos legítimos |

---

## 5. Decisões abertas no briefing — escolhas tomadas

| Decisão (briefing) | Escolha |
|---|---|
| Dev server: Vite vs express + chokidar | **Nenhum dos dois** — vendoring de `@react-email/ui` (Next.js) |
| CLI framework: commander vs cac vs yargs | **commander** (mesmo do upstream) |
| Build: tsup vs unbuild vs rollup | **tsdown** (mesmo do upstream — minimiza divergência do toolchain) |
| UI do dev server: HTML estático vs SPA React | **Next App Router** (herdamos do upstream) |
| Substituição de sentinelas: regex vs parser HTML | **regex global** (sentinela é puro `[A-Za-z0-9]`, sobrevive CSS parsing) |

**Decisões adicionais tomadas durante a implementação** (não previstas no briefing):

- **TSX loading no `export`**: tentamos jiti, tsx loader, esbuild direto. Ficou **esbuild bundle → tmpFile em `<cwd>/.react-email-bridge-tmp/` → dynamic import**. Necessário porque tsx não detectava tsconfig.json across program boundary.
- **Hot reload de fixture**: chokidar no nosso server + socket.io broadcast → patched `useEmailRenderingResult` hook upstream pra reagir a `.json` com mesmo basename do template aberto.
- **CLI UX**: refactored pra `@clack/prompts` + `picocolors` depois do feedback do user. Hide pnpm install behind spinner.
- **Validação de marker em atributos**: util `isTemplateMarker()` injetada no `check-links` e `check-images` do upstream, reconhece `{{...}}`, `{% ... %}`, `*|...|*`.

---

## 6. Surpresas / descobertas que o briefing não previu

Em ordem decrescente de impacto no design:

### 6.1 Plano B é obrigatório, não opcional

**Briefing:** "Plano A: marcadores sobrevivem ao render. Plano B: implementar pós-processamento de unescape. **Aceitável, mas evitar.**"

**Realidade:** Plano B é **obrigatório**. React's `renderToStaticMarkup` HTML-escape `"`, `'`, `>`, `<`, `&` em text nodes. Markers em block form como `{{#eq foo "bar"}}` saem do render como `{{#eq foo &quot;bar&quot;}}` — Handlebars não parseia. **Toda implementação séria precisa de `unescapeMarkers()` aplicado dentro dos `{{...}}`.** Roda 2x no pipeline: antes E depois do `juice()` (juice re-escapa ao serializar).

Implicação pro plano: **não tentar evitar**. Documentar o Plano B como o caminho oficial. Tem teste dedicado (`tests/sentinels.test.ts`).

### 6.2 VTEX usa MUITO mais helpers que o briefing afirmava

**Briefing:** "Helpers customizados são PROIBIDOS. Conjunto fechado: `formatCurrency`, `formatDate*`, `multiplyCurrency`, `replace`, `#each`, `#if`, `#unless`, `#eq`, `else`, `#hasSubStr`."

**Realidade:** Templates do `vtex-email-framework` (oficial VTEX) usam:
- `#compare a 'op' b` (com operadores `==`, `!=`, `>`, `<`, etc)
- `math` em forma de bloco e expressão (`{{#math index '+' 1}}{{/math}}`, `(math @index "%" 2)`)
- Sub-expressions (parêntese): `{{#eq (math @index "%" 2) 0}}`
- `@index`, `@first`, `@last`, `..`/`../../../../`
- `#group items by="addessId"` (hash params)
- `#with`, `#hasSubStr`
- `#richShippingData shippingData` (custom block que transforma contexto)

Plus o oficina/email-templates-oficina usa `eval`, `group`, `isMoreThanOneDay`.

**Implicação pro plano:** o briefing tinha uma visão simplista do VTEX. Acreditamos no usuário ("oficina = ground truth, paridade total") e implementamos:
- `handlebars-helpers` lib inteira (~150 helpers, igual oficina usa server-side)
- 16 fakes neutros pros helpers VTEX-específicos (`formatCurrency`, `formatDate*`, etc, sem locale)
- 4 polyfills oficina-style (`math`, `group`, `eval`, `richShippingData`)
- `helperMissing` fallback que renderiza `[name(args)]` pra helpers desconhecidos

Veja [`packages/react-email-bridge/src/hbs/preview-helpers.ts`](./packages/react-email-bridge/src/hbs/preview-helpers.ts).

### 6.3 Vendoring do `@react-email/ui` era único caminho viável

**Briefing:** o briefing implicava construir UI própria ou usar Vite/express.

**Realidade:** o `@react-email/ui` é Next App Router que chama `render()` diretamente em server actions. Não tem hook customizável pra plug Handlebars + fixture interpolation entre `render` e o iframe. **Fork + patch foi único caminho.**

Mecânica do patch:
1. Action `renderEmailByPath` recebe markup do `render()`
2. Aplicamos `substituteSentinels()` + `unescapeMarkers()` → obtemos `.hbs` literal
3. Carregamos `<basename>.json` adjacente
4. `Handlebars.compile(html)(fixture)` → markup interpolado pro iframe
5. Devolvemos tudo: `prettyMarkup` (com markers) na code view, `markup` (interpolado) no iframe

**Implicação:** vendoring traz feature-parity do dia 1 mas vira dívida ("upstream patch cycle"). v1.0 talvez forking ↔ contribuir patches upstream. [DECISIONS.md D2](./DECISIONS.md#d2) tem detalhes.

### 6.4 Tutorial flow é 80% do trabalho pós-v0.1

**Briefing:** assumiu `pnpm add react-email-bridge` quando publicado. Não tinha tutorial flow definido.

**Realidade:** sem npm publish, precisamos:
- `pnpm pack-all` (script root) → tarballs em `dist-tarballs/`
- `scripts/distribute-tarballs.mjs` → copia tarballs em cada `starters/*/vendor/`
- `scripts/new-project.mjs` → `--template <name>`, cp -R do starter, pnpm install, git init, commit inicial
- Starters precisam `@types/react`, `tsconfig.json` (esbuild detecta JSX), `pnpm.overrides` pra `react-email-bridge` (resolver tarball em vez de registry 404)

Cada passo descobrimos só testando. Documentado em [README.md "Quickstart"](./README.md#quickstart) e [scripts/new-project.mjs](./scripts/new-project.mjs).

### 6.5 `@react-email/components` deprecated (durante a implementação)

Durante o desenvolvimento, npm passou a flaggear `@react-email/components` + componentes individuais como `deprecated: "Package no longer supported"`. NÃO é abandono — Resend (maintainers) consolidaram tudo em `react-email` package. Migramos:

```diff
- import { Html, Body, ... } from '@react-email/components';
- import { render } from '@react-email/render';
+ import { Html, Body, ..., render } from 'react-email';
```

Tudo coberto. Zero deprecation warnings hoje. Veja commit `1c3...` (migrate to unified react-email).

### 6.6 Outras descobertas menores

| Descoberta | Impact | Onde tratado |
|---|---|---|
| `init` precisa criar `tsconfig.json` (esbuild não detecta JSX sem) | `npx tsc --noEmit` na cli + builds | `cli/commands/init.ts` |
| Linter falso positivo: `{{trackingUrl}}` vira "link is broken" | UI banner pollution | `isTemplateMarker` util + `check-links`/`check-images` patches |
| Banner "fixture ausente" precisa ser overlay, não inline | layout quebrou | `MissingFixtureBanner` absolute positioned |
| `helperMissing` agressivo demais: `{{var}}` em fixture vazia virava `[var()]` | UX confusa | split: zero args → `''`, com args → `[name(args)]` |
| Repack precisa ser exposto via `pack-all` workflow | invisível pra contributors | `package.json` scripts + CI smoke test |

---

## 7. Funcionalidades EXTRAS (além do briefing v0.1)

| Feature | Justificativa |
|---|---|
| Painel **Data** (4ª tab no code view) com fixture JSON | Briefing previu como v0.2; adicionado em <1h via 4º markup |
| Banner **"fixture ausente" + Create empty fixture** button | D4 do briefing, virou interativo |
| **CLI `new-project` script** (`pnpm -w run new-project ...`) | Briefing assumia npm install funcional |
| **`--template <name>` flag** (`default`, `vtex-full`) | User pediu starter VTEX-completo; infra pronta, conteúdo no roadmap |
| **Branding próprio** (logo + título "react-email bridge") | Forking precisa distinguir-se |
| **CLI elegante** com `@clack/prompts` + `picocolors` | Feedback do user; pnpm install hidden behind spinner |
| **Tipagem rica de `previewHelpers`** (`PreviewInlineHelper \| PreviewBlockHelper` union) | Briefing usava `HelperDelegate` loose `any` |
| **CI GitHub Actions** | install + validate + build + test + smoke export de ambos exemplos + bootstrap |
| **107 vitest tests** | Briefing pediu "mínimo" |
| **ROADMAP.md** com fixture-typing inference como killer feature v0.2 | Material pra futuras rodadas |
| **`git init` automático** no `new-project` + initial commit | UX padrão moderna |

---

## 8. Roadmap explícito (v0.2+)

Consolidado em [ROADMAP.md](./ROADMAP.md). Highlights:

### Killer feature da v0.2: tipagem inferida de fixture → templates

```ts
// emails/order.json existente:
{ "customer": { "firstName": "Marco" }, "items": [{ "name": "Helmet" }] }

// Build step gera:
type Fixture = { customer: { firstName: string }; items: { name: string }[] }
type Paths = "customer" | "customer.firstName" | "items" | "items.0.name" | ...

// Componentes ficam tipados:
<If path={K extends Paths}>...</If>  // ❌ TS erro em "wrongPath"
<Each path={K extends ArrayPaths<Fixture>}>...  // ❌ erro em path não-array
```

**Caminhos:** comando `gen-types`, ou zod schema, ou TS plugin. Detalhes em [ROADMAP.md#v0.2](./ROADMAP.md).

### Outros v0.2+

- Portar 13 templates VTEX (+ 9 partials React) pra `starters/vtex-full/emails/`. Infra do `--template` já existe, conteúdo pendente.
- Inline fixture editor (hoje read-only)
- Múltiplas variantes de fixture (`<name>.<variant>.json` + dropdown)
- Presets Liquid e Mailchimp (mecânica de preset já pronta)
- `pnpm pack-all --watch` pra iteração rápida no monorepo
- ESLint plugin (avisa uso de helper não-suportado por preset)
- TypeScript schemas externos (auto-import de VTEX GetOrder API)

### Não-roadmap (descartado intencionalmente)

- Editor drag-and-drop WYSIWYG (não é o público — quem precisa tem Stripo/Bee)
- Geração AI de templates (projeto diferente)
- Própria engine Handlebars (reinventar maduro = zero ganho)
- Vue/Svelte support (foco é React Email)

---

## 9. Orientações pra próximos planos

Se outro Claude (ou humano) for produzir um plano de v0.2 ou de um spin-off, considere o seguinte:

### 9.1 Não acredite em "lista fechada de helpers" de plataformas

VTEX afirma uma coisa na doc oficial, mas a realidade dos templates é outra. Antes de assumir suporte, **valide contra múltiplos repos reais**:

- `refs/vtex-emails/` (oficial)
- `refs/vtex-email-framework/` (oficial mais novo)
- `refs/email-templates-oficina/` (real-world fork)

Se um pattern aparece em 2+ desses, é case que precisa cobertura.

### 9.2 Vendoring vs ground-up: decida cedo

A escolha "construir UI própria vs vendoring `@react-email/ui`" foi crucial. Vendoring acelerou v0.1 absurdamente mas criou dívida (upstream patch cycle). Pra v0.2 da UI, considere:

- **Manter vendoring** (status quo): cada feature da UI é fork patch
- **Contribuir upstream** patches que generalizam (ex: tornar `renderEmailByPath` plugável). React Email maintainers podem aceitar.
- **Rewrite UI própria** (mais leve, sem Next): apenas se a base de features estabilizar e o ciclo upstream virar dor.

Recomendação: ficar com vendoring até v1.0, então reavaliar.

### 9.3 Strict typing fica em tensão com fixtures reais

`strict: true` no Handlebars era a decisão "limpa" do briefing (D12). Realidade: fixture VTEX real (1971 linhas no `04-invoiced`) tem campos opcionais comuns. Default não-strict é mais pragmático.

**Pra v0.2**: tipagem inferida resolve o problema na raiz — se a fixture é o ground truth do shape, validar contra ela elimina o strict-vs-loose. Daí o roadmap.

### 9.4 React JSX escape é fonte constante de fricção

Toda nova feature que mexer com markers em atributos vai bater de novo no escape. Já temos `unescapeMarkers` no pipeline core, mas:

- Markers em `style` precisam de `hbs()` sentinela (React rejeita non-string values)
- Markers em `dangerouslySetInnerHTML` precisam patch dedicado se aparecerem (não testamos)
- Markers em `data-*` attributes podem ter quirks com `parse5`/`cheerio` quando juice rodar

**Antes de adicionar nova mecânica de marker, escreva um stress test** (modelo: `validation/test-pipeline.tsx`).

### 9.5 Tutorial flow merece tempo dedicado

Subestimamos. Cada uma dessas pequenas coisas custou retrabalho:

- `tsconfig.json` no scaffold (esbuild detect JSX)
- `@types/react` no scaffold (TS7016)
- `pnpm.overrides` no scaffold (tarball resolution)
- `git init` no bootstrap
- Hide pnpm install output behind spinner
- `--template <name>` flag arg parsing
- Cleanup de `dist-tarballs/` stale

**Pra v0.2**, antes de adicionar feature nova, **rode o flow do clone até preview num diretório virgem**. Toda fricção tem que ir embora.

### 9.6 Tests blackbox são caros mas vital

`tests/cli-export.test.ts` faz `spawnSync` no CLI buildado contra projetos temp. Isso pegou:
- Bugs de resolução (`react` not found from `/tmp/...` outside node_modules)
- Bugs de tsconfig discovery (esbuild não achava sem path explícito)
- Bug de marker escape (Plano B descoberto)

Investimento: ~2h. Pago muito.

### 9.7 Roadmap pesado é OK no v0.1, mas marque

`ROADMAP.md` tem ideias que não cabiam na v0.1. Não tente squeeze tudo:

- Fixture typing inference é a feature mais ambiciosa do roadmap — vai precisar de plano dedicado
- 13 templates VTEX portados é trabalho mecânico de 1.5-2 dias
- Liquid/Mailchimp presets são extensions naturais (mecânica de preset existe)

Cada um desses **deveria virar um plano específico**, não tentativa de "fazer tudo de uma vez".

---

## 10. Referências canônicas no repo

| Arquivo | Pra que serve |
|---|---|
| [README.md](./README.md) | Quickstart pra usuário novo. Tutorial completo. |
| [DECISIONS.md](./DECISIONS.md) | 16 design decisions tomadas durante implementação, com rationale e trade-offs. **Leia antes de revisitar arquitetura.** |
| [ROADMAP.md](./ROADMAP.md) | v0.2+ features, killer features, e o que foi explicitamente descartado |
| `validation/test-pipeline.tsx` | Stress test do render pipeline (28 asserts) |
| `packages/react-email-bridge/tests/` | 107 vitest tests (7 arquivos) |
| `packages/react-email-bridge/src/core/` | render(), hbs() sentinela, unescapeMarkers (Plano B) |
| `packages/react-email-bridge/src/hbs/` | Sugar components, preview runtime, 16 VTEX fakes |
| `packages/react-email-bridge-ui/` | Forked `@react-email/ui` com patches HBS |
| `examples/vtex-store/emails/` | Templates VTEX reais (order-confirmed, order-invoiced) |
| `starters/{default,vtex-full}/` | Scaffolds que o `new-project` copia |
| `.github/workflows/ci.yml` | install + validate + build + test + smoke export |
