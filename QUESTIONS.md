# QUESTIONS.md — Bloco 10 pré-publish review

> Phase 1 (Discovery) do `review-to-release-workflow`. Snapshot tirado em
> 2026-05-17, branch `main` limpa, último commit `5dd6dfa` (Bloco 11 merged).
>
> Release target: **open-source release** (flip pra público no GitHub +
> publish v0.2.0 no npm).

---

## Project Understanding Summary

`react-email-bridge` é um monorepo pnpm com dois pacotes publicáveis
(`react-email-bridge` ~38 KB e `react-email-bridge-ui` ~13 MB vendored Next.js)
mais `examples/`, `starters/`, `validation/`, e `docs/`. 271 arquivos tracked.

Estado atual:

- **Repo privado**, MIT, sem branch protection (free tier não suporta em
  privado). [[repo-visibility]]
- **Ambos pacotes em `0.0.2`**, precisa bump pra `0.2.0` (Bloco 10).
- **9 changesets pendentes** acumulados de Bloco 7 + 11; release.yml ainda
  não tem `publish` wired — só abre a "Version Packages" PR.
- **CI verde**, husky hooks ativos (pre-commit lint-staged + pre-push
  typecheck/validate/build/test), CODEOWNERS / ISSUE_TEMPLATE /
  PULL_REQUEST_TEMPLATE / SECURITY.md / dependabot.yml **ausentes**.
- Quickstart do README inteiro assume **workflow pré-publish** (clone +
  pack-all + new-project com tarballs locais). Pós-publish isso fica
  contraditório.

Categorias de risco identificadas:

1. Metadata de publish incompleta (`author`, `repository`, `homepage`,
   `bugs`, `keywords` ausentes em ambos os pacotes).
2. Inconsistências entre os dois pacotes (`LICENSE` vs `license.md`, dep
   duplicada, falta de `README` no tarball do `-ui`).
3. Docs internas-leaning visíveis após flip (CLAUDE.md, PATCHES, VENDORING,
   docs/agents/, STATUS marcado como stale, DECISIONS frozen).
4. Starter scaffolds com versão hardcoded (`react-email-bridge-0.0.1.tgz`)
   e workflow vendor-tarball ainda dominante.
5. Governance OSS (CODEOWNERS, templates, SECURITY) inexistente.
6. PII / workplace name em `CLAUDE.md`, `NOTICE.md`, `DECISIONS.md` —
   intencional ou aparado?

---

## How to Answer

Responda inline abaixo de cada bloco com um dos tags:

- `[INTENDED]` — comportamento atual é proposital, não muda nada
- `[BUG]` — está errado, conserta agora
- `[APPROVED]` — melhoria aprovada pra este workflow run (Phase 2 implementa)
- `[DEFERRED]` — melhoria válida mas adiada
- `[OUT-OF-SCOPE]` — não cabe neste run
- `[BLOCKED]` — não dá pra decidir agora

Respostas vagas ("talvez", "decide depois") bloqueiam Phase 2.

---

## Questions

### 1. Repo Visibility & OSS Governance

#### Q1. Flipar visibilidade pra público antes ou depois do publish?

- **Where:** GitHub repo settings · [[repo-visibility]]
- **Why this matters:** define a ordem das etapas. Public-first dá histórico
  imediato visível (commits, PRs, todo o passado de Bloco 7+11). Publish-first
  publica o pacote sem source visível, depois flipa.
- **Question:** ordem proposta?
- **Recommended:** **flip primeiro**, depois publish. Motivos:
  (a) ativa o ruleset de branch protection que já existe inativo (per memória),
  protegendo `main` antes de aparecer no `npm`;
  (b) o `npm` página vai apontar pra um repo público (URL no `repository` field
  da package.json funciona);
  (c) consumidores que clicam "View source" no npm encontram um repo real.
- **Answer:[APPROVED]**

#### Q2. Quais arquivos de governance OSS criar agora?

- **Where:** `.github/` (vazia exceto workflows)
- **Why this matters:** projeto público sem CODEOWNERS, sem template de issue,
  sem `SECURITY.md`, sem `dependabot.yml`. Cada um adiciona uma camada de
  hygiene esperada por contributors de OSS.
- **Question:** quais criar agora vs adiar?
- **Recommended:** criar agora (todos triviais):

  - `.github/CODEOWNERS` — `* @marcoferreiradev` (uma linha).
  - `.github/ISSUE_TEMPLATE/bug.yml` + `feature.yml` (forms simples).
  - `.github/PULL_REQUEST_TEMPLATE.md` — checklist curta (changeset adicionado?
    tests passando? docs atualizados?).
  - `SECURITY.md` (root) — email pra disclosure, política simples.
  - `.github/dependabot.yml` — auto-PR semanal pra deps npm.

  Adiar: `FUNDING.yml`, `STALE.yml`, `CONTRIBUTING_CODE_OF_CONDUCT.md`
  (overkill pra projeto solo).
- **Answer: [APPROVED]**

#### Q3. Branch protection ruleset — recriar ou usar o draft que já existe?

- **Where:** GitHub Settings → Rules → Rulesets · [[repo-visibility]]
- **Why this matters:** memória diz que um ruleset pode existir inativo
  (warning "won't be enforced on this private repository" apareceu uma vez).
  Se sim, ele auto-ativa no flip.
- **Question:** confirmar no Settings → Rules → Rulesets se existe. Se
  existir, o que ele bloqueia? Se não existir, criar com qual escopo?
- **Recommended:** criar (ou confirmar) ruleset em `main` com:
  - Require pull request (1 approver — ou 0 se author solo, mas force PR)
  - Require status check: `test` (job name do `ci.yml`)
  - Block force push
  - Restrict deletions
- **Answer: [DEFERRED], existe e so esta inativa**

---

### 2. NPM Publish Metadata

#### Q4. Completar campos faltantes em `react-email-bridge/package.json`?

- **Where:** `packages/react-email-bridge/package.json`
- **Why this matters:** os campos `author`, `repository`, `homepage`,
  `bugs`, `keywords` estão ausentes. `npm publish` funciona mas a página
  do pacote fica nua (sem "Repository" link na sidebar, sem keywords
  pra busca, sem author).
- **Question:** adicionar?
- **Recommended:** **sim**, adicionar:
  ```json
  "author": "Marco Ferreira <mw.marcowilliam@gmail.com>",
  "repository": { "type": "git", "url": "git+https://github.com/marcoferreiradev/react-email-bridge.git" },
  "homepage": "https://github.com/marcoferreiradev/react-email-bridge#readme",
  "bugs": { "url": "https://github.com/marcoferreiradev/react-email-bridge/issues" },
  "keywords": ["react-email", "handlebars", "vtex", "transactional-email", "mandrill", "mailchimp", "template", "preview"]
  ```

  Confirmar email pra usar publicamente.
- **Answer: marcoferreiradev@gmail.com**

#### Q5. Mesmo tratamento pro `react-email-bridge-ui`?

- **Where:** `packages/react-email-bridge-ui/package.json`
- **Why this matters:** mesmo problema, mais um issue extra: `react-email`
  aparece tanto em `dependencies` quanto em `devDependencies` (linhas 18 e 32).
- **Question:** adicionar metadata + remover a dup?
- **Recommended:** **sim** + remover a duplicação (manter em `dependencies`
  porque é peer/runtime). Os campos `repository`/`bugs`/`homepage` apontam
  pro mesmo repo, com `directory: "packages/react-email-bridge-ui"`.
- **Answer: [APPROVED]**

#### Q6. Unificar nome do arquivo de licença?

- **Where:** `LICENSE` (root, uppercase) vs `packages/react-email-bridge-ui/license.md` (lowercase)
- **Why this matters:** inconsistência puramente cosmética mas visível no
  npm tarball. Vem do upstream `@react-email/ui`.
- **Question:** normalizar?
- **Recommended:** renomear `license.md` → `LICENSE` no `-ui` package
  pra alinhar com convenção (npm reconhece `LICENSE`/`LICENCE`/`license.md`
  igual, mas uniformidade ajuda). Atualizar `files` array do package.json
  do `-ui` e o PATCHES.md se for considerado patch.
- **Answer: [APPROVED]**

#### Q7. Incluir um README mínimo no tarball do `react-email-bridge-ui`?

- **Where:** `packages/react-email-bridge-ui/readme.md` (existe, mas o
  `files` array do package.json não inclui)
- **Why this matters:** package no npm sem README mostra "This package
  does not have a README". O `-ui` é instalado on-demand pelo CLI principal,
  então é "invisível" pro user, mas aparece no npm registry.
- **Question:** incluir? Conteúdo atual do `readme.md` é o upstream — escrever
  um próprio explicando "isto é uma engrenagem do react-email-bridge"?
- **Recommended:** sobrescrever `readme.md` com 5 linhas dizendo:
  "Live preview server for `react-email-bridge`. You probably want to install
  [`react-email-bridge`](https://npmjs.com/package/react-email-bridge) instead.
  Forked from `@react-email/ui` (MIT)." E adicionar `"readme.md"` ao `files` array.
- **Answer: [APPROVED]** 

---

### 3. Versioning & Changesets

#### Q8. Criar changeset não-vazio pra v0.2.0 — como agrupar?

- **Where:** `.changeset/` (9 changesets pendentes — todos `-empty` patches
  de Bloco 7 + 11)
- **Why this matters:** os 9 changesets existentes são todos patch bumps
  vazios. Pra ir de `0.0.2` → `0.2.0` precisa de pelo menos um changeset
  `minor` em ambos pacotes. Os existentes podem ser consolidados ou mantidos
  como histórico granular.
- **Question:** estratégia?
- **Recommended:** **manter os existentes** (são history-friendly) + adicionar
  UM novo changeset `bloco-7-11-v0-2-0.md` com:
  ```md
  ---
  "react-email-bridge": minor
  "react-email-bridge-ui": minor
  ---

  v0.2.0 — first npm release. Includes 13 VTEX templates ported,
  Halo-Tailwind modernization, fixture-based preview, full HBS preset.
  See CHANGELOG for cumulative detail since 0.0.1.
  ```

  Esse vira o changeset "header" do release.
- **Answer: [APPROVED]** 

#### Q9. Wire `publish: pnpm changeset publish` em `release.yml` agora?

- **Where:** `.github/workflows/release.yml:46-53`
- **Why this matters:** o comentário no YAML já cita "Bloco 10" como o
  momento de adicionar isso.
- **Question:** confirmar o patch exato do release.yml?
- **Recommended:** mesma forma da memória [[handoff-bloco-10]]:
  ```yaml
  - name: Create Version Packages PR / publish
    uses: changesets/action@v1
    with:
      version: pnpm changeset version
      publish: pnpm changeset publish
      commit: 'chore: version packages'
      title: 'chore: version packages'
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
  ```

  Pré-req: adicionar `NPM_TOKEN` em Settings → Secrets → Actions com
  automation-token do npmjs.com com permissão publish nos dois pacotes.
- **Answer: [APPROVED]**

---

### 4. Repo Cleanup (remover / mover / .gitignore)

#### Q10. Validation PNGs órfãs no working tree (~8 MB locais)

- **Where:** `validation/ui-*.png` (32 arquivos, ~8 MB total)
- **Why this matters:** estão **gitignoradas** (via `validation/*.png`),
  então não estão tracked. Mas poluem o working tree e podem confundir
  contributors que rodam `ls validation/` e veem screenshots aleatórios.
- **Question:** apagar localmente? Mover pra `validation/screenshots/` ou
  `.local/`?
- **Recommended:** apagar localmente (`rm validation/ui-*.png`). Já
  ignoradas, nada se perde no histórico. Se útil pra docs futuras, mover
  pra `docs/screenshots/` *e* trackear. Pra Bloco 10, basta o `rm`.
- **Answer: [APPROVED]**

#### Q11. Workflow de starter `file:./vendor/*.tgz` — manter ou migrar pra npm?

- **Where:** `starters/default/package.json:13-14`, `starters/vtex-full/package.json:13-14`
- **Why this matters:** os starters referenciam `file:./vendor/react-email-bridge-0.0.1.tgz`
  com versão hardcoded `0.0.1`. Pós-publish, a UX correta de bootstrap deveria
  ser `^0.2.0` do registry, não tarballs locais. Mantendo tarballs:
  fluxo `clone repo + pack-all + new-project` continua funcionando (útil pra
  dev offline). Migrando pra registry: bootstrap usa `npm install` normal,
  starter fica leve, vendor/ desaparece.
- **Question:** plano?
- **Recommended:** **migrar starters pra registry** após confirmar o publish:

  - Trocar `file:./vendor/react-email-bridge-X.tgz` → `^0.2.0`
  - Remover `pnpm.overrides` block (não precisa mais)
  - Apagar `vendor/.gitkeep` (vendor folder não existe mais)
  - Atualizar `scripts/new-project.mjs` pra não copiar `vendor/` e rodar
    `pnpm install` puro
  - Mas: manter `pnpm pack-all` script disponível pra dev / smoke tests
    (CI ainda usa pra validar tarball estrutural).

  Alternativa mais conservadora: deixar v0.2.0 saindo no fluxo legacy
  (tarballs locais) e migrar pra registry em v0.2.1.
- **Answer: [APPROVED]** 

#### Q12. Pnpm-lock.yaml + duplicação `allow-build` nos `.npmrc` de starter

- **Where:** `starters/default/.npmrc`, `starters/vtex-full/.npmrc`
- **Why this matters:** cada `.npmrc` lista `allow-build=esbuild`,
  `allow-build=sharp`, `allow-build=highlight.js` duas vezes (linhas 1-3 e
  4-6 idênticas). Cosmético, sem impacto funcional.
- **Question:** dedupar?
- **Recommended:** sim, dedupar (1 minuto).
- **Answer: [APPROVED]**

#### Q13. Root `package.json` carrega app-deps (`handlebars`, `juice`, `react-email`…)

- **Where:** `package.json` (root, `private: true`)
- **Why this matters:** o root é `private: true` (não publicável) mas tem
  ~15 deps duplicadas dos packages. Provavelmente porque
  `validation/test-pipeline.tsx` roda no root e importa essas libs. É
  funcional mas atípico — normalmente o validation script viraria um
  subpackage (`packages/validation/`) ou o validation seria executado pelo
  workspace package que tem as deps.
- **Question:** intencional? Mover validation pra subpackage?
- **Recommended:** **manter como está** ([INTENDED]) — é dev infra de
  smoke test, não user-facing. Migrar pra subpackage seria over-engineering
  pra um arquivo. Adicionar comentário no root package.json explicando.
- **Answer: [INTENDED]** 

---

### 5. Docs (rewrite + internal/external classification)

#### Q14. README quickstart — rewrite pra fluxo npm publish?

- **Where:** `README.md:54-145` (seção "Quickstart")
- **Why this matters:** a quickstart inteira está condicionada a
  "Until react-email-bridge is published to npm, the workflow uses local
  tarballs". Pós-publish isso vira mentira; o quickstart correto é
  `npm create react-email-bridge@latest my-emails` ou
  `npx react-email-bridge init my-emails`.
- **Question:** rewrite total ou só adicionar "Option A (recommended)
  npm install / Option B (local dev) tarball flow"?
- **Recommended:** **rewrite total** com fluxo npm como primário e o fluxo
  tarball local movido pra `CONTRIBUTING.md` (já é onde contributors locais
  procuram). Inclui:

  - Install: `npm install react-email-bridge` ou `pnpm add react-email-bridge`
  - Bootstrap: `npx react-email-bridge init my-emails`
  - Dev: `cd my-emails && npx react-email-bridge dev`
  - Export: `npx react-email-bridge export --all`

  Também atualizar:

  - badge "status: pre-release v0.1" → npm version badge ou apagar
  - linha de install no topo
- **Answer: [INTENDED]**

#### Q15. STATUS.md está "stale" (per memória) — apagar, mover, ou atualizar?

- **Where:** `STATUS.md` (340 linhas)
- **Why this matters:** memória [[handoff-bloco-10]] flagou que diz "v0.1
  shippable" e está desatualizado (Bloco 7 + 11 já entraram). Outsider lê
  isso primeiro e fica confuso sobre maturidade.
- **Question:** apagar, atualizar pra v0.2, ou mover pra `docs/internal/`?
- **Recommended:** **mover pra `docs/internal/snapshots/STATUS-v0.1.md`**
  como artefato histórico. Ele é útil como dev notes mas não user-facing.
  Substituir por nada no root (README já cobre o que existe). Se quiser
  manter no root, atualizar headline pra "v0.2.0 — first npm release".
- **Answer:acho que ele é algo local e nao para surface user [APPROVED]**

#### Q16. CLAUDE.md fica visível público — apara ou mantém?

- **Where:** `CLAUDE.md:32` ("Author: Marco Ferreira") e `CLAUDE.md:89`
  ("Marco Ferreira, VTEX developer at Oficina Reserva. Prefers to
  understand the 'why' before applying changes...")
- **Why this matters:** o arquivo é instruction-set pra agente Claude
  Code mas vira público após flip. Conteúdo é razoável (project identity
  + rules + canonical files), mas a "About the author" expõe workplace
    e preferências de comunicação que podem não ser desejadas em público.
- **Question:** manter integralmente, aparar a seção "About the author",
  ou mover instruções de agente pra `.claude/CLAUDE.md` (gitignored)?
- **Recommended:** **aparar a "About the author"** pra ficar mais formal
  (sem workplace, sem behavioral notes). Manter o resto público — é útil
  pra outros desenvolvedores entenderem o projeto. Alternativa: split em
  dois — `CLAUDE.md` (público, project facts) + `.claude/notes.md` (privado,
  agent-specific tone notes).
- **Answer: [APPROVED]**

#### Q17. NOTICE.md — referência a `email-templates-oficina` privado

- **Where:** `NOTICE.md:57-58`
- **Why this matters:** "private real-world reference (Oficina Reserva,
  used by author with permission)" — menciona workplace explicitamente.
  Confirmar que esse mention foi autorizado pelo Oficina Reserva
  (e que "with permission" cobre tornar isso público).
- **Question:** essa autorização existe formalmente? Aparar pra "private
  real-world reference (used by author with permission)" sem nomear o
  empregador?
- **Recommended:** **aparar pra forma anônima** se a permissão foi verbal
  ou implícita. Manter forma nomeada se houve autorização explícita por
  escrito.
- **Answer: estou achando que notice pode ser local only, por que as refs nem vao para main publica**

#### Q18. Docs internas-leaning (DECISIONS, PATCHES, VENDORING, docs/agents/, ROADMAP)

- **Where:** root e `docs/agents/`
- **Why this matters:** essas docs são úteis pra contributors mas podem
  parecer "ruído interno" pra outsider que clica no root. Decisão é
  estética/discoverability.
- **Question:** layout?
  - (a) Manter tudo no root (transparência radical, status quo)
  - (b) Mover internal-leaning pra `docs/internal/` (root fica limpo:
    README + CONTRIBUTING + LICENSE + NOTICE + ROADMAP)
  - (c) Híbrido: manter no root mas adicionar `docs/README.md` que
    explica quem deveria ler o quê
- **Recommended:** **(c) híbrido** — minimal change, máxima orientação.
  Criar `docs/README.md` com tabela "se você é {user, contributor, agent},
  leia {X, Y, Z}".
- **Answer: [APPROVED]**

#### Q19. ROADMAP.md ainda lista "Tipagem inferida de fixture" como v0.2 mas a memória diz que foi despriorizado

- **Where:** `ROADMAP.md` (linhas 1-45)
- **Why this matters:** ROADMAP diz "v0.2 (próxima janela)" e descreve a
  tipagem como killer feature. Memória [[handoff-bloco-10]] diz que foi
  "deprioritized" e movido pra v0.3+. Conflito doc vs realidade.
- **Question:** atualizar ROADMAP?
- **Recommended:** **sim**, reescrever a estrutura como:
  - v0.2 (atual) = Bloco 7 templates + Bloco 11 Halo + npm publish (= o que
    realmente saiu)
  - v0.3+ = tipagem inferida, ESLint plugin, Storybook plugin, mais starters
- **Answer: [APPROVED] mas estou pensando roadmap deveria ser publico?  como so eu trabalho nao deveria ser local only?**

---

### 6. CI / Hooks / Pre-publish gates

#### Q20. Adicionar `prepublishOnly` ou `prepack` em ambos os pacotes?

- **Where:** `packages/*/package.json` (scripts)
- **Why this matters:** `pnpm publish` chama o `build` por convenção? Não
  necessariamente. Sem `prepublishOnly`, é fácil publicar sem build atual
  (dist obsoleto vai pro registry).
- **Question:** adicionar?
- **Recommended:** **sim**, adicionar `"prepublishOnly": "pnpm build"` em
  `react-email-bridge` (e equivalente em `-ui` se o build dele for esperado
  rodar antes de publish). Cinto de segurança pequeno.
- **Answer: [APPROVED]**

#### Q21. Pre-commit hook poderia bloquear `.env*` e arquivos grandes?

- **Where:** `.husky/pre-commit` (apenas roda `lint-staged`)
- **Why this matters:** projeto público ⇒ erro de commitar `.env` ou
  binário grande tem custo alto (visível no histórico, custo pra remover).
  Atualmente nenhum gate.
- **Question:** endurecer? Quanto?
- **Recommended:** adicionar **check leve** (regex grep) pré-commit:
  ```sh
  if git diff --cached --name-only | grep -E '\.env(\.local)?$|\.pem$|\.key$'; then
    echo "❌ Sensitive file detected. Use --no-verify if intentional."; exit 1
  fi
  ```

  Block de tamanho (`git diff --cached --numstat | awk '$1 > 5000'`) é mais
  controverso — pula.
- **Answer: [APPROVED]**

#### Q22. CI roda em `push` e `pull_request` (workflow ci.yml). Mas roda em forks de PR?

- **Where:** `.github/workflows/ci.yml:3-5`
- **Why this matters:** projeto público vai receber PRs de fork. O trigger
  `pull_request` (sem `_target`) roda CI **com o código do fork**, o que é
  o normal mas significa que workflows de release / publish devem ser
  protegidos contra rodar em PR de fork.
- **Question:** já está protegido? Confirmar que `release.yml` só roda em
  `push: branches: [main]` (não em PR) — sim, está. OK pra prosseguir?
- **Recommended:** **OK pra prosseguir** ([INTENDED]). `release.yml` está
  com escopo seguro. Documentar isso em comentário no ci.yml seria nice-to-have.
- **Answer:INTENDED]**

---

### 7. Distribution / Consumer-facing

#### Q23. Validar publish end-to-end antes de tornar oficial?

- **Where:** workflow externo
- **Why this matters:** depois que `0.2.0` sai pro npm registry, não dá
  pra apagar (só unpublish dentro de 72h, e mesmo assim deixa pegada).
- **Question:** publicar como `0.2.0-rc.0` primeiro pra validar?
- **Recommended:** **sim**, plano de duas etapas:

  1. Bump pra `0.2.0-rc.0` via changeset com pre-release flag, publish,
     `npm create react-email-bridge@rc my-test`, validar fluxo limpo.
  2. Se OK, sair do pre-release mode e publish `0.2.0` final.

  Custo: ~30min extra. Reduz risco de "0.2.0 bugado no registry pra sempre".
  Alternativa mais arrojada: publish `0.2.0` direto e bump pra `0.2.1` se
  algo der errado nos primeiros dias.
- **Answer: Alternativa mais arrojada: publish `0.2.0` direto e bump pra `0.2.1` se
  algo der errado nos primeiros dias.**

#### Q24. `dist-tarballs/` mencionado no `.gitignore` mas script `pack-all` continua relevante?

- **Where:** `package.json:scripts.pack-all` + `.gitignore` linha `dist-tarballs/`
- **Why this matters:** se Q11 migrar starters pra registry, o `pack-all`
  vira ferramenta só de smoke test (CI usa). Útil manter mas deixar claro
  que não é a maneira normal de instalar.
- **Question:** manter? Renomear?
- **Recommended:** **manter o script** (CI depende), mas atualizar a
  description em CONTRIBUTING.md como "internal smoke test only — users
  install from npm".
- **Answer: [APPROVED]**

---

### 8. Suspicious / Possible Bugs

#### Q25. `validation/screenshots/.gitignore` é o único arquivo da pasta — placeholder?

- **Where:** `validation/screenshots/.gitignore`
- **Why this matters:** convenção pra preservar uma pasta vazia no git.
  Mas seu propósito ("aqui vão screenshots de regressão visual") nunca
  foi materializado.
- **Question:** apagar a pasta ou usar pra algo?
- **Recommended:** **apagar a pasta inteira** ([APPROVED]). Pasta vazia
  sem uso documentado polui.
- **Answer: [APPROVED]**

#### Q26. Examples têm `CHANGELOG.md` (do changesets) mas são `private: true`

- **Where:** `examples/vtex-store/CHANGELOG.md`, `examples/generic-hbs/CHANGELOG.md`,
  `packages/react-email-bridge-ui/CHANGELOG.md`, `packages/react-email-bridge/CHANGELOG.md`
- **Why this matters:** changesets gera CHANGELOG.md em **todos os
  workspace packages** que recebem bump, incluindo examples privados.
  Não quebra nada, mas polui examples com um CHANGELOG que nunca será
  publicado nem lido.
- **Question:** configurar `changesets/config.json` pra ignorar examples?
- **Recommended:** adicionar `"ignore": ["example-vtex-store", "example-generic-hbs"]` em `.changeset/config.json`. Apagar os CHANGELOG.md
  existentes (vão regerar limpos no próximo run).
- **Answer: esses exemples me parece errado, vtex-store nao deveria ser um dos starters que hoje é "vtex-full" ?**

---

### 9. Missing Decisions / Open Design Gaps

#### Q27. Política de versionamento pra `-ui` package

- **Where:** `packages/react-email-bridge-ui/package.json`
- **Why this matters:** o `-ui` é peça interna ("installed on-demand by
  `react-email-bridge dev`"). Hoje versiona junto com o core via changeset.
  Mas semanticamente são unidades distintas. Vincular versões (`fixed`
  no changeset config) ou deixar livre (cada um bumpa sob demanda)?
- **Question:** preferência?
- **Recommended:** **manter livre** (sem `fixed`) — é o que faz hoje,
  funciona, e dá flexibilidade quando só `-ui` precisa de patch. Mas
  considerar `linked` (versions stay in sync but only when both bump no
  mesmo changeset) se quiser garantir compat.
- **Answer: [APPROVED]**

#### Q28. Post-publish: criar GitHub Release manualmente ou deixar pro changesets?

- **Where:** `changesets/action@v1` quando `publish:` está wired
- **Why this matters:** changesets/action cria GitHub Releases
  automaticamente quando `publish` é executado com sucesso. Bom default,
  mas pode querer o `0.2.0` release com release notes mais elaboradas que
  o auto-gerado.
- **Question:** deixar automático e depois editar, ou desabilitar e
  escrever à mão?
- **Recommended:** **deixar automático**, editar release notes do `v0.2.0`
  depois (one-time gesture) pra ficar mais bonito. Próximos releases
  patches podem usar o auto-gerado direto.
- **Answer: [APPROVED]**

---

## Suggested answer tags

- `[INTENDED]` — current behavior is intentional, leave unchanged
- `[BUG]` — current behavior is incorrect, fix now
- `[APPROVED]` — improvement approved for implementation in this run
- `[DEFERRED]` — valid improvement, postponed
- `[OUT-OF-SCOPE]` — not part of this workflow run
- `[BLOCKED]` — cannot decide yet (missing info / external dep)
