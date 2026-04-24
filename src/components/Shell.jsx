// Shared components for nograder
const { useState, useEffect, useRef, useMemo } = React;

// Logo mark — a simple coffee cup with steam, original iconography
function BrandMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="var(--ink)" />
      {/* steam */}
      <g stroke="var(--bg)" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.85">
        <path className="steam-path" d="M15 11 C 14 9, 16 8, 15 6" />
        <path className="steam-path" d="M20 11 C 19 9, 21 8, 20 6" />
        <path className="steam-path" d="M25 11 C 24 9, 26 8, 25 6" />
      </g>
      {/* cup */}
      <path d="M11 15 h15 v8 a5 5 0 0 1 -5 5 h-5 a5 5 0 0 1 -5 -5 z" fill="var(--bg)" />
      <path d="M26 17 a3 3 0 0 1 0 6" stroke="var(--bg)" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

function Topbar({ view, setView, onBellClick }) {
  const items = [
    { id: "dashboard", label: "Dashboard" },
    { id: "problems", label: "Problems" },
    { id: "submissions", label: "Submissions" },
    { id: "hof", label: "Hall of Fame" },
    { id: "post", label: "Post Problem" },
  ];
  return (
    <header className="topbar">
      <div className="brand" onClick={() => setView("dashboard")} style={{ cursor: "pointer" }}>
        <BrandMark />
        <div>
          <div className="brand-name">nograder</div>
          <div className="brand-tag">cafe · grade · chill</div>
        </div>
      </div>
      <nav className="nav">
        {items.map((it) => (
          <button
            key={it.id}
            className={`nav-item ${view === it.id || (view === "problem" && it.id === "problems") || (view === "submission" && it.id === "submissions") ? "active" : ""}`}
            onClick={() => setView(it.id)}
          >
            {it.label}
          </button>
        ))}
      </nav>
      <div className="topbar-right">
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.14em" }}>
          OPEN · BREWING SINCE 2024
        </div>
        <button className="icon-btn" onClick={onBellClick} title="Notifications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10 21a2 2 0 0 0 4 0" /></svg>
        </button>
        <div className="user-chip">
          <span>{window.NG_DATA.user.name}</span>
          <div className="avatar">W</div>
        </div>
      </div>
    </header>
  );
}

function Chip({ variant = "", children, style }) {
  return <span className={`chip ${variant}`} style={style}>{children}</span>;
}

function Progress({ value = 0, tone = "sage" }) {
  const cls = tone === "sage" ? "" : tone;
  return (
    <div className={`progress ${cls}`}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

function Toast({ t }) {
  const borderCls = t.kind === "wrong" ? "wrong" : t.kind === "info" ? "info" : "";
  const icon =
    t.kind === "wrong" ? "✕" :
    t.kind === "info" ? "◦" : "✓";
  return (
    <div className={`toast ${borderCls}`}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: t.kind === "wrong" ? "var(--clay-bg)" : t.kind === "info" ? "var(--amber-bg)" : "var(--sage-bg)",
        color: t.kind === "wrong" ? "var(--clay)" : t.kind === "info" ? "var(--amber-dark)" : "var(--sage-dark)",
        display: "grid", placeItems: "center", fontSize: 14, fontWeight: 600, flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div className="toast-title">{t.title}</div>
        <div className="toast-msg">{t.msg}</div>
      </div>
    </div>
  );
}

function ToastStack({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map((t) => <Toast key={t.id} t={t} />)}
    </div>
  );
}

// simple syntax-ish highlighted code
function CodePane({ filename = "solution.cpp", lang = "C++17", children, lines }) {
  return (
    <div className="code-pane">
      <div className="code-header">
        <span className="code-dot" /><span className="code-dot" /><span className="code-dot" />
        <span style={{ marginLeft: 8 }}>{filename}</span>
        <span style={{ marginLeft: "auto", color: "#7C8576" }}>{lang}</span>
      </div>
      <div className="code-body">
        <div className="code-ln">{lines || children.split("\n").map((_, i) => String(i + 1)).join("\n")}</div>
        <div className="code-src" dangerouslySetInnerHTML={{ __html: children }} />
      </div>
    </div>
  );
}

// Placeholder steaming cup SVG illustration for hero / big spots
function CupIllustration({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <g stroke="var(--muted)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6">
        <path className="steam-path" d="M45 40 C 42 32, 50 28, 46 20" />
        <path className="steam-path" d="M60 40 C 57 32, 65 28, 61 20" />
        <path className="steam-path" d="M75 40 C 72 32, 80 28, 76 20" />
      </g>
      <ellipse cx="60" cy="50" rx="34" ry="6" fill="var(--kraft)" />
      <path d="M26 50 h68 v32 a14 14 0 0 1 -14 14 h-40 a14 14 0 0 1 -14 -14 z" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.5" />
      <ellipse cx="60" cy="50" rx="30" ry="4.5" fill="var(--amber)" opacity="0.7" />
      <path d="M94 58 a12 12 0 0 1 0 20" stroke="var(--ink)" strokeWidth="1.5" fill="none" />
      <path d="M34 100 h52" stroke="var(--ink)" strokeWidth="1.5" />
    </svg>
  );
}

Object.assign(window, { BrandMark, Topbar, Chip, Progress, Toast, ToastStack, CodePane, CupIllustration });
