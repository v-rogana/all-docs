import { C } from "./core.js";

/* ════════════════════════════════════════════
   UI — primitivas compartilhadas entre os documentos
   clínicos (app.jsx) e a área de estágios (estagios/).
   ════════════════════════════════════════════ */

/* ────────────────────────────────────────────
   ACTION BUTTON — Allos style (rounded-full, teal/accent)
   ──────────────────────────────────────────── */
export function ActionBtn({ label, color, onClick, variant = "filled", disabled = false, title }) {
  const filled = variant === "filled";
  const bg = filled ? color : "transparent";
  const fg = filled ? "#fff" : color;
  const border = filled ? "none" : `1.5px solid ${color}`;

  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className="font-dm"
      style={{
        background: bg, color: fg, border,
        borderRadius: 999, padding: "11px 24px", fontSize: 13.5,
        fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? .45 : 1,
        transition: "transform .15s, box-shadow .2s, background .2s",
        boxShadow: filled && !disabled ? `0 6px 22px ${color}55, inset 0 1px 0 rgba(255,255,255,.1)` : "none",
        letterSpacing: ".2px",
      }}
      onMouseEnter={e => {
        if (disabled) return;
        e.currentTarget.style.transform = "translateY(-1px)";
        if (filled) e.currentTarget.style.boxShadow = `0 10px 32px ${color}77`;
      }}
      onMouseLeave={e => {
        if (disabled) return;
        e.currentTarget.style.transform = "none";
        if (filled) e.currentTarget.style.boxShadow = `0 6px 22px ${color}55, inset 0 1px 0 rgba(255,255,255,.1)`;
      }}>
      {label}
    </button>
  );
}

/* Botão compacto — usado nas linhas das tabelas de estágio. */
export function MiniBtn({ label, color = C.teal, onClick, title, danger = false }) {
  const col = danger ? C.accentDark : color;
  return (
    <button onClick={onClick} title={title} className="font-dm"
      style={{
        background: "transparent", color: col, border: `1px solid ${col}55`,
        borderRadius: 7, padding: "5px 10px", fontSize: 11.5, fontWeight: 600,
        cursor: "pointer", whiteSpace: "nowrap", transition: "background .15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = col + "14"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
      {label}
    </button>
  );
}

/* ────────────────────────────────────────────
   DOC PAPER (preview)
   ──────────────────────────────────────────── */
export function DocPaper({ html }) {
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

/* ────────────────────────────────────────────
   PILL — etiqueta de status / contagem
   ──────────────────────────────────────────── */
export function Pill({ label, color = C.teal, solid = false }) {
  return (
    <span className="font-dm" style={{
      display: "inline-block", padding: "3px 9px", borderRadius: 999,
      fontSize: 10.5, fontWeight: 600, letterSpacing: ".2px",
      background: solid ? color : color + "1E",
      color: solid ? "#fff" : color,
      border: solid ? "none" : `1px solid ${color}33`,
      whiteSpace: "nowrap",
    }}>{label}</span>
  );
}
