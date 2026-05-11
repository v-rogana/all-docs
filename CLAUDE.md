# CLAUDE.md

Guia para o Claude Code neste repositório.

## O que é

**ALL_dOcS** — gerador de documentos clínicos da Associação Allos (CNPJ 50.990.346/0001-52). React/Vite single-page, conteúdo em pt-BR. Cinco documentos: contrato adulto, contrato menores, atestado psicológico (CFP 06/2019), termo de autorização (CFP 13/2022) e formulário de encaminhamento (Manual CFP 2025).

Modelo institucional: terapeuta vinculado(a) + supervisor(a) com CRP ativo. Em documentos clínicos, o(a) supervisor(a) assina como responsável técnico.

## Comandos

- `npm run dev` — dev server (HMR)
- `npm run build` — produção em `dist/`
- `npm run preview` — preview do build
- `npm run lint` — ESLint

Deploy: push em `main` aciona `.github/workflows/deploy.yml` → GitHub Pages. `vite.config.js` usa `base: '/all-docs/'`.

## Arquitetura

Quase tudo vive em `src/app.jsx`:

- **`C`** — paleta (cream/teal/terracota/sage)
- **`ALLOS_INST`** — CNPJ, endereço, foro
- Por documento: `DEFAULT_*` (estado), `FIELDS_*` (form), `render*` (HTML), e às vezes `META_*` (orientação clínica)
- Helpers de HTML: `sec`, `p`, `center`, `sigBlock`, `docHeader`
- Exporters: `exportPDF` (print window) e `exportDOCX` (blob Word-compatible)
- Componentes: `DocEditor` (form + preview), `Field`, `ActionBtn`, `MetaPanel`, `App`

## Adicionar um documento

1. `DEFAULT_NOVO` — estado inicial
2. `FIELDS_NOVO` — grupos `{title, icon, fields:[{id,label,ph,type?}]}`
3. (opcional) `META_NOVO`
4. `renderNovo(d)` — string HTML usando os helpers
5. No `App`: `useState`, item no sidebar e `view ===` com `<DocEditor>`

## Estilo

Estilos inline; Fraunces (títulos) + DM Sans (corpo); Georgia/Times no papel impresso. ESLint com `varsIgnorePattern: '^[A-Z_]'`.

Dados institucionais centralizados em `ALLOS_INST` — alterar lá propaga para todos os documentos.
