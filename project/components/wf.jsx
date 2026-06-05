/* Shared wireframe primitives — exported to window for screen scripts. */
const { useState } = React;

/* ---------- Placeholder image box (striped + mono label) ---------- */
function Ph({ label, h, w, round, className }) {
  return (
    <div
      className={"wf-ph" + (round ? " wf-ph--round" : "") + (className ? " " + className : "")}
      style={{ height: h, width: w }}
    >
      <span className="wf-ph__tag">{label}</span>
    </div>
  );
}

/* ---------- Wireframe annotation (toggled via body.annos) ---------- */
function Anno({ children, side }) {
  return <span className={"wf-anno" + (side ? " wf-anno--" + side : "")}>↳ {children}</span>;
}

/* ---------- Buttons ---------- */
function Btn({ children, variant = "primary", full, sm, onClick, icon }) {
  return (
    <button
      className={"wf-btn wf-btn--" + variant + (full ? " wf-btn--full" : "") + (sm ? " wf-btn--sm" : "")}
      onClick={onClick}
      type="button"
    >
      {icon && <span className="wf-btn__icon">{icon}</span>}
      {children}
    </button>
  );
}

/* ---------- Form field (label + box) ---------- */
function Field({ label, placeholder, type = "input", hint, value, required }) {
  return (
    <label className="wf-field">
      <span className="wf-field__label">
        {label}
        {required && <span className="wf-field__req">*</span>}
      </span>
      {type === "area" ? (
        <div className="wf-input wf-input--area">{value || placeholder}</div>
      ) : type === "select" ? (
        <div className="wf-input wf-input--select">
          <span>{value || placeholder}</span>
          <span className="wf-input__chev">▾</span>
        </div>
      ) : (
        <div className="wf-input">{value || placeholder}</div>
      )}
      {hint && <span className="wf-field__hint">{hint}</span>}
    </label>
  );
}

/* ---------- Filter chip ---------- */
function Chip({ children, active, onClick, count }) {
  return (
    <button className={"wf-chip" + (active ? " is-active" : "")} onClick={onClick} type="button">
      {children}
      {count != null && <span className="wf-chip__count">{count}</span>}
    </button>
  );
}

/* ---------- Status pill ---------- */
function StatusPill({ status }) {
  const map = {
    analise: { label: "Em análise", cls: "warn" },
    aprovado: { label: "Aprovado", cls: "ok" },
    agendado: { label: "Agendado", cls: "info" },
    concluido: { label: "Concluído", cls: "done" },
    recusado: { label: "Recusado", cls: "stop" },
  };
  const s = map[status] || map.analise;
  return (
    <span className={"wf-status wf-status--" + s.cls}>
      <span className="wf-status__dot" />
      {s.label}
    </span>
  );
}

/* ---------- Top navigation bar ---------- */
function TopBar({ active, onNav, onLogout, minimal }) {
  return (
    <header className="wf-topbar">
      <div className="wf-topbar__inner">
        <button className="wf-brand" onClick={() => onNav && onNav(minimal ? "login" : "home")} type="button">
          <span className="wf-brand__mark">◍</span>
          <span className="wf-brand__name">ORBITA<span className="wf-brand__tld">.market</span></span>
        </button>

        {!minimal && (
          <>
            <nav className="wf-nav">
              <button className={"wf-nav__item" + (active === "home" || active === "details" || active === "checkout" ? " is-active" : "")} onClick={() => onNav("home")} type="button">Catálogo</button>
              <button className={"wf-nav__item" + (active === "dashboard" ? " is-active" : "")} onClick={() => onNav("dashboard")} type="button">Meus Aluguéis</button>
              <button className="wf-nav__item" type="button">Suporte</button>
            </nav>
            <div className="wf-topbar__right">
              <button className="wf-iconbtn" type="button" title="Notificações">◇</button>
              <button className="wf-account" onClick={onLogout} type="button">
                <span className="wf-avatar">UF</span>
                <span className="wf-account__meta">
                  <span className="wf-account__name">Univ. Federal</span>
                  <span className="wf-account__role">Pesquisa</span>
                </span>
              </button>
            </div>
          </>
        )}
        {minimal && <span className="wf-topbar__tagline">Marketplace de tempo orbital sob demanda</span>}
      </div>
    </header>
  );
}

/* ---------- Small section heading ---------- */
function SectionHead({ kicker, title, right }) {
  return (
    <div className="wf-sechead">
      <div>
        {kicker && <div className="wf-kicker">{kicker}</div>}
        <h2 className="wf-sechead__title">{title}</h2>
      </div>
      {right}
    </div>
  );
}

/* ---------- Breadcrumb ---------- */
function Crumbs({ items }) {
  return (
    <nav className="wf-crumbs">
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="wf-crumbs__sep">/</span>}
          {it.onClick ? (
            <button className="wf-crumbs__link" onClick={it.onClick} type="button">{it.label}</button>
          ) : (
            <span className="wf-crumbs__cur">{it.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

Object.assign(window, { Ph, Anno, Btn, Field, Chip, StatusPill, TopBar, SectionHead, Crumbs });
