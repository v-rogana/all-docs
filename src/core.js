/* ════════════════════════════════════════════
   CORE — paleta, dados institucionais, helpers de HTML
   e exportadores. Compartilhado entre os documentos
   clínicos (app.jsx) e a área de estágios (estagios/).
   ════════════════════════════════════════════ */

/* ────────────────────────────────────────────
   PALETA — extraída do site Allos
   ──────────────────────────────────────────── */
export const C = {
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
export const ALLOS_INST = {
  nome: "ASSOCIAÇÃO ALLOS",
  natureza: "associação civil sem fins lucrativos",
  cnpj: "50.990.346/0001-52",
  endereco: "Rua Rio Negro, 1048, Barroca, Belo Horizonte/MG — CEP 30.431-058",
  cidade: "Belo Horizonte/MG",
  foro: "Comarca de Belo Horizonte/MG",
};

/* Representante legal — assina os instrumentos institucionais
   (TCE e contratos de prestação de serviços). */
export const ALLOS_REP = {
  nome: "ALAN ABDALLAH ROGANA",
  nomeCap: "Alan Abdallah Rogana",
  cargo: "Diretor Presidente",
  qualificacao: "brasileiro, solteiro, presidente do conselho diretor da Associação Allos",
  cpf: "115.202.266-08",
  rg: "17974987",
  rgOrgao: "SSPMG",
  endereco: "Rua Japão, nº 384, bairro Alto Barroca, Belo Horizonte/MG — CEP 30.431-048",
  email: "diretoria@allos.org.br",
};

/* ════════════════════════════════════════════
   NÚMEROS POR EXTENSO
   ════════════════════════════════════════════ */
export function valorPorExtenso(val) {
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

export function mesesPorExtenso(m) {
  const map = { 1:"um",2:"dois",3:"três",4:"quatro",5:"cinco",6:"seis",
    7:"sete",8:"oito",9:"nove",10:"dez",11:"onze",12:"doze",
    18:"dezoito",24:"vinte e quatro" };
  return map[parseInt(m)] || m;
}

/* ════════════════════════════════════════════
   DATAS — o store guarda ISO (YYYY-MM-DD);
   os documentos e as tabelas mostram pt-BR.
   ════════════════════════════════════════════ */
export const MESES_PT = ["janeiro","fevereiro","março","abril","maio","junho",
  "julho","agosto","setembro","outubro","novembro","dezembro"];

/** "2026-03-05" → "05/03/2026". Entrada inválida volta como veio. */
export function dataBR(iso) {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso).trim());
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/** "2026-03-05" → "05 de março de 2026". */
export function dataExtenso(iso) {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso).trim());
  if (!m) return iso;
  return `${m[3]} de ${MESES_PT[parseInt(m[2], 10) - 1]} de ${m[1]}`;
}

/** Dias entre hoje e a data ISO. Negativo = já venceu. null se vazia/inválida. */
export function diasAte(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(String(iso).trim())) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const [y, mo, d] = iso.split("-").map(Number);
  const alvo = new Date(y, mo - 1, d);
  return Math.round((alvo - hoje) / 86400000);
}

/** Data de hoje em ISO — usada como padrão em formulários. */
export function hojeISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Soma meses a uma data ISO, devolvendo ISO. Usado para sugerir vencimentos. */
export function addMeses(iso, meses) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(String(iso).trim())) return "";
  const n = parseInt(meses, 10);
  if (isNaN(n)) return "";
  const [y, mo, d] = iso.split("-").map(Number);
  const base = new Date(y, mo - 1 + n, d);
  const mm = String(base.getMonth() + 1).padStart(2, "0");
  const dd = String(base.getDate()).padStart(2, "0");
  return `${base.getFullYear()}-${mm}-${dd}`;
}

/* ════════════════════════════════════════════
   HELPERS DE RENDERIZAÇÃO HTML
   ════════════════════════════════════════════ */
export const sec = (title) => `<h2 style="font-family:Georgia,'Times New Roman',serif;font-size:13pt;color:${C.sage};border-bottom:1pt solid ${C.teal};padding-bottom:4pt;margin-top:18pt;margin-bottom:6pt;font-weight:700;letter-spacing:.3pt;">${title}</h2>`;
export const p = (text) => `<p style="text-align:justify;margin:6pt 0;line-height:1.7;">${text}</p>`;
export const center = (text) => `<p style="text-align:center;margin:8pt 0;line-height:1.7;">${text}</p>`;
// Texto de textarea (multilinha): cada quebra de linha vira um parágrafo próprio.
// opts.lead = rótulo em negrito antes do 1º parágrafo; opts.fmt = formata cada bloco.
export const paras = (text, { lead = "", fmt = (s) => s } = {}) => {
  const blocks = String(text).split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (!blocks.length) return lead ? p(lead) : "";
  return blocks
    .map((b, i) => p((i === 0 && lead ? lead + " " : "") + fmt(b)))
    .join("");
};
export const sigBlock = (lines) => `<div style="text-align:center;margin-bottom:36pt;">
  <p>___________________________________________</p>
  ${lines.map(l => `<p${l.bold ? ' style="font-weight:600;"' : ''}>${l.text}</p>`).join("")}
</div>`;

/** Lista <ul> com o mesmo espaçamento dos parágrafos do papel. */
export const ul = (items) => `<ul style="margin:6pt 0 6pt 18pt;padding:0;line-height:1.7;">${
  items.filter(Boolean).map(i => `<li style="margin:3pt 0;text-align:justify;">${i}</li>`).join("")
}</ul>`;

/** Escapa texto livre digitado pelo usuário antes de entrar no HTML do documento. */
export const esc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const LOGO_LIGHT_URL = `${typeof window !== "undefined" ? window.location.origin : ""}${import.meta.env.BASE_URL}logo-light.png`;
export const LOGO_DARK_URL = `${import.meta.env.BASE_URL}logo-dark.png`;

export const docHeader = (title, subtitle) => `
<table style="width:100%;border-collapse:collapse;margin-bottom:16pt;"><tr>
  <td style="border-bottom:0.75pt solid #1F4F49;padding-bottom:6pt;vertical-align:bottom;"><img src="${LOGO_LIGHT_URL}" alt="Associação Allos" style="width:84px;height:36px;" /></td>
  <td style="border-bottom:0.75pt solid #1F4F49;padding-bottom:6pt;vertical-align:bottom;text-align:right;font-family:Georgia,'Times New Roman',serif;font-size:8pt;color:#475569;line-height:1.4;"><p style="margin:0;">CNPJ 50.990.346/0001-52</p><p style="margin:0;">Associação Allos</p></td>
</tr></table>
<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:15pt;text-align:center;margin-bottom:4pt;letter-spacing:.4pt;">${title}</h1>
${subtitle ? `<p style="text-align:center;font-size:11pt;color:#475569;margin-bottom:18pt;font-style:italic;">${subtitle}</p>` : '<div style="margin-bottom:14pt;"></div>'}
`;

/* ════════════════════════════════════════════
   EXPORTADORES — PDF (print window) e DOCX (OOXML)
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

async function toDataURL(url) {
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return url; // fallback: mantém a URL original se o fetch falhar
  }
}

export async function exportDOCX(content, filename) {
  // Gera um .docx real (OOXML): a logo entra como mídia embutida no arquivo,
  // abrindo corretamente tanto no Word quanto no Google Docs.
  // A logo precisa virar data URI para o html-to-docx conseguir embuti-la.
  const logoData = await toDataURL(LOGO_LIGHT_URL);
  const embedded = content.split(LOGO_LIGHT_URL).join(logoData);
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Georgia,'Times New Roman',Times,serif;font-size:11pt;line-height:1.6;color:#000}h1{margin-bottom:8pt}h2{margin-top:14pt;color:${C.sage}}p{margin:6pt 0}</style></head><body>${embedded}</body></html>`;

  // Carrega a biblioteca sob demanda (pesada) só ao exportar
  const { default: HTMLtoDOCX } = await import("html-to-docx");
  const buffer = await HTMLtoDOCX(html, null, {
    table: { row: { cantSplit: true } },
    footer: false,
    pageNumber: false,
    margins: { top: 1134, right: 1134, bottom: 1134, left: 1134 }, // ~2cm
  });

  const blob = buffer instanceof Blob
    ? buffer
    : new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

export function exportPDF(content, title) {
  const w = window.open("","_blank");
  w.document.write(buildPrintHTML(content, title));
  w.document.close();
  setTimeout(() => w.print(), 400);
}

/** Baixa um Blob com o nome dado — usado por JSON/CSV na área de estágios. */
export function downloadBlob(blob, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Nome de arquivo seguro a partir de um nome de pessoa. */
export function fileSafe(nome, fallback = "Allos") {
  return (String(nome || "").trim().replace(/\s+/g, "_").replace(/[^\w\-.]/g, "")) || fallback;
}
