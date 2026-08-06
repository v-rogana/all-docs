import { useState, useEffect, useCallback } from "react";
import { downloadBlob, diasAte } from "../core.js";

/* ════════════════════════════════════════════
   STORE — controle de estagiários
   Persistência em localStorage. O dado NUNCA sai do
   navegador sozinho: a saída é sempre explícita, via
   Exportar JSON (backup completo) ou Exportar CSV.
   ════════════════════════════════════════════ */

export const STORAGE_KEY = "alldocs.estagios.v1";

const EMPTY = { supervisores: [], faculdades: [], estagiarios: [], prestadores: [] };

/* Cadastro inicial: o Lucas veio no pedido original, mas sem os dados
   civis necessários ao contrato. Entra como pendente, para ser completado. */
const SEED = {
  ...EMPTY,
  prestadores: [{
    id: "seed-lucas",
    nome: "Lucas",
    funcao: "Mídia",
    status: "pendente",
    obs: "Cadastro criado como lembrete — faltam CPF, RG, endereço e valor para gerar o contrato.",
  }],
};

export function novoId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 1e6).toString(36);
}

function carregar() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...SEED };
    const parsed = JSON.parse(raw);
    // Mescla com EMPTY para tolerar bases salvas por versões anteriores.
    return { ...EMPTY, ...parsed };
  } catch {
    return { ...SEED };
  }
}

/* ════════════════════════════════════════════
   ESQUEMAS — usados pelos formulários e pelo CSV
   ════════════════════════════════════════════ */

export const STATUS_ESTAGIO = [
  { value: "ativo", label: "Ativo" },
  { value: "pendente", label: "Pendente (documentação)" },
  { value: "trancado", label: "Trancado" },
  { value: "encerrado", label: "Encerrado" },
];

export const STATUS_PRESTADOR = [
  { value: "ativo", label: "Ativo" },
  { value: "pendente", label: "Pendente (documentação)" },
  { value: "encerrado", label: "Encerrado" },
];

export const CAMPOS_SUPERVISOR = [
  { grupo: "Identificação", campos: [
    { id: "nome", label: "Nome completo", ph: "Nome do(a) supervisor(a)", req: true },
    { id: "crp", label: "CRP", ph: "XX/XXXXX", req: true },
    { id: "cpf", label: "CPF", ph: "000.000.000-00" },
    { id: "formacao", label: "Formado(a) em Psicologia pela", ph: "Faculdade de formação" },
  ]},
  { grupo: "Contato e capacidade", campos: [
    { id: "email", label: "E-mail", ph: "email@exemplo.com", type: "email" },
    { id: "telefone", label: "Telefone", ph: "(31) 90000-0000" },
    { id: "limite", label: "Limite de supervisionados", ph: "Deixe em branco para não limitar", type: "number" },
    { id: "ativo", label: "Supervisor(a) ativo(a)", type: "check", default: true },
    { id: "obs", label: "Observações", ph: "Anotações internas", type: "textarea" },
  ]},
];

export const CAMPOS_FACULDADE = [
  { grupo: "Identificação", campos: [
    { id: "nome", label: "Nome da instituição", ph: "Ex.: Pontifícia Universidade Católica de Minas Gerais", req: true },
    { id: "sigla", label: "Sigla / nome curto", ph: "Ex.: PUC Minas" },
    { id: "cnpj", label: "CNPJ", ph: "00.000.000/0001-00" },
    { id: "endereco", label: "Endereço", ph: "Rua, número, bairro" },
    { id: "cidade", label: "Cidade/UF", ph: "Belo Horizonte/MG" },
    { id: "cep", label: "CEP", ph: "00000-000" },
  ]},
  { grupo: "Setor de estágio", campos: [
    { id: "contatoNome", label: "Pessoa de contato", ph: "Nome de quem responde pelo setor" },
    { id: "email", label: "E-mail do setor", ph: "estagio@faculdade.br", type: "email" },
    { id: "telefone", label: "Telefone", ph: "(31) 0000-0000" },
    { id: "linkModelo", label: "Link do modelo de TCE da faculdade", ph: "URL do Drive com o formulário original" },
  ]},
  { grupo: "Exigências para o TCE", campos: [
    { id: "cargaHoraria", label: "Carga horária exigida", ph: "Ex.: 30 horas semanais" },
    { id: "exigePlano", label: "Exige plano de atividades (gera anexo)", type: "check" },
    { id: "exigeOrientador", label: "Exige assinatura do professor orientador", type: "check" },
    { id: "exigeTestemunhas", label: "Exige 2 testemunhas", type: "check", default: true },
    { id: "clausulas", label: "Cláusulas específicas da instituição", type: "textarea", rows: 8,
      ph: "Cole aqui as cláusulas que esta faculdade exige no termo.\n\nUma linha em branco separa cada parágrafo. Elas entram no TCE numa seção própria, depois das cláusulas da Allos." },
    { id: "obs", label: "Observações do processo", type: "textarea",
      ph: "Ex.: só aceita entrega via portal; prazo de 15 dias para devolver assinado." },
  ]},
];

export const CAMPOS_ESTAGIARIO = [
  { grupo: "Identificação", campos: [
    { id: "nome", label: "Nome completo", ph: "Nome do(a) estagiário(a)", req: true },
    { id: "cpf", label: "CPF", ph: "000.000.000-00" },
    { id: "rg", label: "RG", ph: "MG-00.000.000" },
    { id: "rgOrgao", label: "Órgão expedidor", ph: "Ex.: SSPMG" },
    { id: "nacionalidade", label: "Nacionalidade", ph: "brasileiro(a)", default: "brasileiro(a)" },
    { id: "estadoCivil", label: "Estado civil", ph: "solteiro(a)", default: "solteiro(a)" },
  ]},
  { grupo: "Contato e endereço", campos: [
    { id: "email", label: "E-mail", ph: "email@exemplo.com", type: "email" },
    { id: "telefone", label: "Telefone", ph: "(31) 90000-0000" },
    { id: "logradouro", label: "Rua e número", ph: "Rua Exemplo, nº 100" },
    { id: "bairro", label: "Bairro", ph: "Bairro" },
    { id: "cidade", label: "Cidade", ph: "Belo Horizonte", req: true },
    { id: "uf", label: "Estado", ph: "Minas Gerais" },
    { id: "cep", label: "CEP", ph: "00000-000" },
  ]},
  { grupo: "Faculdade", campos: [
    { id: "faculdadeId", label: "Faculdade", type: "select-faculdade", req: true },
    { id: "periodo", label: "Período/semestre atual", ph: "Ex.: 8º período" },
    { id: "prevFormatura", label: "Previsão de formatura", ph: "Ex.: dezembro/2027" },
    { id: "profOrientador", label: "Professor(a) orientador(a)", ph: "Quando a faculdade exigir" },
  ]},
  { grupo: "Supervisão", campos: [
    { id: "supervisorId", label: "Supervisor(a) responsável", type: "select-supervisor", req: true },
  ]},
  { grupo: "Condições do estágio", campos: [
    { id: "bolsa", label: "Bolsa mensal (R$)", ph: "Ex.: 600,00" },
    { id: "auxTransporte", label: "Auxílio-transporte (R$)", ph: "Deixe em branco se não houver" },
    { id: "cargaHoraria", label: "Carga horária", ph: "30 (trinta) horas semanais", default: "30 (trinta) horas semanais" },
    { id: "horario", label: "Horário prioritário", ph: "13h00 às 19h00, de segunda a sexta-feira", default: "13h00 às 19h00, de segunda a sexta-feira" },
    { id: "dataInicio", label: "Data de início", type: "date" },
    { id: "duracaoMeses", label: "Duração (meses)", ph: "Ex.: 12", type: "number" },
    { id: "dataFim", label: "Data de término", type: "date" },
    { id: "status", label: "Situação", type: "select-status" },
  ]},
  { grupo: "Seguro de acidentes pessoais", campos: [
    { id: "seguradora", label: "Seguradora", ph: "ICATU SEGUROS S/A", default: "ICATU SEGUROS S/A" },
    { id: "apolice", label: "Número da apólice", ph: "000000000" },
    { id: "seguroVenc", label: "Vencimento do seguro", type: "date" },
    { id: "seguroArquivado", label: "Apólice arquivada", type: "check" },
    { id: "seguroLink", label: "Link da apólice arquivada", ph: "URL do Drive" },
  ]},
  { grupo: "Termo de Compromisso (TCE)", campos: [
    { id: "tceAssinado", label: "TCE assinado por todas as partes", type: "check" },
    { id: "tceData", label: "Data de assinatura do TCE", type: "date" },
    { id: "tceVenc", label: "Vencimento do TCE", type: "date" },
    { id: "tceArquivado", label: "Contrato arquivado", type: "check" },
    { id: "tceLink", label: "Link do contrato arquivado", ph: "URL do Drive" },
    { id: "obs", label: "Observações", type: "textarea", ph: "Anotações internas" },
  ]},
];

export const CAMPOS_PRESTADOR = [
  { grupo: "Identificação", campos: [
    { id: "nome", label: "Nome completo", ph: "Nome do(a) contratado(a)", req: true },
    { id: "cpf", label: "CPF", ph: "000.000.000-00" },
    { id: "rg", label: "RG", ph: "MG-00.000.000" },
    { id: "rgOrgao", label: "Órgão expedidor", ph: "Ex.: SSPMG" },
    { id: "nacionalidade", label: "Nacionalidade", ph: "brasileiro(a)", default: "brasileiro(a)" },
    { id: "estadoCivil", label: "Estado civil", ph: "solteiro(a)", default: "solteiro(a)" },
    { id: "profissao", label: "Profissão", ph: "Ex.: designer, social media" },
  ]},
  { grupo: "Contato e endereço", campos: [
    { id: "email", label: "E-mail", ph: "email@exemplo.com", type: "email" },
    { id: "telefone", label: "Telefone", ph: "(31) 90000-0000" },
    { id: "logradouro", label: "Rua e número", ph: "Rua Exemplo, nº 100" },
    { id: "bairro", label: "Bairro", ph: "Bairro" },
    { id: "cidade", label: "Cidade", ph: "Belo Horizonte" },
    { id: "uf", label: "Estado", ph: "Minas Gerais" },
    { id: "cep", label: "CEP", ph: "00000-000" },
  ]},
  { grupo: "Contrato", campos: [
    { id: "funcao", label: "Função / frente de trabalho", ph: "Ex.: Mídia e comunicação" },
    { id: "escopo", label: "Escopo dos serviços", type: "textarea", rows: 4,
      ph: "Deixe em branco para usar o escopo padrão do contrato.\n\nSe preencher, substitui a cláusula 1.2." },
    { id: "valor", label: "Valor (R$)", ph: "Ex.: 1.200,00" },
    { id: "periodicidade", label: "Periodicidade", ph: "Ex.: mensal", default: "mensal" },
    { id: "dataInicio", label: "Início", type: "date" },
    { id: "contratoData", label: "Data de assinatura", type: "date" },
    { id: "contratoArquivado", label: "Contrato arquivado", type: "check" },
    { id: "contratoLink", label: "Link do contrato arquivado", ph: "URL do Drive" },
    { id: "status", label: "Situação", type: "select-status" },
    { id: "obs", label: "Observações", type: "textarea", ph: "Anotações internas" },
  ]},
];

/** Objeto novo com os defaults declarados no esquema. */
export function registroVazio(grupos) {
  const r = { id: novoId() };
  grupos.forEach(g => g.campos.forEach(c => {
    r[c.id] = c.default !== undefined ? c.default : (c.type === "check" ? false : "");
  }));
  if (r.status === "" || r.status === undefined) r.status = "pendente";
  return r;
}

/* ════════════════════════════════════════════
   HOOK — estado + persistência + operações
   ════════════════════════════════════════════ */
export function useEstagios() {
  const [db, setDb] = useState(carregar);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.warn("[estagios] não foi possível salvar no localStorage:", e);
    }
  }, [db]);

  const salvar = useCallback((colecao, registro) => {
    setDb(prev => {
      const lista = prev[colecao] || [];
      const existe = lista.some(r => r.id === registro.id);
      return {
        ...prev,
        [colecao]: existe
          ? lista.map(r => (r.id === registro.id ? registro : r))
          : [...lista, registro],
      };
    });
  }, []);

  const remover = useCallback((colecao, id) => {
    setDb(prev => ({ ...prev, [colecao]: (prev[colecao] || []).filter(r => r.id !== id) }));
  }, []);

  const substituir = useCallback((novo) => setDb({ ...EMPTY, ...novo }), []);

  const limpar = useCallback(() => setDb({ ...EMPTY }), []);

  return { db, salvar, remover, substituir, limpar };
}

/* ════════════════════════════════════════════
   CONSULTAS DERIVADAS
   ════════════════════════════════════════════ */

export const acharFaculdade = (db, id) => (db.faculdades || []).find(f => f.id === id) || null;
export const acharSupervisor = (db, id) => (db.supervisores || []).find(s => s.id === id) || null;

export const nomeFaculdade = (db, id) => {
  const f = acharFaculdade(db, id);
  return f ? (f.sigla || f.nome) : "—";
};
export const nomeSupervisor = (db, id) => {
  const s = acharSupervisor(db, id);
  return s ? s.nome : "—";
};

/** Estagiários que contam para a carga de um supervisor (ativos e pendentes). */
export const supervisionadosDe = (db, supervisorId) =>
  (db.estagiarios || []).filter(e =>
    e.supervisorId === supervisorId && (e.status === "ativo" || e.status === "pendente"));

/**
 * Alertas de vencimento e pendências documentais.
 * `janela` = quantos dias à frente ainda contam como "vencendo".
 */
export function alertas(db, janela = 45) {
  const out = [];
  (db.estagiarios || []).forEach(e => {
    if (e.status === "encerrado") return;
    const nome = e.nome || "(sem nome)";

    const dSeg = diasAte(e.seguroVenc);
    if (dSeg !== null && dSeg <= janela) {
      out.push({
        id: e.id, nome, tipo: "Seguro",
        dias: dSeg,
        texto: dSeg < 0 ? `Seguro venceu há ${Math.abs(dSeg)} dia(s)` : `Seguro vence em ${dSeg} dia(s)`,
        grave: dSeg < 0,
      });
    }

    const dTce = diasAte(e.tceVenc);
    if (dTce !== null && dTce <= janela) {
      out.push({
        id: e.id, nome, tipo: "TCE",
        dias: dTce,
        texto: dTce < 0 ? `TCE venceu há ${Math.abs(dTce)} dia(s)` : `TCE vence em ${dTce} dia(s)`,
        grave: dTce < 0,
      });
    }

    if (e.status === "ativo" && !e.seguroArquivado) {
      out.push({ id: e.id, nome, tipo: "Apólice", dias: 9998,
        texto: "Apólice não arquivada", grave: true });
    }
    if (e.status === "ativo" && !e.tceArquivado) {
      out.push({ id: e.id, nome, tipo: "Contrato", dias: 9999,
        texto: "Contrato não arquivado", grave: true });
    }
  });
  return out.sort((a, b) => a.dias - b.dias);
}

/* ════════════════════════════════════════════
   EXPORTAR / IMPORTAR
   ════════════════════════════════════════════ */

export function exportarJSON(db) {
  const payload = { _app: "ALL_dOcS", _modulo: "estagios", _versao: 1, ...db };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const hoje = new Date().toISOString().slice(0, 10);
  downloadBlob(blob, `allos_estagios_${hoje}.json`);
}

/** Lê um File e devolve a base validada, ou lança Error com motivo legível. */
export async function importarJSON(file) {
  const texto = await file.text();
  let dados;
  try {
    dados = JSON.parse(texto);
  } catch {
    throw new Error("O arquivo não é um JSON válido.");
  }
  if (!dados || typeof dados !== "object") {
    throw new Error("O conteúdo do arquivo não é um backup reconhecível.");
  }
  const chaves = ["supervisores", "faculdades", "estagiarios", "prestadores"];
  if (!chaves.some(k => Array.isArray(dados[k]))) {
    throw new Error("O arquivo não contém nenhuma lista de estágios. Confira se é o backup certo.");
  }
  const limpo = { ...EMPTY };
  chaves.forEach(k => { if (Array.isArray(dados[k])) limpo[k] = dados[k]; });
  return limpo;
}

const csvCell = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV com `;` e BOM — abre direto no Excel em pt-BR sem passo de importação. */
function baixarCSV(cabecalho, linhas, nome) {
  const corpo = [cabecalho, ...linhas]
    .map(l => l.map(csvCell).join(";"))
    .join("\r\n");
  const blob = new Blob(["﻿" + corpo], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, nome);
}

const simNao = (b) => (b ? "Sim" : "Não");
const rotuloStatus = (v, lista) => (lista.find(s => s.value === v) || {}).label || v || "";

export function exportarCSVEstagiarios(db) {
  const cab = ["Nome", "Cidade", "Faculdade", "Prev Formar", "Supervisor",
    "Situação", "Bolsa", "Início", "Fim",
    "Seguro", "Apólice", "Venc Seguro", "Apólice arquivada",
    "TCE", "Data TCE", "Venc TCE", "Contrato arquivado", "Observações"];
  const linhas = (db.estagiarios || []).map(e => [
    e.nome, e.cidade, nomeFaculdade(db, e.faculdadeId), e.prevFormatura,
    nomeSupervisor(db, e.supervisorId),
    rotuloStatus(e.status, STATUS_ESTAGIO),
    e.bolsa, e.dataInicio, e.dataFim,
    e.seguradora, e.apolice, e.seguroVenc, simNao(e.seguroArquivado),
    simNao(e.tceAssinado), e.tceData, e.tceVenc, simNao(e.tceArquivado),
    (e.obs || "").replace(/\n/g, " "),
  ]);
  baixarCSV(cab, linhas, `allos_estagiarios_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportarCSVSupervisores(db) {
  const cab = ["Supervisor", "CRP", "CPF", "Formação", "E-mail", "Telefone",
    "Supervisionados", "Limite", "Ativo"];
  const linhas = (db.supervisores || []).map(s => [
    s.nome, s.crp, s.cpf, s.formacao, s.email, s.telefone,
    supervisionadosDe(db, s.id).length, s.limite || "", simNao(s.ativo),
  ]);
  baixarCSV(cab, linhas, `allos_supervisores_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportarCSVPrestadores(db) {
  const cab = ["Nome", "Função", "Profissão", "Cidade", "Valor", "Periodicidade",
    "Início", "Data do contrato", "Contrato arquivado", "Situação"];
  const linhas = (db.prestadores || []).map(x => [
    x.nome, x.funcao, x.profissao, x.cidade, x.valor, x.periodicidade,
    x.dataInicio, x.contratoData, simNao(x.contratoArquivado),
    rotuloStatus(x.status, STATUS_PRESTADOR),
  ]);
  baixarCSV(cab, linhas, `allos_prestadores_${new Date().toISOString().slice(0, 10)}.csv`);
}
