# CLAUDE.md

Guia para o Claude Code (claude.ai/code) ao trabalhar neste repositório.

## Visão geral

**ALL_dOcS** — gerador de documentos clínicos da **Associação Allos** (associação civil sem fins lucrativos, CNPJ 50.990.346/0001-52). App single-page React/Vite com 5 documentos:

1. **Contrato — Adulto** (atendimento psicológico online)
2. **Contrato — Crianças e Adolescentes** (idem, com cláusulas adicionais para responsável legal)
3. **Atestado psicológico** (Res. CFP 06/2019)
4. **Termo de autorização** (Res. CFP 13/2022 — psicoterapia de menores)
5. **Formulário de encaminhamento** (Manual CFP 2025)

Todos os documentos refletem o **modelo institucional Allos**: terapeuta vinculado(a), com supervisão técnica de psicólogo(a) com CRP ativo. Em documentos clínicos (atestado, termo, encaminhamento) o(a) supervisor(a) é o(a) signatário(a) tecnicamente responsável; o(a) terapeuta aparece como quem conduziu o atendimento (campo opcional).

Conteúdo em pt-BR.

## Comandos

- `npm run dev` — Vite dev server com HMR
- `npm run build` — build de produção em `dist/`
- `npm run preview` — preview local do build
- `npm run lint` — ESLint

## Deploy

GitHub Actions (`.github/workflows/deploy.yml`) faz build e deploy ao GitHub Pages a cada push em `main`. URL final: `https://v-rogana.github.io/all-docs/`.

Vite `base` está fixado em `/all-docs/` para casar com o subpath do Pages.

## Arquitetura

App single-file. Quase tudo vive em `src/app.jsx`:

- **Constantes** — `C` (paleta Allos: cream/teal/terracota/sage), `ALLOS_INST` (CNPJ, endereço, foro fixos)
- **Por documento** — `DEFAULT_*` (estado inicial), `FIELDS_*` (grupos de campos do formulário), `render*` (HTML do papel), e em alguns docs `META_*` (Quando usar / Quem pode solicitar / Vedações / Base legal)
- **Helpers** — `valorPorExtenso`, `mesesPorExtenso`, `sec`/`p`/`center`/`sigBlock`/`docHeader` (helpers de HTML)
- **Exporters** — `exportPDF` (abre janela com print), `exportDOCX` (blob Word-compatible)
- **Componentes** — `AllDocsLogo` / `AllDocsMark` (logo letra-a-letra teal+terracota), `Field` (input/textarea), `ActionBtn` (rounded-full, estilo CTA Allos), `MetaPanel`/`MetaItem` (card de orientação clínica), `DocPaper`, `DocEditor` (form + preview), `SidebarItem`, `App`

## Adicionando um novo documento

1. Defina `DEFAULT_NOVO_DOC` (objeto com campos vazios)
2. Defina `FIELDS_NOVO_DOC` (array de grupos `{title, icon, fields:[{id,label,ph,type?}]}`)
3. (Opcional) `META_NOVO_DOC = { quando, quem, vedacoes?, baseLegal }`
4. Implemente `renderNovoDoc(d)` retornando string HTML usando os helpers
5. No `App`: adicione `useState`, um caso novo no `<SidebarItem>` e um `view ===` com `<DocEditor>`

Toda a estética (paleta, tipografia, layout do papel) é compartilhada via `DocEditor` — não precisa replicar nada.

## Estilo

- **Paleta** alinhada ao site allos.org.br: cream `#FDFBF7`, sidebar teal-bg `#0D3B36`, teal `#2E9E8F` (CTA primário), terracota `#E07A5F` (acento), sage `#2D6A4F` (cabeçalhos de seção dos documentos)
- **Tipografia** Fraunces (serif, títulos) + DM Sans (corpo); Georgia/Times para o papel impresso
- **Logo ALL_dOcS** — maiúsculas em teal, `_dc` em terracota com `d`/`c` em itálico (eco do estilo italic do site)
- Estilos inline (sem CSS files); `@import` do Google Fonts no topo do bloco `css`
- ESLint com `varsIgnorePattern: '^[A-Z_]'`

## Dados institucionais

Constantes em `ALLOS_INST` no topo de `src/app.jsx` (CNPJ, endereço, foro). Alterar lá propaga para todos os documentos.
