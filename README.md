# ALL_dOcS

Gerador de documentos clínicos da **Associação Allos**. App React/Vite single-page que monta cinco documentos no modelo institucional (terapeuta + supervisor com CRP ativo):

- Contrato — Adulto
- Contrato — Crianças e Adolescentes
- Atestado psicológico (CFP 06/2019)
- Termo de autorização (CFP 13/2022)
- Formulário de encaminhamento (Manual CFP 2025)

## Comandos

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
npm run lint
```

## Deploy

Push em `main` → GitHub Actions faz build e publica em https://v-rogana.github.io/all-docs/.
