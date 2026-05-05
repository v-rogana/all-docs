# ALL_dOcS

Gerador de documentos clínicos da **Associação Allos** — contratos terapêuticos, atestado psicológico, termo de autorização e formulário de encaminhamento, todos no modelo institucional com supervisão clínica continuada.

App React/Vite single-page. Estética alinhada ao site [allos.org.br](https://allos.org.br): cream + teal + terracota, Fraunces/DM Sans, papel sereno no centro da tela.

## Documentos disponíveis

| Documento | Quando usar | Base legal |
|-----------|-------------|------------|
| Contrato — Adulto | Início de psicoterapia online com pessoa adulta | CFP 010/2005 · 011/2018 |
| Contrato — Crianças e Adolescentes | Início de psicoterapia online com menor de idade | CFP 010/2005 · 011/2018 · ECA |
| Atestado psicológico | Justificar faltas, atestar aptidão, afastamento | CFP 06/2019 |
| Termo de autorização | Antes de iniciar psicoterapia de menor de 18 anos | CFP 13/2022 |
| Formulário de encaminhamento | Encaminhar usuário(a) a serviço externo | Manual CFP 2025 |

Em todos os documentos clínicos o(a) supervisor(a) (psicólogo(a) com CRP ativo) é o(a) signatário(a) tecnicamente responsável.

## Desenvolvimento

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # produção em dist/
npm run lint
```

## Deploy

Push em `main` dispara o workflow `.github/workflows/deploy.yml`, que faz build e publica no GitHub Pages.

Site final: https://v-rogana.github.io/all-docs/
