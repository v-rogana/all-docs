import { useState, useMemo, useRef } from "react";
import { C, dataBR, addMeses, exportPDF, exportDOCX, fileSafe } from "../core.js";
import { ActionBtn, MiniBtn, DocPaper, Pill } from "../ui.jsx";
import {
  useEstagios, registroVazio,
  CAMPOS_SUPERVISOR, CAMPOS_FACULDADE, CAMPOS_ESTAGIARIO, CAMPOS_PRESTADOR,
  STATUS_ESTAGIO, STATUS_PRESTADOR,
  acharFaculdade, acharSupervisor, nomeFaculdade, nomeSupervisor,
  supervisionadosDe, alertas,
  exportarJSON, importarJSON,
  exportarCSVEstagiarios, exportarCSVSupervisores, exportarCSVPrestadores,
} from "./store.js";
import { renderTCE, renderPrestacao, MODELOS_EMAIL } from "./docs.js";

/* ════════════════════════════════════════════
   CSS da área de estágios — concatenado ao css global
   ════════════════════════════════════════════ */
export const ESTAGIOS_CSS = `
.est-wrap{height:100%;overflow-y:auto;background:${C.cream}}
.est-inner{max-width:1180px;margin:0 auto;padding:28px 30px 60px}

.est-tabs{display:flex;gap:4px;flex-wrap:wrap;border-bottom:1px solid ${C.border};margin-bottom:24px}
.est-tab{background:transparent;border:none;border-bottom:2px solid transparent;
  padding:10px 14px;font-size:13.5px;font-weight:500;color:${C.muted};cursor:pointer;
  font-family:'DM Sans',sans-serif;transition:color .15s,border-color .15s;white-space:nowrap}
.est-tab:hover{color:${C.charcoal}}
.est-tab.on{color:${C.tealDark};border-bottom-color:${C.teal};font-weight:600}

.est-card{background:#fff;border:1px solid ${C.border};border-radius:12px;padding:18px 20px}
.est-grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(190px,1fr))}

.est-tablewrap{overflow-x:auto;background:#fff;border:1px solid ${C.border};border-radius:12px}
table.est{width:100%;border-collapse:collapse;font-size:12.5px;font-family:'DM Sans',sans-serif}
table.est th{text-align:left;padding:11px 12px;background:${C.creamAlt};color:${C.sage};
  font-size:9.5px;text-transform:uppercase;letter-spacing:1.1px;font-weight:700;
  border-bottom:1px solid ${C.border};white-space:nowrap;position:sticky;top:0}
table.est td{padding:11px 12px;border-bottom:1px solid ${C.border}66;vertical-align:middle;color:${C.charcoal}}
table.est tr:last-child td{border-bottom:none}
table.est tbody tr:hover{background:${C.creamAlt}77}
table.est td.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}

.est-form-grid{display:grid;gap:0 18px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.est-check{display:flex;align-items:center;gap:9px;padding:9px 0 14px;cursor:pointer;font-size:13.5px}
.est-check input{width:17px;height:17px;accent-color:${C.teal};cursor:pointer;flex:0 0 auto}

.est-overlay{position:fixed;inset:0;z-index:1200;background:rgba(20,28,26,.62);
  display:flex;flex-direction:column;padding:22px;overflow:auto}

@media(max-width:640px){
  .est-inner{padding:18px 14px 48px}
  .est-overlay{padding:10px}
}
`;

const AUTH_KEY = "alldocs.estagios.auth";
const SENHA = "ariane";

/* ════════════════════════════════════════════
   GATE — senha simples
   ════════════════════════════════════════════ */
function Gate({ onOk }) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);

  const tentar = (e) => {
    e.preventDefault();
    if (senha.trim().toLowerCase() === SENHA) {
      try { window.sessionStorage.setItem(AUTH_KEY, "1"); } catch { /* modo privado */ }
      onOk();
    } else {
      setErro(true);
      setSenha("");
    }
  };

  return (
    <div style={{
      height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
      background: C.cream, padding: 24,
    }}>
      <form onSubmit={tentar} className="est-card fade-in"
        style={{ maxWidth: 380, width: "100%", textAlign: "center", padding: "34px 28px" }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
        <h2 className="font-fraunces" style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>
          Área de estágios
        </h2>
        <p className="font-dm" style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>
          Contratos de estágio, controle de estagiários e supervisores.
        </p>

        <input
          className="allos-input"
          type="password"
          autoFocus
          value={senha}
          onChange={(e) => { setSenha(e.target.value); setErro(false); }}
          placeholder="Senha"
          style={{ textAlign: "center", marginBottom: 12 }}
        />

        {erro && (
          <div className="font-dm" style={{ fontSize: 12, color: C.accentDark, marginBottom: 12 }}>
            Senha incorreta.
          </div>
        )}

        <button type="submit" className="font-dm" style={{
          width: "100%", background: C.teal, color: "#fff", border: "none",
          borderRadius: 999, padding: "11px 22px", fontSize: 13.5, fontWeight: 600,
          cursor: "pointer", boxShadow: `0 6px 22px ${C.teal}55`,
        }}>
          Entrar
        </button>

        <p className="font-dm" style={{ fontSize: 10.5, color: C.muted, marginTop: 18, lineHeight: 1.6 }}>
          Esta senha evita abertura acidental — não é proteção de segurança.
          Os dados ficam apenas neste navegador.
        </p>
      </form>
    </div>
  );
}

/* ════════════════════════════════════════════
   CAMPO DE FORMULÁRIO
   ════════════════════════════════════════════ */
function EField({ campo, valor, onChange, ctx }) {
  const rotulo = (
    <label className="font-dm" style={{
      display: "block", fontSize: 11, color: C.muted, marginBottom: 5,
      fontWeight: 500, letterSpacing: ".4px", textTransform: "uppercase",
    }}>
      {campo.label}{campo.req && <span style={{ color: C.accent }}> *</span>}
    </label>
  );

  if (campo.type === "check") {
    return (
      <label className="est-check font-dm">
        <input type="checkbox" checked={!!valor} onChange={(e) => onChange(e.target.checked)} />
        <span>{campo.label}</span>
      </label>
    );
  }

  if (campo.type === "textarea") {
    return (
      <div style={{ marginBottom: 14, gridColumn: "1 / -1" }}>
        {rotulo}
        <textarea className="allos-input" rows={campo.rows || 3}
          value={valor || ""} onChange={(e) => onChange(e.target.value)} placeholder={campo.ph} />
      </div>
    );
  }

  const LISTAS = {
    "select-faculdade": {
      itens: (db) => db.faculdades || [],
      rotulo: (r) => r.sigla || r.nome,
    },
    "select-supervisor": {
      itens: (db) => (db.supervisores || []).filter(s => s.ativo !== false),
      rotulo: (r) => `${r.nome}${r.crp ? ` — CRP ${r.crp}` : ""}`,
    },
    "select-estagiario": {
      itens: (db) => db.estagiarios || [],
      rotulo: (r) => r.nome || "(sem nome)",
    },
  };

  let controle;
  if (LISTAS[campo.type]) {
    const { itens, rotulo: rotulaLista } = LISTAS[campo.type];
    const lista = itens(ctx.db);
    controle = (
      <select className="allos-input" value={valor || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">
          {lista.length ? "— selecione —" : "— nenhum(a) cadastrado(a) ainda —"}
        </option>
        {lista.map(r => <option key={r.id} value={r.id}>{rotulaLista(r)}</option>)}
      </select>
    );
  } else if (campo.type === "select-status") {
    controle = (
      <select className="allos-input" value={valor || "pendente"} onChange={(e) => onChange(e.target.value)}>
        {(ctx.statusOptions || STATUS_ESTAGIO).map(s =>
          <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
    );
  } else {
    controle = (
      <input className="allos-input"
        type={campo.type === "date" ? "date" : campo.type === "number" ? "number" : campo.type === "email" ? "email" : "text"}
        value={valor || ""} onChange={(e) => onChange(e.target.value)} placeholder={campo.ph} />
    );
  }

  return <div style={{ marginBottom: 14 }}>{rotulo}{controle}</div>;
}

/* ════════════════════════════════════════════
   FORMULÁRIO DE REGISTRO
   ════════════════════════════════════════════ */
function FormRegistro({ titulo, subtitulo, grupos, inicial, ctx, onSalvar, onCancelar, derivar }) {
  const [r, setR] = useState(inicial);

  const set = (id, val) => setR(prev => {
    const novo = { ...prev, [id]: val };
    return derivar ? derivar(novo, id) : novo;
  });

  const faltando = grupos
    .flatMap(g => g.campos)
    .filter(c => c.req && !String(r[c.id] ?? "").trim())
    .map(c => c.label);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <h2 className="font-fraunces" style={{ fontSize: 23, fontWeight: 600, lineHeight: 1.2 }}>{titulo}</h2>
        {subtitulo && (
          <p className="font-dm" style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>{subtitulo}</p>
        )}
      </div>

      {grupos.map((g, i) => (
        <div key={i} className="est-card" style={{ marginBottom: 16 }}>
          <div className="font-dm" style={{
            fontSize: 10, textTransform: "uppercase", letterSpacing: 1.4,
            color: C.sage, fontWeight: 700, marginBottom: 14,
          }}>{g.grupo}</div>
          <div className="est-form-grid">
            {g.campos.map(c => (
              <EField key={c.id} campo={c} valor={r[c.id]} ctx={ctx}
                onChange={(v) => set(c.id, v)} />
            ))}
          </div>
        </div>
      ))}

      {faltando.length > 0 && (
        <p className="font-dm" style={{ fontSize: 12, color: C.accentDark, marginBottom: 12 }}>
          Preencha para salvar: {faltando.join(", ")}.
        </p>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <ActionBtn label="Salvar" color={C.teal} disabled={faltando.length > 0}
          onClick={() => onSalvar(r)} />
        <ActionBtn label="Cancelar" color={C.muted} variant="outline" onClick={onCancelar} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   AUXILIARES DE APRESENTAÇÃO
   ════════════════════════════════════════════ */
function Vazio({ icone, titulo, texto, acao }) {
  return (
    <div className="est-card" style={{ textAlign: "center", padding: "42px 26px" }}>
      <div style={{ fontSize: 34, marginBottom: 10 }}>{icone}</div>
      <div className="font-fraunces" style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{titulo}</div>
      <p className="font-dm" style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.65, maxWidth: 420, margin: "0 auto 18px" }}>
        {texto}
      </p>
      {acao}
    </div>
  );
}

function Cabecalho({ titulo, subtitulo, acoes }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-end",
      gap: 16, flexWrap: "wrap", marginBottom: 18,
    }}>
      <div>
        <h2 className="font-fraunces" style={{ fontSize: 23, fontWeight: 600, lineHeight: 1.2 }}>{titulo}</h2>
        {subtitulo && (
          <p className="font-dm" style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>{subtitulo}</p>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{acoes}</div>
    </div>
  );
}

const StatusPill = ({ status, lista }) => {
  const cores = { ativo: C.teal, pendente: C.accent, trancado: C.muted, encerrado: C.muted };
  const label = (lista.find(s => s.value === status) || {}).label || status || "—";
  return <Pill label={label} color={cores[status] || C.muted} />;
};

/** Data + selo de arquivamento, usados nas colunas de seguro e TCE. */
function CelulaDoc({ data, arquivado, link }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{data ? dataBR(data) : "—"}</span>
      {arquivado
        ? (link
          ? <a href={link} target="_blank" rel="noreferrer" title="Abrir arquivo"
              style={{ textDecoration: "none" }}><Pill label="✓ arq." color={C.teal} /></a>
          : <Pill label="✓ arq." color={C.teal} />)
        : <Pill label="pendente" color={C.accent} />}
    </div>
  );
}

/* ════════════════════════════════════════════
   VISOR DE DOCUMENTO — preview + exportação
   ════════════════════════════════════════════ */
function VisorDoc({ doc, onFechar }) {
  if (!doc) return null;
  return (
    <div className="est-overlay" onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
      <div className="doc-actions" style={{
        display: "flex", gap: 10, justifyContent: "center",
        flexWrap: "wrap", marginBottom: 18,
      }}>
        <ActionBtn label="📄  Gerar PDF" color={C.teal}
          onClick={() => exportPDF(doc.html, doc.titulo)} />
        <ActionBtn label="📝  Gerar DOCX" color={C.accent}
          onClick={() => exportDOCX(doc.html, doc.arquivo)} />
        <button onClick={onFechar} className="font-dm" style={{
          background: "rgba(255,255,255,.14)", color: "#fff",
          border: "1px solid rgba(255,255,255,.35)", borderRadius: 999,
          padding: "11px 24px", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
        }}>Fechar</button>
      </div>
      <DocPaper html={doc.html} />
    </div>
  );
}

/* ════════════════════════════════════════════
   PAINEL
   ════════════════════════════════════════════ */
function CartaoNum({ n, label, cor, onClick }) {
  return (
    <div className="est-card" onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}>
      <div className="font-fraunces" style={{ fontSize: 30, fontWeight: 600, color: cor, lineHeight: 1 }}>{n}</div>
      <div className="font-dm" style={{ fontSize: 11.5, color: C.muted, marginTop: 6 }}>{label}</div>
    </div>
  );
}

function Painel({ db, ir }) {
  const ests = db.estagiarios || [];
  const ativos = ests.filter(e => e.status === "ativo");
  const pendentes = ests.filter(e => e.status === "pendente");
  const avisos = alertas(db);
  const graves = avisos.filter(a => a.grave);
  const bolsaTotal = ativos.reduce((s, e) => {
    const n = parseFloat(String(e.bolsa || "").replace(/\./g, "").replace(",", "."));
    return s + (isNaN(n) ? 0 : n);
  }, 0);

  return (
    <div className="fade-in">
      <Cabecalho titulo="Painel" subtitulo="Situação geral dos estágios e pendências abertas." />

      <div className="est-grid" style={{ marginBottom: 22 }}>
        <CartaoNum n={ativos.length} label="Estagiários ativos" cor={C.teal} onClick={() => ir("estagiarios")} />
        <CartaoNum n={pendentes.length} label="Aguardando documentação" cor={C.accent} onClick={() => ir("estagiarios")} />
        <CartaoNum n={(db.supervisores || []).filter(s => s.ativo !== false).length} label="Supervisores ativos" cor={C.sage} onClick={() => ir("supervisores")} />
        <CartaoNum n={graves.length} label="Pendências e vencidos" cor={graves.length ? C.accentDark : C.muted} />
        <CartaoNum n={bolsaTotal ? `R$ ${bolsaTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
          label="Bolsas/mês (ativos)" cor={C.charcoal} />
      </div>

      {/* Alertas */}
      <div style={{ marginBottom: 22 }}>
        <div className="font-dm" style={{
          fontSize: 10, textTransform: "uppercase", letterSpacing: 1.4,
          color: C.sage, fontWeight: 700, marginBottom: 10,
        }}>Vencimentos e pendências</div>

        {avisos.length === 0 ? (
          <div className="est-card font-dm" style={{ fontSize: 13, color: C.muted }}>
            Nada vencendo nos próximos 45 dias e nenhum documento pendente. 🎉
          </div>
        ) : (
          <div className="est-tablewrap">
            <table className="est">
              <thead><tr><th>Estagiário</th><th>Item</th><th>Situação</th></tr></thead>
              <tbody>
                {avisos.map((a, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{a.nome}</td>
                    <td>{a.tipo}</td>
                    <td><Pill label={a.texto} color={a.grave ? C.accentDark : C.accent} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Carga por supervisor */}
      <div>
        <div className="font-dm" style={{
          fontSize: 10, textTransform: "uppercase", letterSpacing: 1.4,
          color: C.sage, fontWeight: 700, marginBottom: 10,
        }}>Supervisionados por supervisor</div>

        {(db.supervisores || []).length === 0 ? (
          <div className="est-card font-dm" style={{ fontSize: 13, color: C.muted }}>
            Nenhum supervisor cadastrado ainda.
          </div>
        ) : (
          <div className="est-tablewrap">
            <table className="est">
              <thead><tr><th>Supervisor(a)</th><th>CRP</th><th className="num">Supervisionados</th><th>Situação</th></tr></thead>
              <tbody>
                {(db.supervisores || []).map(s => {
                  const n = supervisionadosDe(db, s.id).length;
                  const lim = parseInt(s.limite, 10);
                  const estourou = !isNaN(lim) && n > lim;
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{s.nome}</td>
                      <td>{s.crp || "—"}</td>
                      <td className="num">{n}{!isNaN(lim) ? ` / ${lim}` : ""}</td>
                      <td>
                        {s.ativo === false
                          ? <Pill label="inativo" color={C.muted} />
                          : estourou
                            ? <Pill label="acima do limite" color={C.accentDark} />
                            : <Pill label="ok" color={C.teal} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   ESTAGIÁRIOS
   ════════════════════════════════════════════ */
function Estagiarios({ db, salvar, remover, abrirDoc }) {
  const [editando, setEditando] = useState(null);
  const ctx = { db, statusOptions: STATUS_ESTAGIO };

  /* Preenche o que dá para deduzir, sem sobrescrever o que já foi digitado. */
  const derivar = (r, alterado) => {
    if (alterado !== "dataInicio" && alterado !== "duracaoMeses") return r;
    if (!r.dataInicio || !r.duracaoMeses) return r;
    const fim = addMeses(r.dataInicio, r.duracaoMeses);
    if (!fim) return r;
    const novo = { ...r };
    if (!novo.dataFim) novo.dataFim = fim;
    if (!novo.tceVenc) novo.tceVenc = fim;
    if (!novo.seguroVenc) novo.seguroVenc = fim;
    return novo;
  };

  const gerarTCE = (e) => {
    abrirDoc({
      html: renderTCE({
        est: e,
        sup: acharSupervisor(db, e.supervisorId),
        fac: acharFaculdade(db, e.faculdadeId),
      }),
      titulo: `Termo de Compromisso de Estágio — ${e.nome || "Allos"}`,
      arquivo: `TCE_Allos_${fileSafe(e.nome)}.docx`,
    });
  };

  if (editando) {
    return (
      <FormRegistro
        titulo={editando._novo ? "Novo estagiário" : editando.nome || "Editar estagiário"}
        subtitulo="Estes dados alimentam o Termo de Compromisso e os modelos de e-mail."
        grupos={CAMPOS_ESTAGIARIO}
        inicial={editando}
        ctx={ctx}
        derivar={derivar}
        onSalvar={(r) => { const { _novo, ...limpo } = r; salvar("estagiarios", limpo); setEditando(null); }}
        onCancelar={() => setEditando(null)}
      />
    );
  }

  const lista = db.estagiarios || [];

  return (
    <div className="fade-in">
      <Cabecalho
        titulo="Estagiários"
        subtitulo={`${lista.length} cadastrado(s) · ${lista.filter(e => e.status === "ativo").length} ativo(s)`}
        acoes={<>
          {lista.length > 0 && (
            <ActionBtn label="⬇  CSV" color={C.sage} variant="outline"
              onClick={() => exportarCSVEstagiarios(db)} />
          )}
          <ActionBtn label="＋  Novo estagiário" color={C.teal}
            onClick={() => setEditando({ ...registroVazio(CAMPOS_ESTAGIARIO), _novo: true })} />
        </>}
      />

      {lista.length === 0 ? (
        <Vazio icone="🎓" titulo="Nenhum estagiário cadastrado"
          texto="Cadastre supervisores e faculdades primeiro — depois o estagiário, que se liga a eles e gera o TCE preenchido."
          acao={<ActionBtn label="＋  Cadastrar o primeiro" color={C.teal}
            onClick={() => setEditando({ ...registroVazio(CAMPOS_ESTAGIARIO), _novo: true })} />} />
      ) : (
        <div className="est-tablewrap">
          <table className="est">
            <thead>
              <tr>
                <th>Nome</th><th>Cidade</th><th>Faculdade</th><th>Prev. formar</th>
                <th>Supervisor(a)</th><th className="num">Bolsa</th>
                <th>Entrada</th><th>Saída</th>
                <th>Seguro (venc.)</th><th>TCE (venc.)</th>
                <th>Situação</th><th></th>
              </tr>
            </thead>
            <tbody>
              {lista.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{e.nome || "—"}</td>
                  <td>{e.cidade || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{nomeFaculdade(db, e.faculdadeId)}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{e.prevFormatura || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{nomeSupervisor(db, e.supervisorId)}</td>
                  <td className="num">{e.bolsa ? `R$ ${e.bolsa}` : "—"}</td>
                  <td className="num">{e.dataInicio ? dataBR(e.dataInicio) : "—"}</td>
                  <td className="num">{e.dataFim ? dataBR(e.dataFim) : "—"}</td>
                  <td><CelulaDoc data={e.seguroVenc} arquivado={e.seguroArquivado} link={e.seguroLink} /></td>
                  <td><CelulaDoc data={e.tceVenc} arquivado={e.tceArquivado} link={e.tceLink} /></td>
                  <td><StatusPill status={e.status} lista={STATUS_ESTAGIO} /></td>
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <MiniBtn label="Gerar TCE" onClick={() => gerarTCE(e)} />
                      <MiniBtn label="Editar" color={C.sage} onClick={() => setEditando({ ...e })} />
                      <MiniBtn label="Excluir" danger
                        onClick={() => { if (confirm(`Excluir o cadastro de ${e.nome || "este estagiário"}?`)) remover("estagiarios", e.id); }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   SUPERVISORES
   ════════════════════════════════════════════ */
function Supervisores({ db, salvar, remover }) {
  const [editando, setEditando] = useState(null);
  const lista = db.supervisores || [];

  if (editando) {
    return (
      <FormRegistro
        titulo={editando._novo ? "Novo supervisor" : editando.nome || "Editar supervisor"}
        subtitulo="O CRP entra no TCE como responsável técnico pelo acompanhamento do estágio."
        grupos={CAMPOS_SUPERVISOR}
        inicial={editando}
        ctx={{ db }}
        onSalvar={(r) => { const { _novo, ...limpo } = r; salvar("supervisores", limpo); setEditando(null); }}
        onCancelar={() => setEditando(null)}
      />
    );
  }

  return (
    <div className="fade-in">
      <Cabecalho
        titulo="Supervisores"
        subtitulo={`${lista.length} cadastrado(s)`}
        acoes={<>
          {lista.length > 0 && (
            <ActionBtn label="⬇  CSV" color={C.sage} variant="outline"
              onClick={() => exportarCSVSupervisores(db)} />
          )}
          <ActionBtn label="＋  Novo supervisor" color={C.teal}
            onClick={() => setEditando({ ...registroVazio(CAMPOS_SUPERVISOR), _novo: true })} />
        </>}
      />

      {lista.length === 0 ? (
        <Vazio icone="🧠" titulo="Nenhum supervisor cadastrado"
          texto="Cada estagiário precisa de um(a) supervisor(a) com CRP ativo — é essa pessoa que responde tecnicamente pelo estágio no termo."
          acao={<ActionBtn label="＋  Cadastrar o primeiro" color={C.teal}
            onClick={() => setEditando({ ...registroVazio(CAMPOS_SUPERVISOR), _novo: true })} />} />
      ) : (
        <div className="est-tablewrap">
          <table className="est">
            <thead>
              <tr><th>Nome</th><th>CRP</th><th>Formação</th><th>Contato</th>
                <th className="num">Supervisionados</th><th>Situação</th><th></th></tr>
            </thead>
            <tbody>
              {lista.map(s => {
                const supervisionados = supervisionadosDe(db, s.id);
                const lim = parseInt(s.limite, 10);
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{s.nome}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{s.crp || "—"}</td>
                    <td>{s.formacao || "—"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{s.email || s.telefone || "—"}</td>
                    <td className="num" title={supervisionados.map(e => e.nome).join(", ")}>
                      {supervisionados.length}{!isNaN(lim) ? ` / ${lim}` : ""}
                    </td>
                    <td>{s.ativo === false
                      ? <Pill label="inativo" color={C.muted} />
                      : <Pill label="ativo" color={C.teal} />}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <MiniBtn label="Editar" color={C.sage} onClick={() => setEditando({ ...s })} />
                        <MiniBtn label="Excluir" danger onClick={() => {
                          if (supervisionados.length) {
                            alert(`${s.nome} tem ${supervisionados.length} supervisionado(s) vinculado(s). Troque o supervisor deles antes de excluir.`);
                            return;
                          }
                          if (confirm(`Excluir o cadastro de ${s.nome}?`)) remover("supervisores", s.id);
                        }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   FACULDADES
   ════════════════════════════════════════════ */
function Faculdades({ db, salvar, remover }) {
  const [editando, setEditando] = useState(null);
  const lista = db.faculdades || [];

  if (editando) {
    return (
      <FormRegistro
        titulo={editando._novo ? "Nova faculdade" : editando.nome || "Editar faculdade"}
        subtitulo="As cláusulas específicas coladas aqui entram no TCE de todos os estagiários desta instituição."
        grupos={CAMPOS_FACULDADE}
        inicial={editando}
        ctx={{ db }}
        onSalvar={(r) => { const { _novo, ...limpo } = r; salvar("faculdades", limpo); setEditando(null); }}
        onCancelar={() => setEditando(null)}
      />
    );
  }

  return (
    <div className="fade-in">
      <Cabecalho
        titulo="Faculdades"
        subtitulo={`${lista.length} cadastrada(s)`}
        acoes={<ActionBtn label="＋  Nova faculdade" color={C.teal}
          onClick={() => setEditando({ ...registroVazio(CAMPOS_FACULDADE), _novo: true })} />}
      />

      {lista.length === 0 ? (
        <Vazio icone="🏛️" titulo="Nenhuma faculdade cadastrada"
          texto="Cadastre uma vez os dados da instituição, o contato do setor de estágio e as cláusulas que ela exige. Todo TCE de estagiário dessa faculdade já sai com elas."
          acao={<ActionBtn label="＋  Cadastrar a primeira" color={C.teal}
            onClick={() => setEditando({ ...registroVazio(CAMPOS_FACULDADE), _novo: true })} />} />
      ) : (
        <div className="est-tablewrap">
          <table className="est">
            <thead>
              <tr><th>Instituição</th><th>CNPJ</th><th>Cidade</th><th>Contato do setor</th>
                <th className="num">Estagiários</th><th>Exigências</th><th></th></tr>
            </thead>
            <tbody>
              {lista.map(f => {
                const vinculados = (db.estagiarios || []).filter(e => e.faculdadeId === f.id);
                return (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 600 }}>
                      {f.sigla || f.nome}
                      {f.sigla && f.nome && f.sigla !== f.nome && (
                        <div className="font-dm" style={{ fontSize: 11, color: C.muted, fontWeight: 400 }}>{f.nome}</div>
                      )}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{f.cnpj || "—"}</td>
                    <td>{f.cidade || "—"}</td>
                    <td>{f.email || f.contatoNome || "—"}</td>
                    <td className="num">{vinculados.length}</td>
                    <td>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {f.clausulas && f.clausulas.trim() && <Pill label="cláusulas" color={C.sage} />}
                        {f.exigePlano && <Pill label="plano" color={C.teal} />}
                        {f.exigeOrientador && <Pill label="orientador" color={C.accent} />}
                        {!f.clausulas?.trim() && !f.exigePlano && !f.exigeOrientador && <span style={{ color: C.muted }}>—</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <MiniBtn label="Editar" color={C.sage} onClick={() => setEditando({ ...f })} />
                        <MiniBtn label="Excluir" danger onClick={() => {
                          if (vinculados.length) {
                            alert(`${f.sigla || f.nome} tem ${vinculados.length} estagiário(s) vinculado(s). Troque a faculdade deles antes de excluir.`);
                            return;
                          }
                          if (confirm(`Excluir ${f.sigla || f.nome}?`)) remover("faculdades", f.id);
                        }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   PRESTADORES DE SERVIÇO
   ════════════════════════════════════════════ */
function Prestadores({ db, salvar, remover, abrirDoc }) {
  const [editando, setEditando] = useState(null);
  const lista = db.prestadores || [];

  if (editando) {
    return (
      <FormRegistro
        titulo={editando._novo ? "Novo prestador" : editando.nome || "Editar prestador"}
        subtitulo="Contrato de prestação de serviços — sem vínculo empregatício, sem seguro de estágio e sem supervisor."
        grupos={CAMPOS_PRESTADOR}
        inicial={editando}
        ctx={{ db, statusOptions: STATUS_PRESTADOR }}
        onSalvar={(r) => { const { _novo, ...limpo } = r; salvar("prestadores", limpo); setEditando(null); }}
        onCancelar={() => setEditando(null)}
      />
    );
  }

  return (
    <div className="fade-in">
      <Cabecalho
        titulo="Prestadores de serviço"
        subtitulo="Contratados fora do regime de estágio — mídia, apoio técnico, administrativo."
        acoes={<>
          {lista.length > 0 && (
            <ActionBtn label="⬇  CSV" color={C.sage} variant="outline"
              onClick={() => exportarCSVPrestadores(db)} />
          )}
          <ActionBtn label="＋  Novo prestador" color={C.teal}
            onClick={() => setEditando({ ...registroVazio(CAMPOS_PRESTADOR), _novo: true })} />
        </>}
      />

      {lista.length === 0 ? (
        <Vazio icone="💼" titulo="Nenhum prestador cadastrado"
          texto="Use esta aba para quem trabalha com a Allos fora do estágio — o contrato gerado é o de prestação de serviços."
          acao={<ActionBtn label="＋  Cadastrar o primeiro" color={C.teal}
            onClick={() => setEditando({ ...registroVazio(CAMPOS_PRESTADOR), _novo: true })} />} />
      ) : (
        <div className="est-tablewrap">
          <table className="est">
            <thead>
              <tr><th>Nome</th><th>Função</th><th>Cidade</th><th className="num">Valor</th>
                <th>Início</th><th>Contrato</th><th>Situação</th><th></th></tr>
            </thead>
            <tbody>
              {lista.map(x => (
                <tr key={x.id}>
                  <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{x.nome || "—"}</td>
                  <td>{x.funcao || "—"}</td>
                  <td>{x.cidade || "—"}</td>
                  <td className="num">{x.valor ? `R$ ${x.valor}` : "—"}</td>
                  <td className="num">{x.dataInicio ? dataBR(x.dataInicio) : "—"}</td>
                  <td><CelulaDoc data={x.contratoData} arquivado={x.contratoArquivado} link={x.contratoLink} /></td>
                  <td><StatusPill status={x.status} lista={STATUS_PRESTADOR} /></td>
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <MiniBtn label="Gerar contrato" onClick={() => abrirDoc({
                        html: renderPrestacao({ pr: x }),
                        titulo: `Contrato de Prestação de Serviços — ${x.nome || "Allos"}`,
                        arquivo: `Contrato_Prestacao_${fileSafe(x.nome)}.docx`,
                      })} />
                      <MiniBtn label="Editar" color={C.sage} onClick={() => setEditando({ ...x })} />
                      <MiniBtn label="Excluir" danger
                        onClick={() => { if (confirm(`Excluir o cadastro de ${x.nome || "este prestador"}?`)) remover("prestadores", x.id); }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   E-MAILS
   ════════════════════════════════════════════ */
function Emails({ db }) {
  const [modeloId, setModeloId] = useState(MODELOS_EMAIL[0].id);
  const [estId, setEstId] = useState("");
  const [facId, setFacId] = useState("");
  const [copiado, setCopiado] = useState("");

  const modelo = MODELOS_EMAIL.find(m => m.id === modeloId) || MODELOS_EMAIL[0];
  const est = (db.estagiarios || []).find(e => e.id === estId) || null;
  // Com estagiário escolhido, a faculdade vem dele; senão, da seleção manual.
  const fac = est ? acharFaculdade(db, est.faculdadeId) : ((db.faculdades || []).find(f => f.id === facId) || null);
  const sup = est ? acharSupervisor(db, est.supervisorId) : null;

  const { assunto, corpo } = useMemo(
    () => modelo.build({ est, fac, sup }),
    [modelo, est, fac, sup]);

  const copiar = async (texto, qual) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(qual);
      setTimeout(() => setCopiado(""), 1800);
    } catch {
      setCopiado("erro");
      setTimeout(() => setCopiado(""), 2500);
    }
  };

  const mailto = fac && fac.email
    ? `mailto:${fac.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`
    : null;

  return (
    <div className="fade-in">
      <Cabecalho titulo="Modelos de e-mail"
        subtitulo="Escolha o modelo e o estagiário — o texto sai preenchido, pronto para copiar." />

      {/* Seleção de modelo */}
      <div className="est-grid" style={{ marginBottom: 20 }}>
        {MODELOS_EMAIL.map(m => (
          <button key={m.id} onClick={() => setModeloId(m.id)} className="est-card font-dm"
            style={{
              textAlign: "left", cursor: "pointer",
              borderColor: m.id === modeloId ? C.teal : C.border,
              borderWidth: m.id === modeloId ? 2 : 1,
              background: m.id === modeloId ? C.tealSoftBg : "#fff",
            }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{m.icone}</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4, color: C.charcoal }}>{m.titulo}</div>
            <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.5 }}>{m.descricao}</div>
          </button>
        ))}
      </div>

      {/* Destinatário */}
      <div className="est-card" style={{ marginBottom: 18 }}>
        <div className="est-form-grid">
          {modelo.precisaEstagiario ? (
            <EField
              campo={{ id: "est", label: "Estagiário(a)", type: "select-estagiario" }}
              valor={estId} ctx={{ db }} onChange={setEstId}
            />
          ) : (
            <EField
              campo={{ id: "fac", label: "Faculdade", type: "select-faculdade" }}
              valor={facId} ctx={{ db }} onChange={setFacId}
            />
          )}
          {modelo.precisaEstagiario && (
            <div style={{ marginBottom: 14 }}>
              <label className="font-dm" style={{
                display: "block", fontSize: 11, color: C.muted, marginBottom: 5,
                fontWeight: 500, letterSpacing: ".4px", textTransform: "uppercase",
              }}>Destinatário</label>
              <div className="allos-input" style={{ background: C.creamAlt, color: C.textSoft }}>
                {fac ? (fac.email || `${fac.sigla || fac.nome} — sem e-mail cadastrado`) : "—"}
              </div>
            </div>
          )}
        </div>

        {modelo.precisaEstagiario && !est && (
          <p className="font-dm" style={{ fontSize: 12, color: C.muted, margin: 0 }}>
            Sem estagiário selecionado o modelo sai com marcadores entre colchetes, prontos para preencher à mão.
          </p>
        )}
      </div>

      {/* Assunto */}
      <div className="est-card" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div className="font-dm" style={{
            fontSize: 10, textTransform: "uppercase", letterSpacing: 1.4, color: C.sage, fontWeight: 700,
          }}>Assunto</div>
          <MiniBtn label={copiado === "assunto" ? "✓ copiado" : "Copiar"} onClick={() => copiar(assunto, "assunto")} />
        </div>
        <div className="font-dm" style={{ fontSize: 13.5, color: C.charcoal }}>{assunto}</div>
      </div>

      {/* Corpo */}
      <div className="est-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
          <div className="font-dm" style={{
            fontSize: 10, textTransform: "uppercase", letterSpacing: 1.4, color: C.sage, fontWeight: 700,
          }}>Mensagem</div>
          <div style={{ display: "flex", gap: 8 }}>
            <MiniBtn label={copiado === "corpo" ? "✓ copiado" : "Copiar mensagem"} onClick={() => copiar(corpo, "corpo")} />
            {mailto && <MiniBtn label="Abrir no e-mail" color={C.accent}
              onClick={() => { window.location.href = mailto; }} />}
          </div>
        </div>
        {copiado === "erro" && (
          <p className="font-dm" style={{ fontSize: 12, color: C.accentDark, marginBottom: 8 }}>
            O navegador bloqueou a cópia automática — selecione o texto abaixo e copie manualmente.
          </p>
        )}
        <pre className="font-dm" style={{
          whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 13,
          lineHeight: 1.65, color: C.charcoal, background: C.creamAlt,
          padding: "16px 18px", borderRadius: 8, margin: 0,
          fontFamily: "'DM Sans', sans-serif",
        }}>{corpo}</pre>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   DADOS — backup, restauração e limpeza
   ════════════════════════════════════════════ */
function Dados({ db, substituir, limpar }) {
  const inputRef = useRef(null);
  const [msg, setMsg] = useState(null);

  const total = ["estagiarios", "supervisores", "faculdades", "prestadores"]
    .reduce((s, k) => s + (db[k] || []).length, 0);

  const aoEscolher = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const novo = await importarJSON(file);
      const qtd = ["estagiarios", "supervisores", "faculdades", "prestadores"]
        .reduce((s, k) => s + (novo[k] || []).length, 0);
      if (!confirm(`Importar ${qtd} registro(s)?\n\nIsto SUBSTITUI tudo que está salvo neste navegador agora (${total} registro[s]). Exporte um backup antes se tiver dúvida.`)) return;
      substituir(novo);
      setMsg({ ok: true, texto: `${qtd} registro(s) importado(s).` });
    } catch (err) {
      setMsg({ ok: false, texto: err.message });
    }
  };

  return (
    <div className="fade-in">
      <Cabecalho titulo="Dados" subtitulo={`${total} registro(s) guardado(s) neste navegador.`} />

      <div className="est-card" style={{ marginBottom: 16 }}>
        <div className="font-dm" style={{
          fontSize: 10, textTransform: "uppercase", letterSpacing: 1.4,
          color: C.sage, fontWeight: 700, marginBottom: 10,
        }}>Onde estes dados moram</div>
        <p className="font-dm" style={{ fontSize: 13, lineHeight: 1.7, color: C.textSoft, margin: 0 }}>
          Tudo o que você cadastra aqui fica salvo <b>somente neste navegador, neste computador</b>.
          Nada é enviado para servidor nenhum. Isso significa duas coisas:
          <br /><br />
          1. Quem abrir o ALL_dOcS em outro computador verá a área vazia — para compartilhar,
          exporte o JSON e envie o arquivo, e a outra pessoa importa.
          <br />
          2. Se você limpar os dados do navegador, o cadastro some.
          <b> Exporte um backup com regularidade.</b>
        </p>
      </div>

      <div className="est-card" style={{ marginBottom: 16 }}>
        <div className="font-dm" style={{
          fontSize: 10, textTransform: "uppercase", letterSpacing: 1.4,
          color: C.sage, fontWeight: 700, marginBottom: 14,
        }}>Backup completo</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <ActionBtn label="⬇  Exportar JSON" color={C.teal} onClick={() => exportarJSON(db)} />
          <ActionBtn label="⬆  Importar JSON" color={C.sage} variant="outline"
            onClick={() => inputRef.current && inputRef.current.click()} />
          <input ref={inputRef} type="file" accept="application/json,.json"
            style={{ display: "none" }} onChange={aoEscolher} />
        </div>
        {msg && (
          <p className="font-dm" style={{
            fontSize: 12.5, marginTop: 12, marginBottom: 0,
            color: msg.ok ? C.tealDark : C.accentDark,
          }}>{msg.texto}</p>
        )}
      </div>

      <div className="est-card" style={{ marginBottom: 16 }}>
        <div className="font-dm" style={{
          fontSize: 10, textTransform: "uppercase", letterSpacing: 1.4,
          color: C.sage, fontWeight: 700, marginBottom: 6,
        }}>Planilhas (CSV)</div>
        <p className="font-dm" style={{ fontSize: 12.5, color: C.muted, marginBottom: 14 }}>
          Abrem direto no Excel e no Google Sheets. Servem para ler e enviar — não para reimportar aqui.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <ActionBtn label="Estagiários" color={C.sage} variant="outline" onClick={() => exportarCSVEstagiarios(db)} />
          <ActionBtn label="Supervisores" color={C.sage} variant="outline" onClick={() => exportarCSVSupervisores(db)} />
          <ActionBtn label="Prestadores" color={C.sage} variant="outline" onClick={() => exportarCSVPrestadores(db)} />
        </div>
      </div>

      <div className="est-card" style={{ borderColor: C.accent + "66" }}>
        <div className="font-dm" style={{
          fontSize: 10, textTransform: "uppercase", letterSpacing: 1.4,
          color: C.accentDark, fontWeight: 700, marginBottom: 6,
        }}>Zona de risco</div>
        <p className="font-dm" style={{ fontSize: 12.5, color: C.muted, marginBottom: 14 }}>
          Apaga todos os cadastros deste navegador. Não dá para desfazer.
        </p>
        <ActionBtn label="Apagar tudo" color={C.accentDark} variant="outline" onClick={() => {
          if (confirm(`Apagar os ${total} registro(s) desta área?\n\nExporte um backup antes — isto não pode ser desfeito.`)) limpar();
        }} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   ÁREA DE ESTÁGIOS — raiz
   ════════════════════════════════════════════ */
const ABAS = [
  { id: "painel", label: "Painel", icone: "📊" },
  { id: "estagiarios", label: "Estagiários", icone: "🎓" },
  { id: "supervisores", label: "Supervisores", icone: "🧠" },
  { id: "faculdades", label: "Faculdades", icone: "🏛️" },
  { id: "prestadores", label: "Prestadores", icone: "💼" },
  { id: "emails", label: "E-mails", icone: "✉️" },
  { id: "dados", label: "Dados", icone: "💾" },
];

export default function EstagiosArea() {
  const [liberado, setLiberado] = useState(() => {
    try { return window.sessionStorage.getItem(AUTH_KEY) === "1"; } catch { return false; }
  });
  const [aba, setAba] = useState("painel");
  const [doc, setDoc] = useState(null);
  const { db, salvar, remover, substituir, limpar } = useEstagios();

  if (!liberado) return <Gate onOk={() => setLiberado(true)} />;

  return (
    <div className="est-wrap">
      <div className="est-inner">
        <div className="est-tabs">
          {ABAS.map(a => (
            <button key={a.id} className={`est-tab${aba === a.id ? " on" : ""}`}
              onClick={() => setAba(a.id)}>
              <span style={{ marginRight: 6 }}>{a.icone}</span>{a.label}
            </button>
          ))}
        </div>

        {aba === "painel" && <Painel db={db} ir={setAba} />}
        {aba === "estagiarios" && <Estagiarios db={db} salvar={salvar} remover={remover} abrirDoc={setDoc} />}
        {aba === "supervisores" && <Supervisores db={db} salvar={salvar} remover={remover} />}
        {aba === "faculdades" && <Faculdades db={db} salvar={salvar} remover={remover} />}
        {aba === "prestadores" && <Prestadores db={db} salvar={salvar} remover={remover} abrirDoc={setDoc} />}
        {aba === "emails" && <Emails db={db} />}
        {aba === "dados" && <Dados db={db} substituir={substituir} limpar={limpar} />}
      </div>

      <VisorDoc doc={doc} onFechar={() => setDoc(null)} />
    </div>
  );
}
