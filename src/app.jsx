import { useState, useEffect, useRef, useCallback } from "react";

/* ════════════════════════════════════════════
   ALL_dOcS — Documentos clínicos da Associação Allos
   Estética alinhada ao site allos.org.br: cream/teal/terracota,
   Fraunces (serif) + DM Sans (sans-serif), traços com grão sutil.
   ════════════════════════════════════════════ */

/* ────────────────────────────────────────────
   PALETA — extraída do site Allos
   ──────────────────────────────────────────── */
const C = {
  // Fundos
  cream: "#FDFBF7",
  creamAlt: "#F5F0E8",
  cardBg: "#FAF5F0",

  // Sidebar (teal-bg dos blocos escuros do site)
  sidebar: "#0D3B36",
  sidebarHover: "rgba(253,251,247,0.06)",
  sidebarActive: "rgba(46,158,143,0.18)",
  sidebarText: "#FDFBF7",
  sidebarSoft: "rgba(253,251,247,0.68)",
  sidebarMuted: "rgba(253,251,247,0.42)",

  // Tipografia
  charcoal: "#2D3436",
  text: "#2D3436",
  textSoft: "#4A4A4A",
  muted: "#888888",
  border: "#E5DFD3",
  borderSoft: "rgba(45,52,54,0.10)",

  // Marca
  teal: "#2E9E8F",
  tealDark: "#1A7A6D",
  tealLight: "#3ECFBE",
  tealBg: "#0D3B36",
  tealSoftBg: "#E8F8F5",
  sage: "#2D6A4F",
  accent: "#E07A5F",
  accentDark: "#B85A40",
  accentSoftBg: "#FBEDE7",
};

/* ────────────────────────────────────────────
   ALLOS — DADOS INSTITUCIONAIS FIXOS
   ──────────────────────────────────────────── */
const ALLOS_INST = {
  nome: "ASSOCIAÇÃO ALLOS",
  natureza: "associação civil sem fins lucrativos",
  cnpj: "50.990.346/0001-52",
  endereco: "Rua Rio Negro, 1048, Barroca, Belo Horizonte/MG — CEP 30.431-058",
  cidade: "Belo Horizonte/MG",
  foro: "Comarca de Belo Horizonte/MG",
};

/* ════════════════════════════════════════════
   DOCUMENT 1 — CONTRATO ADULTO
   ════════════════════════════════════════════ */
const DEFAULT_CONTRATO_ADULTO = {
  pac_nome: "", pac_nacionalidade: "", pac_profissao: "",
  pac_cpf: "", pac_endereco: "",
  sup_nome: "", sup_crp: "", sup_cpf: "",
  ter_nome: "", ter_cpf: "", ter_registro: "",
  srv_modalidade: "psicoterapia", srv_duracao: "50 minutos", srv_horario: "",
  fin_mensal: "", fin_sessao: "",
  vig_meses: "12", vig_data: "",
};

const FIELDS_CONTRATO_ADULTO = [
  { title: "Contratante (paciente)", icon: "👤", fields: [
    { id: "pac_nome", label: "Nome completo", ph: "Nome completo do(a) contratante" },
    { id: "pac_nacionalidade", label: "Nacionalidade / estado civil", ph: "Ex.: Brasileiro(a), solteiro(a)" },
    { id: "pac_profissao", label: "Profissão", ph: "Profissão" },
    { id: "pac_cpf", label: "CPF", ph: "000.000.000-00" },
    { id: "pac_endereco", label: "Endereço completo", ph: "Rua, número, bairro — cidade/UF — CEP" },
  ]},
  { title: "Supervisor(a) responsável", icon: "🧠", fields: [
    { id: "sup_nome", label: "Nome do(a) supervisor(a)", ph: "Psicólogo(a) com CRP ativo" },
    { id: "sup_crp", label: "CRP", ph: "XX/XXXXX" },
    { id: "sup_cpf", label: "CPF", ph: "000.000.000-00" },
  ]},
  { title: "Terapeuta responsável", icon: "🤝", fields: [
    { id: "ter_nome", label: "Nome do(a) terapeuta", ph: "Nome completo" },
    { id: "ter_cpf", label: "CPF", ph: "000.000.000-00" },
    { id: "ter_registro", label: "Registro profissional (quando aplicável)", ph: "Ex.: CRP XX/XXXXX, ou deixe em branco" },
  ]},
  { title: "Condições do serviço", icon: "📋", fields: [
    { id: "srv_modalidade", label: "Modalidade", ph: "Ex.: psicoterapia, atendimento psicológico" },
    { id: "srv_duracao", label: "Duração das sessões", ph: "Ex.: 50 minutos" },
    { id: "srv_horario", label: "Dia e horário fixo semanal", ph: "Ex.: às quartas-feiras, 18h00" },
  ]},
  { title: "Condições financeiras", icon: "💰", fields: [
    { id: "fin_mensal", label: "Mensalidade (R$)", ph: "Ex.: 400,00" },
    { id: "fin_sessao", label: "Valor por sessão (R$)", ph: "Ex.: 100,00" },
  ]},
  { title: "Vigência e assinatura", icon: "📅", fields: [
    { id: "vig_meses", label: "Vigência (meses)", ph: "Ex.: 12" },
    { id: "vig_data", label: "Data de assinatura", ph: "Ex.: 06 de março de 2026" },
  ]},
];

/* ════════════════════════════════════════════
   DOCUMENT 2 — CONTRATO MENOR
   ════════════════════════════════════════════ */
const DEFAULT_CONTRATO_MENOR = {
  resp_nome: "", resp_nacionalidade: "", resp_profissao: "",
  resp_cpf: "", resp_endereco: "", resp_parentesco: "",
  pac_nome: "", pac_nascimento: "", pac_cpf: "",
  sup_nome: "", sup_crp: "", sup_cpf: "",
  ter_nome: "", ter_cpf: "", ter_registro: "",
  srv_modalidade: "psicoterapia", srv_duracao: "50 minutos", srv_horario: "",
  fin_mensal: "", fin_sessao: "",
  vig_meses: "12", vig_data: "",
};

const FIELDS_CONTRATO_MENOR = [
  { title: "Responsável legal (contratante)", icon: "👤", fields: [
    { id: "resp_nome", label: "Nome completo", ph: "Nome completo do(a) responsável" },
    { id: "resp_nacionalidade", label: "Nacionalidade / estado civil", ph: "Ex.: Brasileira, casada" },
    { id: "resp_profissao", label: "Profissão", ph: "Profissão" },
    { id: "resp_cpf", label: "CPF", ph: "000.000.000-00" },
    { id: "resp_endereco", label: "Endereço completo", ph: "Rua, número, bairro — cidade/UF — CEP" },
    { id: "resp_parentesco", label: "Parentesco com o(a) paciente", ph: "Ex.: mãe, pai, avó" },
  ]},
  { title: "Beneficiário (paciente menor)", icon: "🧒", fields: [
    { id: "pac_nome", label: "Nome completo", ph: "Nome completo do(a) menor" },
    { id: "pac_nascimento", label: "Data de nascimento", ph: "Ex.: 15 de janeiro de 2015" },
    { id: "pac_cpf", label: "CPF", ph: "000.000.000-00" },
  ]},
  { title: "Supervisor(a) responsável", icon: "🧠", fields: [
    { id: "sup_nome", label: "Nome do(a) supervisor(a)", ph: "Psicólogo(a) com CRP ativo" },
    { id: "sup_crp", label: "CRP", ph: "XX/XXXXX" },
    { id: "sup_cpf", label: "CPF", ph: "000.000.000-00" },
  ]},
  { title: "Terapeuta responsável", icon: "🤝", fields: [
    { id: "ter_nome", label: "Nome do(a) terapeuta", ph: "Nome completo" },
    { id: "ter_cpf", label: "CPF", ph: "000.000.000-00" },
    { id: "ter_registro", label: "Registro profissional (quando aplicável)", ph: "Ex.: CRP XX/XXXXX, ou deixe em branco" },
  ]},
  { title: "Condições do serviço", icon: "📋", fields: [
    { id: "srv_modalidade", label: "Modalidade", ph: "Ex.: psicoterapia, atendimento psicológico" },
    { id: "srv_duracao", label: "Duração das sessões", ph: "Ex.: 50 minutos" },
    { id: "srv_horario", label: "Dia e horário fixo semanal", ph: "Ex.: às quartas-feiras, 18h00" },
  ]},
  { title: "Condições financeiras", icon: "💰", fields: [
    { id: "fin_mensal", label: "Mensalidade (R$)", ph: "Ex.: 400,00" },
    { id: "fin_sessao", label: "Valor por sessão (R$)", ph: "Ex.: 100,00" },
  ]},
  { title: "Vigência e assinatura", icon: "📅", fields: [
    { id: "vig_meses", label: "Vigência (meses)", ph: "Ex.: 12" },
    { id: "vig_data", label: "Data de assinatura", ph: "Ex.: 06 de março de 2026" },
  ]},
];

/* ════════════════════════════════════════════
   DOCUMENT 3 — ATESTADO PSICOLÓGICO
   ════════════════════════════════════════════ */
const DEFAULT_ATESTADO = {
  pac_nome: "", pac_idade: "", pac_cpf: "",
  finalidade: "",
  conclusao: "",
  recomendacao: "",
  ter_nome: "",
  sup_nome: "", sup_crp: "",
  cidade: ALLOS_INST.cidade, data: "",
};

const FIELDS_ATESTADO = [
  { title: "Pessoa atendida", icon: "👤", fields: [
    { id: "pac_nome", label: "Nome completo", ph: "Nome da pessoa atendida" },
    { id: "pac_idade", label: "Idade", ph: "Ex.: 34 anos" },
    { id: "pac_cpf", label: "CPF", ph: "000.000.000-00" },
  ]},
  { title: "Conteúdo do atestado", icon: "📝", fields: [
    { id: "finalidade", label: "Finalidade", ph: "Ex.: justificativa de afastamento, processo seletivo, perícia" },
    { id: "conclusao", label: "Conclusão técnica", type: "textarea", ph: "Resultado clínico fundamentado da avaliação realizada", rows: 4 },
    { id: "recomendacao", label: "Recomendação (opcional)", type: "textarea", ph: "Ex.: afastamento por X dias, aptidão, encaminhamento", rows: 3 },
  ]},
  { title: "Atendimento conduzido por", icon: "🤝", fields: [
    { id: "ter_nome", label: "Terapeuta (opcional)", ph: "Nome do(a) terapeuta que conduziu o atendimento" },
  ]},
  { title: "Psicólogo(a) responsável", icon: "🧠", fields: [
    { id: "sup_nome", label: "Nome do(a) psicólogo(a) responsável", ph: "Psicólogo(a) supervisor(a) com CRP ativo" },
    { id: "sup_crp", label: "CRP", ph: "XX/XXXXX" },
  ]},
  { title: "Local e data", icon: "📅", fields: [
    { id: "cidade", label: "Cidade/UF", ph: "Ex.: Belo Horizonte/MG" },
    { id: "data", label: "Data", ph: "Ex.: 06 de março de 2026" },
  ]},
];

const META_ATESTADO = {
  quando: "Justificar faltas/impedimentos, atestar aptidão/inaptidão, solicitar afastamento/dispensa. Obrigatório em avaliação compulsória.",
  quem: "Pessoa atendida, responsável legal, empregador, órgãos públicos, Poder Judiciário.",
  vedacoes: "Emitir sem avaliação psicológica (Res. 31/2022). Uso do CID é facultativo, salvo em processos legais/trabalhistas (requer autorização escrita).",
  baseLegal: "Res. CFP nº 06/2019, Art. 10 · Trânsito: Res. 01/2019 · Arma: Res. 01/2022 · Concurso: Res. 08/2025",
};

/* ════════════════════════════════════════════
   DOCUMENT 4 — TERMO DE AUTORIZAÇÃO
   (psicoterapia de menor de 18 anos — Res. CFP 13/2022)
   ════════════════════════════════════════════ */
const DEFAULT_TERMO = {
  resp_nome: "", resp_nascimento: "", resp_documento: "", resp_endereco: "",
  pac_nome: "", pac_nascimento: "", pac_documento: "",
  ter_nome: "",
  sup_nome: "", sup_crp: "",
  cidade: ALLOS_INST.cidade, data: "",
};

const FIELDS_TERMO = [
  { title: "Responsável legal", icon: "👤", fields: [
    { id: "resp_nome", label: "Nome do(a) responsável legal", ph: "Nome completo" },
    { id: "resp_nascimento", label: "Data de nascimento", ph: "Ex.: 12 de maio de 1985" },
    { id: "resp_documento", label: "Documento (RG ou CPF)", ph: "Ex.: CPF 000.000.000-00" },
    { id: "resp_endereco", label: "Endereço completo", ph: "Rua, número, bairro — cidade/UF — CEP" },
  ]},
  { title: "Criança / adolescente", icon: "🧒", fields: [
    { id: "pac_nome", label: "Nome da criança/adolescente", ph: "Nome completo" },
    { id: "pac_nascimento", label: "Data de nascimento", ph: "Ex.: 15 de janeiro de 2015" },
    { id: "pac_documento", label: "Documento da criança (RG ou CPF)", ph: "Ex.: CPF 000.000.000-00" },
  ]},
  { title: "Atendimento conduzido por", icon: "🤝", fields: [
    { id: "ter_nome", label: "Terapeuta (opcional)", ph: "Nome do(a) terapeuta vinculado(a) à Allos" },
  ]},
  { title: "Psicólogo(a) responsável", icon: "🧠", fields: [
    { id: "sup_nome", label: "Nome do(a) psicólogo(a) responsável", ph: "Psicólogo(a) supervisor(a) com CRP ativo" },
    { id: "sup_crp", label: "CRP", ph: "XX/XXXXX" },
  ]},
  { title: "Local e data", icon: "📅", fields: [
    { id: "cidade", label: "Cidade/UF", ph: "Ex.: Belo Horizonte/MG" },
    { id: "data", label: "Data", ph: "Ex.: 06 de março de 2026" },
  ]},
];

const META_TERMO = {
  quando: "Obrigatório antes de iniciar psicoterapia de menores de 18 anos.",
  quem: "Responsável legal assina; psicólogo(a) responsável arquiva.",
  baseLegal: "Res. CFP nº 13/2022, Anexo I.",
};

/* ════════════════════════════════════════════
   DOCUMENT 5 — FORMULÁRIO DE ENCAMINHAMENTO
   ════════════════════════════════════════════ */
const DEFAULT_ENCAMINHAMENTO = {
  inst_origem: ALLOS_INST.nome,
  motivo: "",
  destino_servico: "", destino_endereco: "", destino_telefone: "",
  usuario_nome: "", usuario_responsavel: "",
  usuario_nascimento: "", usuario_telefone: "",
  ter_nome: "",
  sup_nome: "", sup_crp: "",
  cidade: ALLOS_INST.cidade, data: "",
};

const FIELDS_ENCAMINHAMENTO = [
  { title: "Origem e motivo", icon: "🏛️", fields: [
    { id: "inst_origem", label: "Instituição de origem", ph: "Ex.: Associação Allos" },
    { id: "motivo", label: "Motivo do encaminhamento", type: "textarea", ph: "Ex.: necessidade de atendimento especializado em…", rows: 4 },
  ]},
  { title: "Serviço de destino", icon: "📍", fields: [
    { id: "destino_servico", label: "Serviço de destino", ph: "Ex.: CAPS, ambulatório, especialista" },
    { id: "destino_endereco", label: "Endereço do destino", ph: "Rua, número, bairro — cidade/UF" },
    { id: "destino_telefone", label: "Telefone do destino", ph: "(00) 00000-0000" },
  ]},
  { title: "Usuário(a) encaminhado(a)", icon: "👤", fields: [
    { id: "usuario_nome", label: "Nome do(a) usuário(a)", ph: "Nome completo" },
    { id: "usuario_responsavel", label: "Responsável (se aplicável)", ph: "Nome do(a) responsável legal, se for menor" },
    { id: "usuario_nascimento", label: "Data de nascimento", ph: "Ex.: 15 de janeiro de 2015" },
    { id: "usuario_telefone", label: "Telefone do(a) usuário(a)", ph: "(00) 00000-0000" },
  ]},
  { title: "Atendimento conduzido por", icon: "🤝", fields: [
    { id: "ter_nome", label: "Terapeuta (supervisionado)", ph: "Nome do(a) terapeuta vinculado(a) à Allos" },
  ]},
  { title: "Psicólogo(a) responsável", icon: "🧠", fields: [
    { id: "sup_nome", label: "Nome do(a) psicólogo(a) responsável", ph: "Psicólogo(a) supervisor(a) com CRP ativo" },
    { id: "sup_crp", label: "CRP", ph: "XX/XXXXX" },
  ]},
  { title: "Local e data", icon: "📅", fields: [
    { id: "cidade", label: "Cidade/UF", ph: "Ex.: Belo Horizonte/MG" },
    { id: "data", label: "Data", ph: "Ex.: 06 de março de 2026" },
  ]},
];

const META_ENCAMINHAMENTO = {
  quando: "Indisponibilidade de vaga ou necessidade de atendimento especializado.",
  quem: "Psicólogo(a) responsável encaminha o(a) usuário(a).",
  baseLegal: "Instrumento auxiliar recomendado pelo Manual CFP 2025.",
};

/* ════════════════════════════════════════════
   NÚMERO POR EXTENSO
   ════════════════════════════════════════════ */
function valorPorExtenso(val) {
  const unidades = ["","um","dois","três","quatro","cinco","seis","sete","oito","nove"];
  const especiais = ["dez","onze","doze","treze","quatorze","quinze","dezesseis","dezessete","dezoito","dezenove"];
  const dezenas = ["","","vinte","trinta","quarenta","cinquenta","sessenta","setenta","oitenta","noventa"];
  const centenas = ["","cento","duzentos","trezentos","quatrocentos","quinhentos","seiscentos","setecentos","oitocentos","novecentos"];

  const str = String(val).replace(/\./g, "").replace(",00","").replace(",",".");
  const num = parseFloat(str);
  if (isNaN(num) || num <= 0) return val || "";
  if (num === 100) return "cem";
  if (num === 1000) return "mil";

  const partes = [];
  const milhar = Math.floor(num / 1000);
  const resto = Math.floor(num % 1000);
  const cent = Math.floor(resto / 100);
  const dez = Math.floor((resto % 100) / 10);
  const uni = resto % 10;

  if (milhar > 0) {
    if (milhar === 1) partes.push("mil");
    else partes.push(unidades[milhar] + " mil");
  }
  if (cent > 0) {
    if (cent === 1 && dez === 0 && uni === 0) partes.push("cem");
    else partes.push(centenas[cent]);
  }
  if (dez === 1) {
    partes.push(especiais[uni]);
  } else {
    const d = [];
    if (dez > 1) d.push(dezenas[dez]);
    if (uni > 0) d.push(unidades[uni]);
    if (d.length) partes.push(d.join(" e "));
  }
  return partes.join(" e ") || val;
}

function mesesPorExtenso(m) {
  const map = { 1:"um",2:"dois",3:"três",4:"quatro",5:"cinco",6:"seis",
    7:"sete",8:"oito",9:"nove",10:"dez",11:"onze",12:"doze",
    18:"dezoito",24:"vinte e quatro" };
  return map[parseInt(m)] || m;
}

/* ════════════════════════════════════════════
   HELPERS DE RENDERIZAÇÃO HTML
   ════════════════════════════════════════════ */
const sec = (title) => `<h2 style="font-family:Georgia,'Times New Roman',serif;font-size:13pt;color:${C.sage};border-bottom:1pt solid ${C.teal};padding-bottom:4pt;margin-top:18pt;margin-bottom:6pt;font-weight:700;letter-spacing:.3pt;">${title}</h2>`;
const p = (text) => `<p style="text-align:justify;margin:6pt 0;line-height:1.7;">${text}</p>`;
const center = (text) => `<p style="text-align:center;margin:8pt 0;line-height:1.7;">${text}</p>`;
const sigBlock = (lines) => `<div style="text-align:center;margin-bottom:36pt;">
  <p>___________________________________________</p>
  ${lines.map(l => `<p${l.bold ? ' style="font-weight:600;"' : ''}>${l.text}</p>`).join("")}
</div>`;

const LOGO_LIGHT_URL = `${typeof window !== "undefined" ? window.location.origin : ""}${import.meta.env.BASE_URL}logo-light.png`;
const LOGO_DARK_URL = `${import.meta.env.BASE_URL}logo-dark.png`;

const docHeader = (title, subtitle) => `
<div style="display:flex;align-items:center;justify-content:space-between;border-bottom:0.75pt solid #1F4F49;padding-bottom:6pt;margin-bottom:16pt;">
  <img src="${LOGO_LIGHT_URL}" alt="Associação Allos" style="height:34pt;width:auto;object-fit:contain;" />
  <div style="text-align:right;font-family:Georgia,'Times New Roman',serif;font-size:8pt;color:#475569;line-height:1.4;">
    CNPJ 50.990.346/0001-52<br/>
    Associação Allos
  </div>
</div>
<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:15pt;text-align:center;margin-bottom:4pt;letter-spacing:.4pt;">${title}</h1>
${subtitle ? `<p style="text-align:center;font-size:11pt;color:#475569;margin-bottom:18pt;font-style:italic;">${subtitle}</p>` : '<div style="margin-bottom:14pt;"></div>'}
`;

/* ════════════════════════════════════════════
   CONTRATO ADULTO — render
   ════════════════════════════════════════════ */
function renderContratoAdulto(d) {
  const v = (id) => d[id] || `[${id}]`;
  const mensalExt = valorPorExtenso(d.fin_mensal);
  const sessaoExt = valorPorExtenso(d.fin_sessao);
  const mesesExt = mesesPorExtenso(d.vig_meses);
  const ter_reg = (d.ter_registro && d.ter_registro.trim()) ? d.ter_registro : "—";

  return `
${docHeader("CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE ATENDIMENTO PSICOLÓGICO", "modalidade online")}

${sec("DAS PARTES")}

${p(`<b>CONTRATANTE:</b> ${v("pac_nome")}, ${v("pac_nacionalidade")}, ${v("pac_profissao")}, inscrito(a) no CPF sob o nº ${v("pac_cpf")}, residente e domiciliado(a) no endereço ${v("pac_endereco")}, doravante denominado(a) <b>CONTRATANTE</b>.`)}

${p(`<b>CONTRATADA:</b> <b>${ALLOS_INST.nome}</b>, ${ALLOS_INST.natureza}, inscrita no CNPJ sob o nº ${ALLOS_INST.cnpj}, com sede na ${ALLOS_INST.endereco}, doravante denominada <b>CONTRATADA</b>.`)}

${p(`<b>PSICÓLOGO(A) RESPONSÁVEL PELA SUPERVISÃO:</b> ${v("sup_nome")}, inscrito(a) no Conselho Regional de Psicologia sob o nº ${v("sup_crp")}, inscrito(a) no CPF sob o nº ${v("sup_cpf")}, responsável técnico(a) pela supervisão clínica do atendimento objeto deste contrato.`)}

${p(`<b>TERAPEUTA RESPONSÁVEL PELO ATENDIMENTO:</b> ${v("ter_nome")}, inscrito(a) no CPF sob o nº ${v("ter_cpf")}, terapeuta vinculado(a) à CONTRATADA e integrante de seu programa de supervisão clínica continuada. Registro profissional, quando aplicável: ${ter_reg}.`)}

${p("As partes acima identificadas celebram o presente contrato de prestação de serviços de atendimento psicológico em modalidade online, que será regido pelas cláusulas e condições a seguir:")}

${sec("CLÁUSULA PRIMEIRA — DO OBJETO E DA NATUREZA DO ATENDIMENTO")}

${p(`1.1. O presente contrato tem por objeto a prestação, pela CONTRATADA, de serviços de atendimento psicológico ao(à) CONTRATANTE, em sessões individuais de ${v("srv_modalidade")}, com duração de ${v("srv_duracao")} e frequência semanal.`)}

${p("1.2. O atendimento será conduzido pelo(a) TERAPEUTA acima qualificado(a), com supervisão técnica do(a) PSICÓLOGO(A) RESPONSÁVEL PELA SUPERVISÃO, na forma do Código de Ética Profissional do Psicólogo (Resolução CFP nº 010/2005). A responsabilidade técnica pelo ato clínico é do(a) supervisor(a) responsável.")}

${p("1.3. A CONTRATADA adota, como princípio institucional, o modelo de supervisão clínica continuada: todos os atendimentos prestados pelos(as) terapeutas vinculados(as) à instituição são acompanhados em supervisão regular, individual e/ou grupal, conduzida por psicólogo(a) com registro profissional ativo. Esse modelo integra a prática clínica da CONTRATADA e visa assegurar consistência técnica, escuta cuidadosa e contínuo aprimoramento do cuidado oferecido, sendo aplicado independentemente da experiência ou do registro profissional individual do(a) terapeuta. O(A) CONTRATANTE declara estar ciente desse modelo e de acordo com o fato de que o conteúdo das sessões poderá ser discutido em espaço de supervisão, sempre preservados o sigilo profissional e a finalidade estritamente clínica e formativa.")}

${p(`1.4. O horário das sessões será ${v("srv_horario").toLowerCase()}, em dia e horário fixo semanal, previamente combinado e reservado exclusivamente para o(a) CONTRATANTE.`)}

${p("1.5. O acompanhamento psicológico é regido por princípios éticos, especialmente no que diz respeito ao sigilo profissional. Tudo o que é compartilhado em sessão é protegido por confidencialidade, conforme o Código de Ética Profissional do Psicólogo (Resolução CFP nº 010/2005), ressalvada a comunicação no contexto de supervisão clínica, conforme prevista na Cláusula 1.3.")}

${sec("CLÁUSULA SEGUNDA — DO ATENDIMENTO ONLINE")}

${p("2.1. O atendimento será realizado em modalidade online, por meio da plataforma Google Meet, em conformidade com a Resolução CFP nº 011/2018, que regulamenta a prestação de serviços psicológicos por meios de tecnologia da informação e da comunicação.")}

${p("2.2. É responsabilidade do(a) CONTRATANTE: (a) dispor de conexão de internet adequada e dispositivo compatível para a realização das sessões; (b) participar das sessões em ambiente reservado, silencioso e que preserve a privacidade do atendimento; (c) ingressar pontualmente no link da sessão; e (d) comunicar imediatamente à CONTRATADA qualquer dificuldade técnica que comprometa a realização do atendimento.")}

${p("2.3. É expressamente vedada a gravação, em áudio, vídeo ou imagem, das sessões, por qualquer das partes, salvo autorização expressa e por escrito da outra parte e, no caso da CONTRATADA, mediante justificativa clínica ou formativa específica.")}

${p("2.4. Em caso de instabilidade técnica que impeça a realização ou continuidade da sessão, o(a) TERAPEUTA buscará, junto ao(à) CONTRATANTE, alternativa para reposição ou conclusão do atendimento dentro da mesma semana.")}

${sec("CLÁUSULA TERCEIRA — DA REMUNERAÇÃO E FORMA DE PAGAMENTO")}

${p(`3.1. O(A) CONTRATANTE pagará à CONTRATADA o valor mensal de R$ ${v("fin_mensal")} (${mensalExt} reais), correspondente ao valor de R$ ${v("fin_sessao")} (${sessaoExt} reais) por sessão, em regime de mensalidade.`)}

${p("3.2. A mensalidade será paga até o dia 10 (dez) de cada mês, referente ao próprio mês corrente.")}

${p("3.3. Na contratação, o(a) CONTRATANTE pagará, na entrada, valor proporcional (pro rata) calculado pelo número de dias entre a data de início do acompanhamento e o dia 10 (dez) do mês seguinte, conforme registrado pelo(a) TERAPEUTA no ato da contratação. A partir do dia 10 (dez) do mês seguinte, passa a vigorar a mensalidade integral.")}

${p("3.4. A mensalidade contempla: a reserva e proteção do horário na agenda do(a) TERAPEUTA; a manutenção da estrutura institucional e da supervisão clínica oferecida pela CONTRATADA; os encontros terapêuticos semanais; e o desenvolvimento contínuo e personalizado do acompanhamento.")}

${p("3.5. A mensalidade tem natureza de contraprestação pelo vínculo terapêutico estabelecido, não se confundindo com pagamento avulso por sessão. Por essa razão, seu valor não varia em função do comparecimento ou não às sessões individualmente consideradas. Esse modelo tem por finalidade preservar a continuidade do processo terapêutico e evitar que dificuldades de comparecimento eventuais sejam motivadas por considerações financeiras.")}

${sec("CLÁUSULA QUARTA — DAS DESMARCAÇÕES E FALTAS")}

${p("4.1. Considera-se desmarcação com aviso antecipado aquela comunicada com mais de 24 (vinte e quatro) horas de antecedência em relação ao horário marcado da sessão.")}

${p("4.2. Quando o(a) CONTRATANTE desmarcar uma sessão com aviso antecipado, terá direito à reposição da sessão em até 2 (dois) meses contados da data da sessão originalmente marcada, conforme disponibilidade de agenda do(a) TERAPEUTA. A mensalidade segue mantida, pois o horário permanece reservado.")}

${p("4.3. Faltas sem aviso antecipado (com 24 horas ou menos de antecedência) ou sem qualquer comunicação não geram direito à reposição, sendo a mensalidade igualmente mantida nos termos da Cláusula 3.5.")}

${p("4.4. Quando o(a) TERAPEUTA desmarcar uma sessão, buscará oferecer reposição dentro dos 2 (dois) meses seguintes, conforme disponibilidade de agenda de ambas as partes.")}

${sec("CLÁUSULA QUINTA — DOS MESES COM CINCO SEMANAS")}

${p("5.1. A mensalidade refere-se a quatro sessões dentro do mês, independentemente de o mês ter quatro ou cinco semanas. Em meses com cinco semanas, a quinta sessão está garantida sem cobrança adicional. Essa sessão extra compensa eventuais períodos de pausa do(a) TERAPEUTA, conforme previsto na Cláusula Sexta.")}

${sec("CLÁUSULA SEXTA — DOS FERIADOS E DAS PAUSAS DO(A) TERAPEUTA")}

${p("6.1. Sessões que coincidirem com feriados não são automaticamente repostas. Havendo disponibilidade de agenda, a reposição pode ser combinada.")}

${p("6.2. Férias ou viagens do(a) CONTRATANTE não suspendem a mensalidade, pois o horário e o espaço seguem reservados.")}

${p("6.3. O(A) TERAPEUTA poderá usufruir de períodos de férias ou pausas ao longo do ano, comunicados ao(à) CONTRATANTE com antecedência mínima de 15 (quinze) dias. Para esses períodos, as partes definirão, em comum acordo, uma das seguintes modalidades:")}

${p("(a) manutenção integral da mensalidade, com reposição posterior das sessões não realizadas, dentro do prazo combinado entre as partes;")}
${p("(b) pagamento proporcional da mensalidade, referente apenas às sessões efetivamente realizadas no mês;")}
${p("(c) cobertura temporária do atendimento por outro(a) terapeuta da CONTRATADA, mediante anuência expressa do(a) CONTRATANTE; ou")}
${p("(d) outro arranjo específico acordado entre as partes.")}

${p("6.4. A modalidade adotada será registrada por escrito, ainda que por meio eletrônico (e-mail ou aplicativo de mensagens), e valerá apenas para o período de pausa em questão.")}

${sec("CLÁUSULA SÉTIMA — DA PAUSA OU INTERRUPÇÃO DO PROCESSO PELO(A) CONTRATANTE")}

${p("7.1. Caso o(a) CONTRATANTE decida pausar ou interromper o acompanhamento, é necessário comunicar com antecedência, preferencialmente em sessão.")}

${p("7.2. O valor da mensalidade referente ao mês em que a interrupção for avisada permanece devido, pois o horário e o espaço clínico já estavam reservados.")}

${p("7.3. Em caso de pausa, a vaga deixa de ser reservada e poderá ser disponibilizada para outra pessoa, não havendo garantia de manutenção do mesmo horário, do(a) mesmo(a) terapeuta ou do(a) mesmo(a) supervisor(a) no retorno.")}

${sec("CLÁUSULA OITAVA — DA SUBSTITUIÇÃO DE TERAPEUTA OU SUPERVISOR")}

${p("8.1. A CONTRATADA poderá, em situações excepcionais (desligamento, afastamento prolongado do(a) terapeuta ou do(a) supervisor(a) responsável, ou outra causa devidamente justificada), promover a substituição do(a) TERAPEUTA e/ou do(a) PSICÓLOGO(A) RESPONSÁVEL PELA SUPERVISÃO, comunicando previamente o(a) CONTRATANTE.")}

${p("8.2. Nessas hipóteses, a CONTRATADA buscará oferecer continuidade do acompanhamento por meio de outro(a) terapeuta vinculado(a) à instituição, mediante anuência do(a) CONTRATANTE, sendo facultada a este(a) a rescisão do contrato sem ônus, observada a regra de aviso prevista na Cláusula 7.2.")}

${sec("CLÁUSULA NONA — DA VIGÊNCIA")}

${p(`9.1. O presente contrato terá vigência de ${v("vig_meses")} (${mesesExt}) meses, contados a partir da data de sua assinatura, podendo ser renovado por acordo entre as partes.`)}

${sec("CLÁUSULA DÉCIMA — DO FORO")}

${p(`10.1. As partes elegem o foro da ${ALLOS_INST.foro} para dirimir quaisquer dúvidas ou controvérsias oriundas do presente contrato, renunciando a qualquer outro, por mais privilegiado que seja.`)}

${p("E por estarem de acordo, as partes assinam o presente contrato em duas vias de igual teor e forma.")}

${center(`${ALLOS_INST.cidade}, ${v("vig_data")}.`)}

<div style="margin-top:50pt;">
  ${sigBlock([
    { text: `<b>${v("pac_nome")}</b>` },
    { text: `CPF: ${v("pac_cpf")}` },
    { text: "CONTRATANTE", bold: true },
  ])}
  ${sigBlock([
    { text: `<b>${ALLOS_INST.nome}</b>` },
    { text: `CNPJ: ${ALLOS_INST.cnpj}` },
    { text: "CONTRATADA", bold: true },
  ])}
  ${sigBlock([
    { text: `<b>${v("sup_nome")}</b>` },
    { text: `CRP: ${v("sup_crp")}` },
    { text: "PSICÓLOGO(A) RESPONSÁVEL PELA SUPERVISÃO", bold: true },
  ])}
  ${sigBlock([
    { text: `<b>${v("ter_nome")}</b>` },
    { text: `CPF: ${v("ter_cpf")}` },
    { text: `Registro: ${ter_reg}` },
    { text: "TERAPEUTA RESPONSÁVEL PELO ATENDIMENTO", bold: true },
  ])}
</div>`;
}

/* ════════════════════════════════════════════
   CONTRATO MENOR — render
   ════════════════════════════════════════════ */
function renderContratoMenor(d) {
  const v = (id) => d[id] || `[${id}]`;
  const mensalExt = valorPorExtenso(d.fin_mensal);
  const sessaoExt = valorPorExtenso(d.fin_sessao);
  const mesesExt = mesesPorExtenso(d.vig_meses);
  const ter_reg = (d.ter_registro && d.ter_registro.trim()) ? d.ter_registro : "—";

  return `
${docHeader("CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE ATENDIMENTO PSICOLÓGICO", "crianças e adolescentes — modalidade online")}

${sec("DAS PARTES")}

${p(`<b>CONTRATANTE (RESPONSÁVEL LEGAL):</b> ${v("resp_nome")}, ${v("resp_nacionalidade")}, ${v("resp_profissao")}, inscrito(a) no CPF sob o nº ${v("resp_cpf")}, residente e domiciliado(a) no endereço ${v("resp_endereco")}, ${v("resp_parentesco")} do(a) paciente, doravante denominado(a) <b>CONTRATANTE</b>.`)}

${p(`<b>BENEFICIÁRIO(A) (PACIENTE):</b> ${v("pac_nome")}, nascido(a) em ${v("pac_nascimento")}, inscrito(a) no CPF sob o nº ${v("pac_cpf")}, menor de idade, representado(a) neste ato por seu(sua) responsável legal acima qualificado(a).`)}

${p(`<b>CONTRATADA:</b> <b>${ALLOS_INST.nome}</b>, ${ALLOS_INST.natureza}, inscrita no CNPJ sob o nº ${ALLOS_INST.cnpj}, com sede na ${ALLOS_INST.endereco}, doravante denominada <b>CONTRATADA</b>.`)}

${p(`<b>PSICÓLOGO(A) RESPONSÁVEL PELA SUPERVISÃO:</b> ${v("sup_nome")}, inscrito(a) no Conselho Regional de Psicologia sob o nº ${v("sup_crp")}, inscrito(a) no CPF sob o nº ${v("sup_cpf")}, responsável técnico(a) pela supervisão clínica do atendimento objeto deste contrato.`)}

${p(`<b>TERAPEUTA RESPONSÁVEL PELO ATENDIMENTO:</b> ${v("ter_nome")}, inscrito(a) no CPF sob o nº ${v("ter_cpf")}, terapeuta vinculado(a) à CONTRATADA e integrante de seu programa de supervisão clínica continuada. Registro profissional, quando aplicável: ${ter_reg}.`)}

${p("As partes acima identificadas celebram o presente contrato de prestação de serviços de atendimento psicológico em modalidade online para o(a) BENEFICIÁRIO(A), que será regido pelas cláusulas e condições a seguir:")}

${sec("CLÁUSULA PRIMEIRA — DO OBJETO E DA NATUREZA DO ATENDIMENTO")}

${p(`1.1. O presente contrato tem por objeto a prestação, pela CONTRATADA, de serviços de atendimento psicológico ao(à) BENEFICIÁRIO(A), em sessões individuais de ${v("srv_modalidade")}, com duração de ${v("srv_duracao")} e frequência semanal.`)}

${p("1.2. O atendimento será conduzido pelo(a) TERAPEUTA acima qualificado(a), com supervisão técnica do(a) PSICÓLOGO(A) RESPONSÁVEL PELA SUPERVISÃO, na forma do Código de Ética Profissional do Psicólogo (Resolução CFP nº 010/2005) e do Estatuto da Criança e do Adolescente (Lei nº 8.069/1990). A responsabilidade técnica pelo ato clínico é do(a) supervisor(a) responsável.")}

${p("1.3. A CONTRATADA adota, como princípio institucional, o modelo de supervisão clínica continuada: todos os atendimentos prestados pelos(as) terapeutas vinculados(as) à instituição são acompanhados em supervisão regular, individual e/ou grupal, conduzida por psicólogo(a) com registro profissional ativo. Esse modelo integra a prática clínica da CONTRATADA e visa assegurar consistência técnica, escuta cuidadosa e contínuo aprimoramento do cuidado oferecido, sendo aplicado independentemente da experiência ou do registro profissional individual do(a) terapeuta. O(A) CONTRATANTE declara estar ciente desse modelo e de acordo com o fato de que o conteúdo das sessões do(a) BENEFICIÁRIO(A) poderá ser discutido em espaço de supervisão, sempre preservados o sigilo profissional e a finalidade estritamente clínica e formativa.")}

${p(`1.4. O horário das sessões será ${v("srv_horario").toLowerCase()}, em dia e horário fixo semanal, previamente combinado e reservado exclusivamente para o(a) BENEFICIÁRIO(A).`)}

${p("1.5. O acompanhamento psicológico é regido por princípios éticos, especialmente no que diz respeito ao sigilo profissional. Tudo o que é compartilhado em sessão pelo(a) BENEFICIÁRIO(A) é protegido por confidencialidade, conforme o Código de Ética Profissional do Psicólogo (Resolução CFP nº 010/2005) e o Estatuto da Criança e do Adolescente (Lei nº 8.069/1990), ressalvada a comunicação no contexto de supervisão clínica, conforme prevista na Cláusula 1.3.")}

${sec("CLÁUSULA SEGUNDA — DO ATENDIMENTO ONLINE")}

${p("2.1. O atendimento será realizado em modalidade online, por meio da plataforma Google Meet, em conformidade com a Resolução CFP nº 011/2018, que regulamenta a prestação de serviços psicológicos por meios de tecnologia da informação e da comunicação.")}

${p("2.2. É responsabilidade do(a) CONTRATANTE: (a) dispor de conexão de internet adequada e dispositivo compatível para a realização das sessões do(a) BENEFICIÁRIO(A); (b) garantir que o(a) BENEFICIÁRIO(A) participe das sessões em ambiente reservado, silencioso e que preserve a privacidade do atendimento, sem a presença ou escuta de terceiros, salvo orientação clínica em sentido diverso; (c) zelar pelo ingresso pontual do(a) BENEFICIÁRIO(A) no link da sessão; e (d) comunicar imediatamente à CONTRATADA qualquer dificuldade técnica que comprometa a realização do atendimento.")}

${p("2.3. É expressamente vedada a gravação, em áudio, vídeo ou imagem, das sessões, por qualquer das partes ou por terceiros, salvo autorização expressa e por escrito da outra parte e, no caso da CONTRATADA, mediante justificativa clínica ou formativa específica.")}

${p("2.4. Em caso de instabilidade técnica que impeça a realização ou continuidade da sessão, o(a) TERAPEUTA buscará, junto ao(à) CONTRATANTE, alternativa para reposição ou conclusão do atendimento dentro da mesma semana.")}

${sec("CLÁUSULA TERCEIRA — DA REMUNERAÇÃO E FORMA DE PAGAMENTO")}

${p(`3.1. O(A) CONTRATANTE pagará à CONTRATADA o valor mensal de R$ ${v("fin_mensal")} (${mensalExt} reais), correspondente ao valor de R$ ${v("fin_sessao")} (${sessaoExt} reais) por sessão, em regime de mensalidade.`)}

${p("3.2. A mensalidade será paga até o dia 10 (dez) de cada mês, referente ao próprio mês corrente.")}

${p("3.3. Na contratação, o(a) CONTRATANTE pagará, na entrada, valor proporcional (pro rata) calculado pelo número de dias entre a data de início do acompanhamento e o dia 10 (dez) do mês seguinte, conforme registrado pelo(a) TERAPEUTA no ato da contratação. A partir do dia 10 (dez) do mês seguinte, passa a vigorar a mensalidade integral.")}

${p("3.4. A mensalidade contempla: a reserva e proteção do horário na agenda do(a) TERAPEUTA; a manutenção da estrutura institucional e da supervisão clínica oferecida pela CONTRATADA; os encontros terapêuticos semanais; e o desenvolvimento contínuo e personalizado do acompanhamento.")}

${p("3.5. A mensalidade tem natureza de contraprestação pelo vínculo terapêutico estabelecido, não se confundindo com pagamento avulso por sessão. Por essa razão, seu valor não varia em função do comparecimento ou não às sessões individualmente consideradas. Esse modelo tem por finalidade preservar a continuidade do processo terapêutico e evitar que dificuldades de comparecimento eventuais sejam motivadas por considerações financeiras.")}

${sec("CLÁUSULA QUARTA — DAS DESMARCAÇÕES E FALTAS")}

${p("4.1. Considera-se desmarcação com aviso antecipado aquela comunicada com mais de 24 (vinte e quatro) horas de antecedência em relação ao horário marcado da sessão.")}

${p("4.2. Quando o(a) CONTRATANTE desmarcar uma sessão do(a) BENEFICIÁRIO(A) com aviso antecipado, terá direito à reposição da sessão em até 2 (dois) meses contados da data da sessão originalmente marcada, conforme disponibilidade de agenda do(a) TERAPEUTA. A mensalidade segue mantida, pois o horário permanece reservado.")}

${p("4.3. Faltas sem aviso antecipado (com 24 horas ou menos de antecedência) ou sem qualquer comunicação não geram direito à reposição, sendo a mensalidade igualmente mantida nos termos da Cláusula 3.5.")}

${p("4.4. Quando o(a) TERAPEUTA desmarcar uma sessão, buscará oferecer reposição dentro dos 2 (dois) meses seguintes, conforme disponibilidade de agenda de ambas as partes.")}

${sec("CLÁUSULA QUINTA — DOS MESES COM CINCO SEMANAS")}

${p("5.1. A mensalidade refere-se a quatro sessões dentro do mês, independentemente de o mês ter quatro ou cinco semanas. Em meses com cinco semanas, a quinta sessão está garantida sem cobrança adicional. Essa sessão extra compensa eventuais períodos de pausa do(a) TERAPEUTA, conforme previsto na Cláusula Sexta.")}

${sec("CLÁUSULA SEXTA — DOS FERIADOS E DAS PAUSAS DO(A) TERAPEUTA")}

${p("6.1. Sessões que coincidirem com feriados não são automaticamente repostas. Havendo disponibilidade de agenda, a reposição pode ser combinada.")}

${p("6.2. Férias ou viagens do(a) BENEFICIÁRIO(A) não suspendem a mensalidade, pois o horário e o espaço seguem reservados.")}

${p("6.3. O(A) TERAPEUTA poderá usufruir de períodos de férias ou pausas ao longo do ano, comunicados ao(à) CONTRATANTE com antecedência mínima de 15 (quinze) dias. Para esses períodos, as partes definirão, em comum acordo, uma das seguintes modalidades:")}

${p("(a) manutenção integral da mensalidade, com reposição posterior das sessões não realizadas, dentro do prazo combinado entre as partes;")}
${p("(b) pagamento proporcional da mensalidade, referente apenas às sessões efetivamente realizadas no mês;")}
${p("(c) cobertura temporária do atendimento por outro(a) terapeuta da CONTRATADA, mediante anuência expressa do(a) CONTRATANTE; ou")}
${p("(d) outro arranjo específico acordado entre as partes.")}

${p("6.4. A modalidade adotada será registrada por escrito, ainda que por meio eletrônico (e-mail ou aplicativo de mensagens), e valerá apenas para o período de pausa em questão.")}

${sec("CLÁUSULA SÉTIMA — DA PAUSA OU INTERRUPÇÃO DO PROCESSO PELO(A) CONTRATANTE")}

${p("7.1. Caso o(a) CONTRATANTE decida pausar ou interromper o acompanhamento do(a) BENEFICIÁRIO(A), é necessário comunicar com antecedência, preferencialmente em sessão.")}

${p("7.2. O valor da mensalidade referente ao mês em que a interrupção for avisada permanece devido, pois o horário e o espaço clínico já estavam reservados.")}

${p("7.3. Em caso de pausa, a vaga deixa de ser reservada e poderá ser disponibilizada para outra pessoa, não havendo garantia de manutenção do mesmo horário, do(a) mesmo(a) terapeuta ou do(a) mesmo(a) supervisor(a) no retorno.")}

${sec("CLÁUSULA OITAVA — DAS REUNIÕES COM O(A) RESPONSÁVEL")}

${p("8.1. A CONTRATADA, por meio do(a) TERAPEUTA e/ou do(a) PSICÓLOGO(A) RESPONSÁVEL PELA SUPERVISÃO, poderá realizar reuniões eventuais com o(a) CONTRATANTE (responsável legal) para fornecer atualizações necessárias sobre o andamento do processo terapêutico do(a) BENEFICIÁRIO(A).")}

${p("8.2. Tais reuniões terão caráter informativo e de orientação, preservando integralmente o sigilo sobre o conteúdo das sessões do(a) BENEFICIÁRIO(A). Serão compartilhadas apenas as informações estritamente necessárias ao acompanhamento e ao bem-estar do(a) menor, conforme o Código de Ética Profissional do Psicólogo e o Estatuto da Criança e do Adolescente.")}

${p("8.3. O agendamento dessas reuniões será feito em comum acordo entre a CONTRATADA e o(a) CONTRATANTE, conforme a necessidade clínica avaliada pelo(a) TERAPEUTA em conjunto com o(a) supervisor(a) responsável.")}

${sec("CLÁUSULA NONA — DA SUBSTITUIÇÃO DE TERAPEUTA OU SUPERVISOR")}

${p("9.1. A CONTRATADA poderá, em situações excepcionais (desligamento, afastamento prolongado do(a) terapeuta ou do(a) supervisor(a) responsável, ou outra causa devidamente justificada), promover a substituição do(a) TERAPEUTA e/ou do(a) PSICÓLOGO(A) RESPONSÁVEL PELA SUPERVISÃO, comunicando previamente o(a) CONTRATANTE.")}

${p("9.2. Nessas hipóteses, a CONTRATADA buscará oferecer continuidade do acompanhamento por meio de outro(a) terapeuta vinculado(a) à instituição, mediante anuência do(a) CONTRATANTE, sendo facultada a este(a) a rescisão do contrato sem ônus, observada a regra de aviso prevista na Cláusula 7.2.")}

${sec("CLÁUSULA DÉCIMA — DA VIGÊNCIA")}

${p(`10.1. O presente contrato terá vigência de ${v("vig_meses")} (${mesesExt}) meses, contados a partir da data de sua assinatura, podendo ser renovado por acordo entre as partes.`)}

${sec("CLÁUSULA DÉCIMA PRIMEIRA — DO FORO")}

${p(`11.1. As partes elegem o foro da ${ALLOS_INST.foro} para dirimir quaisquer dúvidas ou controvérsias oriundas do presente contrato, renunciando a qualquer outro, por mais privilegiado que seja.`)}

${p("E por estarem de acordo, as partes assinam o presente contrato em duas vias de igual teor e forma.")}

${center(`${ALLOS_INST.cidade}, ${v("vig_data")}.`)}

<div style="margin-top:50pt;">
  ${sigBlock([
    { text: `<b>${v("resp_nome")}</b>` },
    { text: `CPF: ${v("resp_cpf")}` },
    { text: "CONTRATANTE (RESPONSÁVEL LEGAL)", bold: true },
  ])}
  ${sigBlock([
    { text: `<b>${ALLOS_INST.nome}</b>` },
    { text: `CNPJ: ${ALLOS_INST.cnpj}` },
    { text: "CONTRATADA", bold: true },
  ])}
  ${sigBlock([
    { text: `<b>${v("sup_nome")}</b>` },
    { text: `CRP: ${v("sup_crp")}` },
    { text: "PSICÓLOGO(A) RESPONSÁVEL PELA SUPERVISÃO", bold: true },
  ])}
  ${sigBlock([
    { text: `<b>${v("ter_nome")}</b>` },
    { text: `CPF: ${v("ter_cpf")}` },
    { text: `Registro: ${ter_reg}` },
    { text: "TERAPEUTA RESPONSÁVEL PELO ATENDIMENTO", bold: true },
  ])}
</div>`;
}

/* ════════════════════════════════════════════
   ATESTADO PSICOLÓGICO — render
   Assinado pelo(a) psicólogo(a) supervisor(a)
   (CRP ativo). Terapeuta aparece apenas como
   responsável pelo atendimento.
   ════════════════════════════════════════════ */
function renderAtestado(d) {
  const v = (id) => d[id] || `[${id}]`;
  const has = (id) => Boolean(d[id] && d[id].toString().trim());

  return `
${docHeader("ATESTADO PSICOLÓGICO")}

${p(`Atesta-se, para fins de <b>${v("finalidade")}</b>, que <b>${v("pac_nome")}</b>, ${v("pac_idade")}, inscrito(a) no CPF sob o nº ${v("pac_cpf")}, foi submetido(a) a processo de avaliação psicológica realizado no âmbito da <b>${ALLOS_INST.nome}</b>, ${ALLOS_INST.natureza} (CNPJ ${ALLOS_INST.cnpj}), cujos resultados indicam:`)}

${p(`<i>${v("conclusao")}</i>`)}

${has("recomendacao") ? p(`<b>Recomendação:</b> ${v("recomendacao")}`) : ""}

${has("ter_nome") ? p(`O atendimento foi conduzido pelo(a) terapeuta <b>${v("ter_nome")}</b>, vinculado(a) à ${ALLOS_INST.nome} e integrante de seu programa de supervisão clínica continuada, sob supervisão técnica do(a) psicólogo(a) abaixo identificado(a), responsável técnico(a) pelo presente atestado.`) : ""}

${p("O presente atestado é emitido em conformidade com a Resolução CFP nº 06/2019.")}

${center(`${v("cidade")}, ${v("data")}.`)}

<div style="margin-top:60pt;">
  ${sigBlock([
    { text: `<b>${v("sup_nome")}</b>` },
    { text: `CRP ${v("sup_crp")}` },
    { text: "Psicólogo(a) responsável", bold: true },
  ])}
</div>`;
}

/* ════════════════════════════════════════════
   TERMO DE AUTORIZAÇÃO — render
   ════════════════════════════════════════════ */
function renderTermo(d) {
  const v = (id) => d[id] || `[${id}]`;
  const has = (id) => Boolean(d[id] && d[id].toString().trim());

  return `
${docHeader("TERMO DE AUTORIZAÇÃO PARA PSICOTERAPIA DE CRIANÇA OU ADOLESCENTE")}

${p("Em conformidade com a Resolução CFP nº 13/2022, o(a) responsável legal abaixo qualificado(a) autoriza, expressamente, a realização de psicoterapia em favor da criança ou adolescente identificado(a) neste termo, no âmbito da <b>" + ALLOS_INST.nome + "</b>, " + ALLOS_INST.natureza + ", inscrita no CNPJ sob o nº " + ALLOS_INST.cnpj + ".")}

${sec("RESPONSÁVEL LEGAL")}
${p(`<b>Nome:</b> ${v("resp_nome")}`)}
${p(`<b>Data de nascimento:</b> ${v("resp_nascimento")}`)}
${p(`<b>Documento:</b> ${v("resp_documento")}`)}
${p(`<b>Endereço:</b> ${v("resp_endereco")}`)}

${sec("CRIANÇA / ADOLESCENTE")}
${p(`<b>Nome:</b> ${v("pac_nome")}`)}
${p(`<b>Data de nascimento:</b> ${v("pac_nascimento")}`)}
${p(`<b>Documento:</b> ${v("pac_documento")}`)}

${p("O(a) responsável declara estar ciente de que: (a) o atendimento será conduzido por terapeuta vinculado(a) à " + ALLOS_INST.nome + ", com supervisão técnica de psicólogo(a) com registro profissional ativo, responsável pelo ato clínico; (b) o conteúdo das sessões poderá ser discutido em espaço de supervisão, preservados o sigilo profissional e a finalidade estritamente clínica e formativa; (c) este documento possui caráter sigiloso e extrajudicial.")}

${has("ter_nome") ? p(`Atendimento conduzido por: <b>${v("ter_nome")}</b>.`) : ""}

${center(`${v("cidade")}, ${v("data")}.`)}

<div style="margin-top:50pt;">
  ${sigBlock([
    { text: `<b>${v("resp_nome")}</b>` },
    { text: "Responsável legal", bold: true },
  ])}
  ${sigBlock([
    { text: `<b>${v("sup_nome")}</b>` },
    { text: `CRP ${v("sup_crp")}` },
    { text: "Psicólogo(a) responsável", bold: true },
  ])}
</div>`;
}

/* ════════════════════════════════════════════
   FORMULÁRIO DE ENCAMINHAMENTO — render
   ════════════════════════════════════════════ */
function renderEncaminhamento(d) {
  const v = (id) => d[id] || `[${id}]`;
  const has = (id) => Boolean(d[id] && d[id].toString().trim());

  return `
${docHeader("FORMULÁRIO DE ENCAMINHAMENTO")}

${p("O(a) psicólogo(a) abaixo identificado(a) encaminha o(a) usuário(a) qualificado(a) neste documento ao serviço de destino indicado, conforme detalhado a seguir.")}

${sec("ORIGEM E MOTIVO")}
${p(`<b>Instituição de origem:</b> ${v("inst_origem")}`)}
${p(`<b>Motivo do encaminhamento:</b> ${v("motivo")}`)}

${sec("SERVIÇO DE DESTINO")}
${p(`<b>Serviço:</b> ${v("destino_servico")}`)}
${p(`<b>Endereço:</b> ${v("destino_endereco")}`)}
${p(`<b>Telefone:</b> ${v("destino_telefone")}`)}

${sec("USUÁRIO(A) ENCAMINHADO(A)")}
${p(`<b>Nome:</b> ${v("usuario_nome")}`)}
${has("usuario_responsavel") ? p(`<b>Responsável legal:</b> ${v("usuario_responsavel")}`) : ""}
${p(`<b>Data de nascimento:</b> ${v("usuario_nascimento")}`)}
${p(`<b>Telefone:</b> ${v("usuario_telefone")}`)}

${has("ter_nome") ? p(`O acompanhamento na instituição de origem foi conduzido pelo(a) terapeuta <b>${v("ter_nome")}</b>, sob supervisão técnica do(a) psicólogo(a) abaixo identificado(a).`) : ""}

${p("Este documento possui caráter sigiloso e extrajudicial. Emitido como instrumento auxiliar de cuidado, conforme orientações do Manual de Elaboração de Documentos Escritos (CFP, 2025).")}

${center(`${v("cidade")}, ${v("data")}.`)}

<div style="margin-top:60pt;">
  ${sigBlock([
    { text: `<b>${v("ter_nome")}</b>` },
    { text: "Terapeuta responsável pelo acompanhamento", bold: true },
  ])}
  ${sigBlock([
    { text: `<b>${v("sup_nome")}</b>` },
    { text: `CRP ${v("sup_crp")}` },
    { text: "Psicólogo(a) responsável", bold: true },
  ])}
</div>`;
}

/* ════════════════════════════════════════════
   EXPORTERS
   ════════════════════════════════════════════ */
function buildPrintHTML(content, title) {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>${title}</title><style>
@page{size:A4;margin:2cm}
@media print{body{margin:0}}
body{font-family:Georgia,'Times New Roman',Times,serif;font-size:11pt;line-height:1.6;color:#000;max-width:720px;margin:20px auto;padding:24px}
h1{font-size:15pt;text-align:center;margin-bottom:6pt}
h2{font-size:13pt;color:${C.sage};border-bottom:1pt solid ${C.teal};padding-bottom:4pt;margin-top:14pt;margin-bottom:6pt;font-weight:700}
p{margin:6pt 0;text-align:justify;line-height:1.7}
</style></head><body>${content}</body></html>`;
}

function exportDOCX(content, filename) {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]--><style>@page{size:A4;margin:2cm}body{font-family:Georgia,'Times New Roman',Times,serif;font-size:11pt;line-height:1.6;color:#000}h1{margin-bottom:8pt}h2{margin-top:14pt;color:${C.sage}}p{margin:6pt 0}</style></head><body>${content}</body></html>`;
  const blob = new Blob(["﻿"+html], {type:"application/msword"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function exportPDF(content, title) {
  const w = window.open("","_blank");
  w.document.write(buildPrintHTML(content, title));
  w.document.close();
  setTimeout(() => w.print(), 400);
}

/* ════════════════════════════════════════════
   GLOBAL CSS — Allos look (cream + Fraunces/DM)
   ════════════════════════════════════════════ */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans','Helvetica Neue',Arial,sans-serif;background:${C.cream};color:${C.charcoal};overflow:hidden}

/* Grão sutil global, igual ao site */
.allos-grain::before{
  content:'';position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.025;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat:repeat;background-size:200px 200px;
}

::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-track{background:${C.creamAlt}}
::-webkit-scrollbar-thumb{background:#C4BAA8;border-radius:5px;border:2px solid ${C.creamAlt}}
::-webkit-scrollbar-thumb:hover{background:#A89E8C}
::selection{background:rgba(46,158,143,0.18)}

.fade-in{animation:fadeIn .4s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

.font-fraunces{font-family:'Fraunces','Times New Roman',serif}
.font-dm{font-family:'DM Sans','Helvetica Neue',Arial,sans-serif}

/* Form input — light theme */
.allos-input{
  width:100%;padding:10px 14px;border-radius:8px;
  border:1px solid ${C.border};background:#fff;color:${C.charcoal};
  font-size:13.5px;font-family:'DM Sans',sans-serif;outline:none;
  transition:border-color .2s,box-shadow .2s;
}
.allos-input:focus{
  border-color:${C.teal};box-shadow:0 0 0 3px rgba(46,158,143,0.15);
}
.allos-input::placeholder{color:#B5AEA0}

textarea.allos-input{resize:vertical;min-height:80px;line-height:1.55;font-family:'DM Sans',sans-serif}

/* RESIZER — drag handle entre form e preview */
.doc-resizer{
  position:relative;flex:0 0 auto;align-self:stretch;
  background:${C.creamAlt};border:0;padding:0;margin:0;
  transition:background .15s;
  touch-action:none;
}
.doc-resizer:hover,.doc-resizer.dragging{background:${C.teal}33}
.doc-resizer::before{
  content:'';position:absolute;left:50%;top:50%;
  transform:translate(-50%,-50%);
  background:${C.muted};opacity:.45;border-radius:2px;
  transition:background .15s,opacity .15s;
}
.doc-resizer:hover::before,.doc-resizer.dragging::before{
  background:${C.teal};opacity:.95;
}
/* desktop: vertical bar (drag horizontally) */
.doc-resizer.is-desktop{width:6px;cursor:col-resize;
  border-left:1px solid ${C.border};border-right:1px solid ${C.border}}
.doc-resizer.is-desktop::before{width:2px;height:36px}
/* mobile: horizontal bar (drag vertically) */
.doc-resizer.is-mobile{height:14px;width:100%;cursor:row-resize;
  border-top:1px solid ${C.border};border-bottom:1px solid ${C.border}}
.doc-resizer.is-mobile::before{width:42px;height:3px}

/* RESPONSIVE */
@media(max-width:1024px){
  .app-sidebar{width:56px!important;min-width:56px!important}
  .sidebar-expanded-only{display:none!important}
  .doc-paper{padding:28px 22px!important}
}
@media(max-width:640px){
  .app-sidebar{width:0px!important;min-width:0px!important;border:none!important}
  .mobile-header{display:flex!important}
  .doc-paper{padding:22px 16px!important;font-size:10pt!important}
  .doc-actions{flex-wrap:wrap}
}
`;

/* ════════════════════════════════════════════
   LOGO — ALL_dOcS
   Maiúsculas em teal Allos · minúsculas + "_" em terracota
   ════════════════════════════════════════════ */
function AllDocsLogo({ size = 26 }) {
  const G = C.teal, O = C.accent;
  return (
    <span className="font-fraunces" style={{
      fontWeight: 700, fontSize: size, letterSpacing: -0.5,
      lineHeight: 1, display: "inline-block",
    }}>
      <span style={{color:G}}>A</span>
      <span style={{color:G}}>L</span>
      <span style={{color:G}}>L</span>
      <span style={{color:O}}>_</span>
      <span style={{color:O,fontStyle:"italic"}}>d</span>
      <span style={{color:G}}>O</span>
      <span style={{color:O,fontStyle:"italic"}}>c</span>
      <span style={{color:G}}>S</span>
    </span>
  );
}

function AllDocsMark({ size = 22 }) {
  return (
    <span className="font-fraunces" style={{fontWeight:700,fontSize:size,letterSpacing:-0.5}}>
      <span style={{color:C.teal}}>A</span>
      <span style={{color:C.accent,fontStyle:"italic"}}>d</span>
    </span>
  );
}

/* ════════════════════════════════════════════
   FORM FIELD
   ════════════════════════════════════════════ */
function Field({ field, value, onChange }) {
  const isTextarea = field.type === "textarea";

  return (
    <div style={{marginBottom:14}}>
      <label className="font-dm" style={{
        display: "block", fontSize: 11, color: C.muted,
        marginBottom: 5, fontWeight: 500,
        letterSpacing: ".4px", textTransform: "uppercase",
      }}>{field.label}</label>
      {isTextarea ? (
        <textarea
          className="allos-input"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder={field.ph}
          rows={field.rows || 3}
        />
      ) : (
        <input
          className="allos-input"
          type="text"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder={field.ph}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   ACTION BUTTON — Allos style (rounded-full, teal/accent)
   ════════════════════════════════════════════ */
function ActionBtn({ label, color, onClick, variant = "filled" }) {
  const filled = variant === "filled";
  const bg = filled ? color : "transparent";
  const fg = filled ? "#fff" : color;
  const border = filled ? "none" : `1.5px solid ${color}`;

  return (
    <button onClick={onClick}
      className="font-dm"
      style={{
        background: bg, color: fg, border,
        borderRadius: 999, padding: "11px 24px", fontSize: 13.5,
        fontWeight: 600, cursor: "pointer",
        transition: "transform .15s, box-shadow .2s, background .2s",
        boxShadow: filled ? `0 6px 22px ${color}55, inset 0 1px 0 rgba(255,255,255,.1)` : "none",
        letterSpacing: ".2px",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-1px)";
        if (filled) e.currentTarget.style.boxShadow = `0 10px 32px ${color}77`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none";
        if (filled) e.currentTarget.style.boxShadow = `0 6px 22px ${color}55, inset 0 1px 0 rgba(255,255,255,.1)`;
      }}>
      {label}
    </button>
  );
}

/* ════════════════════════════════════════════
   META INFO PANEL — Quando usar / Vedações / Base legal
   ════════════════════════════════════════════ */
function MetaItem({ icon, label, text, color }) {
  return (
    <div style={{display:"flex",gap:10,marginBottom:10}}>
      <div style={{
        flexShrink: 0, width: 28, height: 28, borderRadius: 999,
        background: color + "20", color: color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14,
      }}>{icon}</div>
      <div style={{flex:1}}>
        <div className="font-dm" style={{
          fontSize: 9.5, fontWeight: 600, letterSpacing: ".15em",
          textTransform: "uppercase", color: C.muted, marginBottom: 2,
        }}>{label}</div>
        <div className="font-dm" style={{fontSize:12.5,lineHeight:1.55,color:C.charcoal}}>{text}</div>
      </div>
    </div>
  );
}

function MetaPanel({ meta }) {
  if (!meta) return null;
  return (
    <div style={{
      background: C.cardBg, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "16px 16px 8px", marginBottom: 18,
    }}>
      <MetaItem icon="🕐" label="Quando usar" text={meta.quando} color={C.teal} />
      <MetaItem icon="👤" label="Quem pode solicitar" text={meta.quem} color={C.sage} />
      {meta.vedacoes && <MetaItem icon="🚫" label="Vedações" text={meta.vedacoes} color={C.accent} />}
      <MetaItem icon="📖" label="Base legal" text={meta.baseLegal} color={C.charcoal} />
    </div>
  );
}

/* ════════════════════════════════════════════
   DOC PAPER (preview)
   ════════════════════════════════════════════ */
function DocPaper({ html }) {
  return (
    <div className="doc-paper" style={{
      background: "#fff",
      maxWidth: 720, margin: "0 auto", padding: "50px 52px",
      borderRadius: 4,
      boxShadow: "0 4px 26px rgba(45,52,54,0.08), 0 1px 3px rgba(45,52,54,0.05)",
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "11pt", lineHeight: 1.6, minHeight: 600,
      color: C.charcoal,
    }}>
      <div dangerouslySetInnerHTML={{__html: html}} />
    </div>
  );
}

/* ════════════════════════════════════════════
   useViewport — detecta mobile (< 1024px) reativamente
   ════════════════════════════════════════════ */
function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia(`(max-width:${breakpoint}px)`).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${breakpoint}px)`);
    const update = () => setIsMobile(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return isMobile;
}

/* ════════════════════════════════════════════
   useResizablePanel — largura/altura persistida em localStorage,
   ajustável via drag (Pointer Events: mouse + touch + pen)
   ════════════════════════════════════════════ */
function usePersistedSize(key, defaultValue) {
  const [val, setVal] = useState(() => {
    if (typeof window === "undefined") return defaultValue;
    const stored = window.localStorage.getItem(key);
    const n = stored ? parseFloat(stored) : NaN;
    return Number.isFinite(n) ? n : defaultValue;
  });
  useEffect(() => {
    try { window.localStorage.setItem(key, String(val)); } catch { /* ignore */ }
  }, [key, val]);
  return [val, setVal];
}

/* ════════════════════════════════════════════
   RESIZER — barra arrastável entre dois painéis
   ════════════════════════════════════════════ */
function Resizer({ orientation, onResize }) {
  const [dragging, setDragging] = useState(false);
  const ref = useRef(null);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
    const startX = e.clientX, startY = e.clientY;
    const isVertical = orientation === "horizontal"; // resizer horizontal = drag vertical

    const move = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      onResize(isVertical ? dy : dx);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    document.body.style.userSelect = "none";
    document.body.style.cursor = isVertical ? "row-resize" : "col-resize";
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }, [orientation, onResize]);

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation === "horizontal" ? "horizontal" : "vertical"}
      aria-label="Redimensionar painel do formulário"
      tabIndex={0}
      className={`doc-resizer ${orientation === "horizontal" ? "is-mobile" : "is-desktop"}${dragging ? " dragging" : ""}`}
      onPointerDown={handlePointerDown}
      onKeyDown={(e) => {
        // teclado: setas movem 16px por vez
        const step = 16;
        if (orientation === "vertical") {
          if (e.key === "ArrowLeft") onResize(-step);
          if (e.key === "ArrowRight") onResize(step);
        } else {
          if (e.key === "ArrowUp") onResize(-step);
          if (e.key === "ArrowDown") onResize(step);
        }
      }}
    />
  );
}

/* ════════════════════════════════════════════
   DOC EDITOR (form + preview, com resizer)
   ════════════════════════════════════════════ */
const FORM_W_MIN = 280, FORM_W_MAX_PAD = 320;     // desktop: viewport - 320 max
const FORM_H_MIN = 140, FORM_H_MAX_PAD = 120;     // mobile : viewport - 120 max
const FORM_W_DEFAULT = 400;
const FORM_H_DEFAULT = 360;

function DocEditor({
  data, setData, fieldGroups, buildHTML,
  filenameBase, exportTitle,
  title, subtitle, meta,
}) {
  const update = (id, val) => setData(prev => ({...prev, [id]: val}));
  const html = buildHTML(data);
  const isMobile = useIsMobile();

  const [formW, setFormW] = usePersistedSize("alldocs.formW", FORM_W_DEFAULT);
  const [formH, setFormH] = usePersistedSize("alldocs.formH", FORM_H_DEFAULT);

  // O Resizer entrega o delta acumulado desde o início do drag.
  // Capturamos a "origem" no primeiro delta (chamado a cada move),
  // e zeramos em pointerup via efeito global.
  const dragOriginRef = useRef(null);
  const onResize = useCallback((delta) => {
    if (dragOriginRef.current === null) {
      dragOriginRef.current = isMobile ? formH : formW;
    }
    const origin = dragOriginRef.current;
    if (isMobile) {
      const max = window.innerHeight - FORM_H_MAX_PAD;
      setFormH(Math.max(FORM_H_MIN, Math.min(max, origin + delta)));
    } else {
      const max = window.innerWidth - FORM_W_MAX_PAD;
      setFormW(Math.max(FORM_W_MIN, Math.min(max, origin + delta)));
    }
  }, [isMobile, formW, formH, setFormW, setFormH]);

  useEffect(() => {
    const reset = () => { dragOriginRef.current = null; };
    window.addEventListener("pointerup", reset);
    window.addEventListener("pointercancel", reset);
    return () => {
      window.removeEventListener("pointerup", reset);
      window.removeEventListener("pointercancel", reset);
    };
  }, []);

  // Re-clamp se a viewport diminuir e o tamanho salvo ficar maior do que cabe.
  useEffect(() => {
    const onWinResize = () => {
      if (isMobile) {
        const max = window.innerHeight - FORM_H_MAX_PAD;
        setFormH(prev => Math.min(prev, max));
      } else {
        const max = window.innerWidth - FORM_W_MAX_PAD;
        setFormW(prev => Math.min(prev, max));
      }
    };
    window.addEventListener("resize", onWinResize);
    return () => window.removeEventListener("resize", onWinResize);
  }, [isMobile, setFormW, setFormH]);

  // nome de arquivo seguro
  const fileSafe = (data.pac_nome || data.resp_nome || data.usuario_nome || "Allos")
    .trim().replace(/\s+/g, "_") || "Allos";

  const formStyle = isMobile
    ? { width: "100%", minWidth: 0, height: formH, flex: `0 0 ${formH}px`,
        background: C.creamAlt, borderBottom: `1px solid ${C.border}`,
        overflowY: "auto", padding: "20px 18px" }
    : { width: formW, minWidth: formW, flex: `0 0 ${formW}px`,
        background: C.creamAlt, borderRight: `1px solid ${C.border}`,
        overflowY: "auto", padding: "26px 22px" };

  return (
    <div className="fade-in doc-editor-layout"
      style={{display:"flex",height:"100%",overflow:"hidden",flexDirection:isMobile?"column":"row"}}>
      {/* LEFT/TOP: form */}
      <div className="doc-form-panel" style={formStyle}>
        <div style={{marginBottom:18}}>
          <h2 className="font-fraunces" style={{
            fontSize: 24, fontWeight: 600, color: C.charcoal,
            lineHeight: 1.15, letterSpacing: -0.3,
          }}>{title}</h2>
          {subtitle && (
            <p className="font-dm" style={{
              fontSize: 12.5, color: C.muted, marginTop: 4,
            }}>{subtitle}</p>
          )}
          <div style={{
            height: 1, background: C.border,
            marginTop: 14, marginBottom: 4,
          }} />
        </div>

        <MetaPanel meta={meta} />

        {fieldGroups.map((group, gi) => (
          <div key={gi}>
            <div style={{display:"flex",alignItems:"center",gap:8,margin:"18px 0 10px"}}>
              <span style={{fontSize:14}}>{group.icon}</span>
              <div className="font-dm" style={{
                fontSize: 10, textTransform: "uppercase", letterSpacing: 1.4,
                color: C.sage, fontWeight: 600,
              }}>{group.title}</div>
              <div style={{flex:1,height:1,background:C.border,marginLeft:6}} />
            </div>
            {group.fields.map(f => (
              <Field key={f.id} field={f} value={data[f.id]} onChange={v => update(f.id, v)} />
            ))}
          </div>
        ))}
      </div>

      {/* RESIZER */}
      <Resizer
        orientation={isMobile ? "horizontal" : "vertical"}
        onResize={onResize}
      />

      {/* RIGHT/BOTTOM: preview + actions */}
      <div className="doc-preview-panel" style={{
        flex: 1, minHeight: 0, overflowY: "auto", background: C.cream,
        padding: isMobile ? 18 : 30,
      }}>
        <div className="doc-actions" style={{
          display: "flex", gap: 12, marginBottom: 22, justifyContent: "flex-end",
        }}>
          <ActionBtn label="📄  Gerar PDF" color={C.teal}
            onClick={() => exportPDF(html, exportTitle)} />
          <ActionBtn label="📝  Gerar DOCX" color={C.accent}
            onClick={() => exportDOCX(html, `${filenameBase}_${fileSafe}.doc`)} />
        </div>

        <DocPaper html={html} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   SIDEBAR ITEM
   ════════════════════════════════════════════ */
function SidebarItem({ icon, label, active, open, onClick, accent }) {
  const [hovered, setHovered] = useState(false);
  const activeColor = accent || C.teal;

  return (
    <button onClick={onClick} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      className="font-dm"
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 10,
        padding: open ? "11px 18px" : "11px 0",
        background: active ? `${activeColor}26` : (hovered ? C.sidebarHover : "transparent"),
        border: "none",
        borderLeft: active ? `3px solid ${activeColor}` : "3px solid transparent",
        color: active ? "#fff" : (hovered ? C.sidebarText : C.sidebarSoft),
        cursor: "pointer", fontSize: 13.5,
        fontWeight: active ? 600 : 400,
        transition: "all .15s", textAlign: "left",
        justifyContent: open ? "flex-start" : "center",
      }}>
      <span style={{fontSize:16,opacity:active?1:.85}}>{icon}</span>
      {open && <span style={{whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{label}</span>}
    </button>
  );
}

function SidebarSectionLabel({ children }) {
  return (
    <div className="font-dm" style={{
      padding: "12px 18px 6px", fontSize: 9.5,
      textTransform: "uppercase", letterSpacing: 2.2,
      color: C.sidebarMuted, fontWeight: 600,
    }}>{children}</div>
  );
}

/* ════════════════════════════════════════════
   MOBILE HEADER + OVERLAY
   ════════════════════════════════════════════ */
function MobileHeader({ sidebarOpen, setSidebarOpen }) {
  return (
    <div className="mobile-header" style={{
      display: "none", alignItems: "center", justifyContent: "space-between",
      padding: "12px 18px", background: C.cream,
      borderBottom: `1px solid ${C.border}`,
    }}>
      <button onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{background:"transparent",border:"none",color:C.charcoal,fontSize:22,cursor:"pointer",padding:4}}>☰</button>
      <AllDocsLogo size={20} />
      <div style={{width:30}} />
    </div>
  );
}

function MobileSidebarOverlay({ open, onClose, view, setView }) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex"}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.55)"}} />
      <div style={{position:"relative",width:280,maxWidth:"80vw",background:C.sidebar,overflowY:"auto",zIndex:1}}>
        <div style={{padding:"20px 18px",borderBottom:"1px solid rgba(253,251,247,0.12)"}}>
          <AllDocsLogo size={22} />
          <div className="font-dm" style={{fontSize:10.5,color:C.sidebarMuted,marginTop:6,letterSpacing:.4}}>
            Documentos clínicos · Associação Allos
          </div>
        </div>
        <SidebarSectionLabel>Contratos</SidebarSectionLabel>
        <SidebarItem icon="👤" label="Contrato — Adulto" active={view === "contrato_adulto"} open
          onClick={() => { setView("contrato_adulto"); onClose(); }} />
        <SidebarItem icon="🧒" label="Contrato — Crianças e Adolescentes" active={view === "contrato_menor"} open accent={C.accent}
          onClick={() => { setView("contrato_menor"); onClose(); }} />

        <SidebarSectionLabel>Documentos clínicos</SidebarSectionLabel>
        <SidebarItem icon="📜" label="Atestado psicológico" active={view === "atestado"} open
          onClick={() => { setView("atestado"); onClose(); }} />
        <SidebarItem icon="✍️" label="Termo de autorização" active={view === "termo"} open accent={C.accent}
          onClick={() => { setView("termo"); onClose(); }} />
        <SidebarItem icon="📨" label="Formulário de encaminhamento" active={view === "encaminhamento"} open
          onClick={() => { setView("encaminhamento"); onClose(); }} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   APP — root
   ════════════════════════════════════════════ */
export default function App() {
  const [view, setView] = useState("contrato_adulto");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Estado isolado para cada documento
  const [dataContratoAdulto, setDataContratoAdulto] = useState({...DEFAULT_CONTRATO_ADULTO});
  const [dataContratoMenor, setDataContratoMenor] = useState({...DEFAULT_CONTRATO_MENOR});
  const [dataAtestado, setDataAtestado] = useState({...DEFAULT_ATESTADO});
  const [dataTermo, setDataTermo] = useState({...DEFAULT_TERMO});
  const [dataEncaminhamento, setDataEncaminhamento] = useState({...DEFAULT_ENCAMINHAMENTO});

  return (
    <div className="allos-grain" style={{
      display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden",
      background: C.cream, color: C.charcoal,
    }}>
      <style>{css}</style>

      <MobileHeader sidebarOpen={mobileSidebarOpen} setSidebarOpen={setMobileSidebarOpen} />
      <MobileSidebarOverlay
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        view={view} setView={setView} />

      <div style={{display:"flex",flex:1,overflow:"hidden",position:"relative",zIndex:1}}>
        {/* SIDEBAR */}
        <div className="app-sidebar" style={{
          width: sidebarOpen ? 280 : 60, minWidth: sidebarOpen ? 280 : 60,
          background: C.sidebar, color: C.sidebarText,
          borderRight: `1px solid rgba(253,251,247,0.05)`,
          display: "flex", flexDirection: "column",
          transition: "all .3s ease", overflow: "hidden",
        }}>
          {/* Logo */}
          <div style={{
            padding: sidebarOpen ? "22px 18px" : "22px 12px",
            borderBottom: "1px solid rgba(253,251,247,0.10)",
            cursor: "pointer",
          }} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? (
              <div className="sidebar-expanded-only">
                <AllDocsLogo size={26} />
                <div className="font-dm" style={{
                  fontSize: 10.5, color: C.sidebarMuted, marginTop: 7, letterSpacing: .4,
                }}>
                  Documentos clínicos · Associação Allos
                </div>
              </div>
            ) : (
              <div style={{textAlign:"center"}}>
                <AllDocsMark size={22} />
              </div>
            )}
          </div>

          {/* Nav */}
          <div style={{padding:"8px 0 16px",flex:1,overflowY:"auto"}}>
            {sidebarOpen && (
              <div className="sidebar-expanded-only">
                <SidebarSectionLabel>Contratos</SidebarSectionLabel>
              </div>
            )}
            <SidebarItem icon="👤" label="Contrato — Adulto"
              active={view === "contrato_adulto"} open={sidebarOpen}
              onClick={() => setView("contrato_adulto")} />
            <SidebarItem icon="🧒" label="Contrato — Crianças e Adolescentes"
              active={view === "contrato_menor"} open={sidebarOpen} accent={C.accent}
              onClick={() => setView("contrato_menor")} />

            {sidebarOpen && (
              <div className="sidebar-expanded-only">
                <SidebarSectionLabel>Documentos clínicos</SidebarSectionLabel>
              </div>
            )}
            <SidebarItem icon="📜" label="Atestado psicológico"
              active={view === "atestado"} open={sidebarOpen}
              onClick={() => setView("atestado")} />
            <SidebarItem icon="✍️" label="Termo de autorização"
              active={view === "termo"} open={sidebarOpen} accent={C.accent}
              onClick={() => setView("termo")} />
            <SidebarItem icon="📨" label="Formulário de encaminhamento"
              active={view === "encaminhamento"} open={sidebarOpen}
              onClick={() => setView("encaminhamento")} />
          </div>

          {/* Footer */}
          {sidebarOpen && (
            <div className="sidebar-expanded-only font-dm" style={{
              padding: "14px 18px", borderTop: "1px solid rgba(253,251,247,0.10)",
              fontSize: 10.5, color: C.sidebarMuted, lineHeight: 1.6,
            }}>
              <div style={{color:C.sidebarSoft,marginBottom:3}}>{ALLOS_INST.nome}</div>
              <div>CNPJ {ALLOS_INST.cnpj}</div>
              <div>CFP 010/2005 · 011/2018 · 06/2019 · 13/2022</div>
            </div>
          )}
        </div>

        {/* MAIN */}
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {view === "contrato_adulto" && (
            <DocEditor
              data={dataContratoAdulto} setData={setDataContratoAdulto}
              fieldGroups={FIELDS_CONTRATO_ADULTO}
              buildHTML={renderContratoAdulto}
              filenameBase="Contrato_Allos_Adulto"
              exportTitle="Contrato Allos — Adulto"
              title="Contrato — Adulto"
              subtitle="Atendimento psicológico online · prestação de serviços" />
          )}

          {view === "contrato_menor" && (
            <DocEditor
              data={dataContratoMenor} setData={setDataContratoMenor}
              fieldGroups={FIELDS_CONTRATO_MENOR}
              buildHTML={renderContratoMenor}
              filenameBase="Contrato_Allos_Menor"
              exportTitle="Contrato Allos — Crianças e Adolescentes"
              title="Contrato — Crianças e Adolescentes"
              subtitle="Atendimento psicológico online · prestação de serviços" />
          )}

          {view === "atestado" && (
            <DocEditor
              data={dataAtestado} setData={setDataAtestado}
              fieldGroups={FIELDS_ATESTADO}
              buildHTML={renderAtestado}
              filenameBase="Atestado_Allos"
              exportTitle="Atestado Psicológico — Allos"
              title="Atestado psicológico"
              subtitle="Documento técnico · responsabilidade do(a) psicólogo(a) supervisor(a)"
              meta={META_ATESTADO} />
          )}

          {view === "termo" && (
            <DocEditor
              data={dataTermo} setData={setDataTermo}
              fieldGroups={FIELDS_TERMO}
              buildHTML={renderTermo}
              filenameBase="Termo_Autorizacao_Allos"
              exportTitle="Termo de Autorização — Allos"
              title="Termo de autorização"
              subtitle="Psicoterapia de crianças e adolescentes · Res. CFP 13/2022"
              meta={META_TERMO} />
          )}

          {view === "encaminhamento" && (
            <DocEditor
              data={dataEncaminhamento} setData={setDataEncaminhamento}
              fieldGroups={FIELDS_ENCAMINHAMENTO}
              buildHTML={renderEncaminhamento}
              filenameBase="Encaminhamento_Allos"
              exportTitle="Formulário de Encaminhamento — Allos"
              title="Formulário de encaminhamento"
              subtitle="Encaminhamento a serviço externo · instrumento auxiliar de cuidado"
              meta={META_ENCAMINHAMENTO} />
          )}
        </div>
      </div>
    </div>
  );
}
