# Roadmap

Tracker pra ideias que extrapolam o escopo da v0.1 — features que valem a pena mas exigem trabalho ou pesquisa maior.

---

## v0.2 (próxima janela)

### Tipagem inferida de fixture → templates (killer feature)

A fixture `.json` adjacente ao template **descreve o shape** de dados que o template consome. Hoje isso é trabalho do autor manter no cérebro: ele escreve `{`{{customer.firstName}}`}` no JSX e tem que torcer pra que `customer.firstName` realmente exista na fixture (e no payload de produção). Errar = template quebra em produção.

**Visão:** transformar fixture em type, inferir paths legais, e tipar os componentes `<If path>`, `<Each path>`, etc. com autocomplete e validação no editor.

**Esboço técnico:**

```ts
// emails/order-confirmed.json existente:
{
  "customer": { "firstName": "Marco" },
  "items": [{ "name": "Helmet", "price": 19990 }]
}

// Build step gera:
type Fixture = { customer: { firstName: string }; items: { name: string; price: number }[] }
type Paths = "customer" | "customer.firstName" | "items" | "items.0" | ...

// Componentes ficam tipados:
<If path={K extends Paths}>...</If>            // ❌ TS erro em "wrongPath"
<Each path={K extends ArrayPaths<Fixture>}>... // ❌ TS erro em "customer" (não-array)
```

**Caminhos de implementação:**

1. **Geração ad-hoc**: comando `react-email-bridge gen-types` que lê todas as fixtures e escreve `emails/types.gen.d.ts`. Não roda em watch; usuário roda quando muda fixture.
2. **Generic prop com cast**: `<If<typeof fixture> path="...">` — sem geração, mas usuário tem que importar a fixture.
3. **Zod schema**: usuário descreve fixture com `z.object({...})`, lib infere types + valida runtime + gera `.json` de exemplo. Mais trabalho pro usuário mas mais robusto.
4. **TS plugin / hover**: experimental — language service plugin que entende `.json` adjacente. Mais magic mas custoso.

**Recomendação inicial**: combinar 1 + 3. `gen-types` cobre quem já tem fixtures e quer typing sem reformular; zod schemas pra quem quer canonical source of truth.

**Quando atacar**: depois que o tutorial estiver fluído e a base de testes confiável.

---

### Múltiplos starters via `--template` flag

```bash
pnpm -w run new-project ../sandbox --template vtex-store
pnpm -w run new-project ../sandbox --template generic
pnpm -w run new-project ../sandbox --template mandrill
```

Cada template é uma pasta dentro de `starters/`:

```
starters/
├── default/         # o starter atual (1 email simples)
├── vtex-store/      # TODOS os 13 templates do vtex-email-framework portados + partials
├── generic-hbs/
└── mandrill/        # quando tiver preset Mandrill
```

**Substarefa pesada**: portar os 13 templates do `refs/vtex-email-framework/` pra TSX com partials (logo, html-head, messages/*, package, payment, shipping-summary, totals, address-delivery-title, address-pickup-title) como React components.

**Quando atacar**: junto da v0.2 quando tiver o type inference em play (porque os templates VTEX usam paths complexos como `shippingData.logisticsInfo.0.selectedSla` que se beneficiam muito).

---

### Edição inline de fixture no painel "Data"

Hoje o tab "Data" no code view mostra a fixture read-only. v0.2: tornar editável com:

- JSON parse + validation imediata
- Save direto no `.json` adjacente
- Hot reload já existente dispara re-render no iframe

**Custo**: ~1 dia. Conflito principal: gerenciar diffs vs. edição no IDE (chokidar reage a ambos).

---

### Múltiplas variantes de fixture

`<basename>.<variant>.json` com dropdown na topbar:

- `order-confirmed.brasil.json`
- `order-confirmed.usa.json`
- `order-confirmed.prime-customer.json`

Útil pra testar i18n, edge cases (carrinho vazio, cliente anônimo, preço zero), sem ter que editar a fixture a cada vez.

---

### Presets Liquid e Mailchimp

Mecânica já tá pronta (D1 — sistema de presets). Falta:

- `react-email-bridge/liquid`: componentes `<For>`, `<If>`, `<Case>`, helpers `replace`, `date`, `money_with_currency`, sintaxe `{{ x | filter }}`.
- `react-email-bridge/mailchimp`: merge tags `*|FNAME|*` (diferente sintaxe!), conditional comments `*|IF:FNAME|*`, helpers Mailchimp.

**Cada preset adiciona:** componentes-açúcar específicos, preview runtime com a engine real (`liquidjs`, ou simulador Mailchimp), output com extensão correta.

---

### Watch mode do `pnpm pack-all`

Hoje pra ver mudança no monorepo refletida no projeto de teste:

```bash
pnpm pack-all      # rebuilda tudo, demora ~2min
cd ../sandbox
pnpm install       # re-resolve tarball
```

v0.2: `pnpm pack-all --watch` que repacka incremental quando algo muda em `packages/*/src/`. + a UI vendada apontaria pra `packages/react-email-bridge-ui/.next/` direto (sem tarball), e o core apontaria pra `packages/react-email-bridge/dist/`.

Isso quase elimina o ciclo de pack pra iterar. Trade-off: o starter vira "almost real" mas perde fidelidade pra simulação de install npm.

---

## v0.3+

### ESLint plugin
Avisa quando o usuário usa um helper que **não está documentado como suportado pela plataforma alvo** (configurável via preset).

### Type generation pra schemas externos
Auto-import de schemas VTEX (GetOrder API), Shopify, etc., e injeção como tipo da fixture.

### Editor de fixture WYSIWYG
Forms gerados a partir do schema da fixture. Pra produto/marketing escrever sample data sem entender JSON.

### React Server Components no preview
Editor da UI vendada hoje é Next App Router client-heavy. Migrar partes pra RSC se viável (provavelmente não vale o esforço).

### Plugin do Storybook
Reaproveitar o iframe + sidebar como add-on do Storybook. Outra opção de DX pra times que já vivem em Storybook.

---

## Não-roadmap (descartado intencionalmente)

| Ideia | Por que não |
|---|---|
| Pre-built editor de email "drag-and-drop" | Não é o público. Quem precisa disso já tem Stripo, Bee, Postcards. Nosso valor é code-first. |
| AI para gerar templates | Diferente projeto. Pode ser feature de outro produto. |
| Própria runtime de Handlebars (sem dep) | Reinventar engine maduro = puro custo, zero ganho. |
| Suporte a Vue / Svelte | Foco é React Email; outra ferramenta cobre Vue. |
