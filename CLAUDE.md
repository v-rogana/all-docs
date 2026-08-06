# CLAUDE.md

Guia para o Claude Code neste repositório.

## O que é

**ALL_dOcS** — gerador de documentos da Associação Allos (CNPJ 50.990.346/0001-52). React/Vite single-page, conteúdo em pt-BR.

Duas áreas:

- **Documentos clínicos** (aberta) — contrato adulto, contrato menores, atestado psicológico (CFP 06/2019), termo de autorização (CFP 13/2022), formulário de encaminhamento (Manual CFP 2025) e declaração de comparecimento.
- **Estágios e contratos** (senha `ariane`) — cadastro de estagiários, supervisores, faculdades e prestadores; gera TCE (Lei 11.788/2008) e contrato de prestação de serviços; modelos de e-mail para as faculdades.

Modelo institucional: terapeuta vinculado(a) + supervisor(a) com CRP ativo. Em documentos clínicos, o(a) supervisor(a) assina como responsável técnico.

## Comandos

- `npm run dev` — dev server (HMR)
- `npm run build` — produção em `dist/`
- `npm run preview` — preview do build
- `npm run lint` — ESLint

Deploy: push em `main` aciona `.github/workflows/deploy.yml` → GitHub Pages. `vite.config.js` usa `base: '/all-docs/'`.

## Arquitetura

```
src/core.js          paleta C, ALLOS_INST, ALLOS_REP, helpers de HTML e datas, exportadores
src/ui.jsx           ActionBtn, MiniBtn, DocPaper, Pill
src/app.jsx          documentos clínicos + sidebar + App (raiz)
src/estagios/store.js  esquemas de campo, persistência localStorage, CSV/JSON, alertas
src/estagios/docs.js   renderTCE, renderPrestacao, MODELOS_EMAIL
src/estagios/ui.jsx    gate de senha, abas, tabelas, formulários, visor de documento
```

**`core.js`** — `C` (paleta cream/teal/terracota/sage), `ALLOS_INST` (CNPJ, endereço, foro),
`ALLOS_REP` (representante legal que assina os instrumentos institucionais),
helpers de HTML (`sec`, `p`, `center`, `paras`, `ul`, `sigBlock`, `docHeader`, `esc`),
de data (`dataBR`, `dataExtenso`, `diasAte`, `addMeses`) e de número (`valorPorExtenso`,
`mesesPorExtenso`); exportadores `exportPDF` (print window) e `exportDOCX` (OOXML real).

**`app.jsx`** — por documento clínico: `DEFAULT_*` (estado), `FIELDS_*` (form),
`render*` (HTML) e às vezes `META_*` (orientação clínica). Componentes `DocEditor`,
`Field`, `MetaPanel`, `SidebarItem`, `App`.

## Adicionar um documento clínico

1. `DEFAULT_NOVO` — estado inicial
2. `FIELDS_NOVO` — grupos `{title, icon, fields:[{id,label,ph,type?}]}`
3. (opcional) `META_NOVO`
4. `renderNovo(d)` — string HTML usando os helpers de `core.js`
5. No `App`: `useState`, item no sidebar (e no `MobileSidebarOverlay`) e `view ===` com `<DocEditor>`

## Área de estágios

Os dados vivem **só no localStorage** (`alldocs.estagios.v1`) — nada vai para servidor.
A senha (`SENHA` em `estagios/ui.jsx`, guardada em `sessionStorage`) evita abertura
acidental; não é segurança, já que o bundle é público. Saída de dados é sempre explícita:
Exportar JSON (backup/compartilhar) ou CSV (Excel/Sheets).

Adicionar um campo a uma entidade: basta incluí-lo em `CAMPOS_*` (`store.js`) — o formulário,
o `registroVazio` e a validação de obrigatórios se ajustam sozinhos. Tipos aceitos:
texto, `date`, `number`, `email`, `textarea`, `check`, `select-status`,
`select-faculdade`, `select-supervisor`, `select-estagiario`.

O TCE renumera as cláusulas conforme a faculdade: as cláusulas específicas dela entram
antes do foro, e o anexo de plano de atividades só aparece se `exigePlano` estiver marcado.
Campos vazios saem no papel como `[marcador]` destacado, para não assinar contrato com lacuna.

## Estilo

Estilos inline; Fraunces (títulos) + DM Sans (corpo); Georgia/Times no papel impresso.
A área de estágios usa classes (`ESTAGIOS_CSS`, concatenado ao `css` global no `App`)
porque tem tabelas. ESLint com `varsIgnorePattern: '^[A-Z_]'`; a regra
`react-hooks/static-components` proíbe declarar componentes dentro do render.

Dados institucionais centralizados em `ALLOS_INST` / `ALLOS_REP` — alterar lá propaga para todos os documentos.
