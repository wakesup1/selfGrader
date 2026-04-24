// Dashboard — main landing: problems list + announcements + submit box
const { useState: useStateD, useMemo: useMemoD } = React;

function SubmitBox({ onSubmit }) {
  const [problem, setProblem] = useStateD("specified");
  const [fileName, setFileName] = useStateD("");
  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, background: "var(--amber-bg)",
          display: "grid", placeItems: "center", color: "var(--amber-dark)", fontFamily: "var(--serif)", fontSize: 20
        }}>↑</div>
        <div>
          <div className="serif" style={{ fontSize: 22, lineHeight: 1 }}>Drop off your order</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>Submit your code — we'll taste-test it against every case.</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
        <div>
          <label className="field-label">Problem</label>
          <select className="select" value={problem} onChange={(e) => setProblem(e.target.value)}>
            <option value="specified">— Specified in source header —</option>
            {window.NG_DATA.problems.slice(0, 8).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">File</label>
          <label className="input" style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <span style={{
              padding: "4px 10px", background: "var(--bg-warm)", borderRadius: 999,
              fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-soft)"
            }}>Choose</span>
            <span className="mono" style={{ fontSize: 12, color: fileName ? "var(--ink)" : "var(--muted)" }}>
              {fileName || "solution.cpp · no file chosen"}
            </span>
            <input type="file" style={{ display: "none" }} onChange={(e) => setFileName(e.target.files[0]?.name || "")} />
          </label>
        </div>
        <button className="btn btn-primary" onClick={() => onSubmit(problem, fileName)}>
          Submit <span>→</span>
        </button>
      </div>
    </div>
  );
}

function Hero() {
  const u = window.NG_DATA.user;
  return (
    <div className="card-kraft" style={{ padding: "36px 40px", display: "flex", alignItems: "center", gap: 32, marginBottom: 28 }}>
      <div style={{ flex: 1 }}>
        <div className="kicker" style={{ marginBottom: 12 }}>today's brew · tuesday</div>
        <h1 className="serif" style={{ fontSize: 52, lineHeight: 1.05, letterSpacing: "-0.025em", margin: 0 }}>
          Good morning, <em style={{ fontStyle: "italic", color: "var(--sage-dark)" }}>{u.name.split(" ")[0]}.</em>
          <br />Pull up a chair — the grader's warm.
        </h1>
        <div style={{ display: "flex", gap: 36, marginTop: 24 }}>
          <Stat label="Solved" value={u.solved} />
          <DividerVert />
          <Stat label="Streak" value={`${u.streak} days`} />
          <DividerVert />
          <Stat label="Rank" value="#9" hint="Hall of Fame" />
          <DividerVert />
          <Stat label="Accuracy" value="87.4%" />
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>
        <CupIllustration size={160} />
      </div>
    </div>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div>
      <div className="kicker" style={{ marginBottom: 4 }}>{label}</div>
      <div className="serif" style={{ fontSize: 32, lineHeight: 1 }}>{value}</div>
      {hint && <div className="muted" style={{ fontSize: 11, marginTop: 3 }}>{hint}</div>}
    </div>
  );
}

function DividerVert() {
  return <div style={{ width: 1, background: "var(--kraft-2)", alignSelf: "stretch" }} />;
}

function ProblemsTable({ onOpen }) {
  const [topic, setTopic] = useStateD("all");
  const [diff, setDiff] = useStateD("all");
  const [q, setQ] = useStateD("");
  const list = useMemoD(() => {
    return window.NG_DATA.problems.filter((p) => {
      if (topic !== "all" && p.topic !== topic) return false;
      if (diff !== "all" && p.difficulty !== diff) return false;
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [topic, diff, q]);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "22px 26px 16px", borderBottom: "1px solid var(--line-soft)" }}>
        <div className="row items-center justify-between" style={{ marginBottom: 16 }}>
          <div>
            <div className="kicker">the menu</div>
            <div className="serif" style={{ fontSize: 26, marginTop: 2 }}>Today's problems</div>
          </div>
          <div className="mono muted" style={{ fontSize: 12 }}>{list.length} of {window.NG_DATA.problems.length} · fresh daily</div>
        </div>
        <div className="row gap-3 items-center">
          <div className="row gap-2" style={{ flexWrap: "wrap", flex: 1 }}>
            {window.NG_DATA.topics.map((t) => (
              <button
                key={t.id}
                className={`tweak-opt ${topic === t.id ? "active" : ""}`}
                onClick={() => setTopic(t.id)}
              >{t.label}</button>
            ))}
            <span style={{ width: 1, background: "var(--line)", margin: "0 4px" }} />
            <button className={`tweak-opt ${diff === "all" ? "active" : ""}`} onClick={() => setDiff("all")}>All</button>
            {window.NG_DATA.difficulties.map((d) => (
              <button key={d} className={`tweak-opt ${diff === d ? "active" : ""}`} onClick={() => setDiff(d)}>{d}</button>
            ))}
          </div>
          <div style={{ position: "relative" }}>
            <input
              className="input"
              placeholder="Search problems…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ width: 220, paddingLeft: 34, fontSize: 13 }}
            />
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}
                 width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>
      </div>
      <table className="problems-table">
        <thead>
          <tr>
            <th style={{ width: 44 }}>#</th>
            <th>Problem</th>
            <th style={{ width: 110 }}>Difficulty</th>
            <th style={{ width: 180 }}>Your brew</th>
            <th style={{ width: 120 }}>Solved</th>
            <th style={{ width: 140 }}>Last</th>
            <th style={{ width: 90 }}></th>
          </tr>
        </thead>
        <tbody>
          {list.map((p, i) => <ProblemRow key={p.id} p={p} idx={i + 1} onOpen={onOpen} />)}
        </tbody>
      </table>
    </div>
  );
}

function ProblemRow({ p, idx, onOpen }) {
  const diffTone = {
    Easy: "chip-sage", Medium: "chip-amber", Hard: "chip-clay", Extra: "chip-ink"
  }[p.difficulty];
  const statusDot = {
    accepted: "var(--sage-dark)", partial: "var(--amber)", wrong: "var(--clay)", unattempted: "var(--line)"
  }[p.status];
  const tone = p.score === 100 ? "sage" : p.score > 0 ? "amber" : "clay";
  return (
    <tr className="clickable" onClick={() => onOpen(p.id)}>
      <td className="mono muted" style={{ fontSize: 12 }}>{String(idx).padStart(2, "0")}</td>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusDot, flexShrink: 0 }} />
          <div>
            <div className="serif" style={{ fontSize: 19, lineHeight: 1.2 }}>{p.name}</div>
            <div className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>{p.num} · {p.brewed} blend · {p.pts} pts</div>
          </div>
        </div>
      </td>
      <td><Chip variant={diffTone}>{p.difficulty}</Chip></td>
      <td>
        {p.status === "unattempted" ? (
          <span className="muted mono" style={{ fontSize: 12 }}>— not tasted —</span>
        ) : (
          <div style={{ width: 140 }}>
            <div className="row justify-between" style={{ marginBottom: 5 }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink)" }}>{p.score.toFixed(1)}</span>
              <span className="mono muted" style={{ fontSize: 11 }}>{p.tries} tries</span>
            </div>
            <Progress value={p.score} tone={tone} />
          </div>
        )}
      </td>
      <td className="mono muted" style={{ fontSize: 12 }}>{p.solved.toLocaleString()} people</td>
      <td className="mono muted" style={{ fontSize: 12 }}>{p.lastSub}</td>
      <td>
        <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); onOpen(p.id); }}>Open →</button>
      </td>
    </tr>
  );
}

function AnnouncementsPanel() {
  return (
    <div>
      <div className="row items-center justify-between" style={{ marginBottom: 14 }}>
        <div>
          <div className="kicker">the chalkboard</div>
          <div className="serif" style={{ fontSize: 22, marginTop: 2 }}>Announcements</div>
        </div>
        <button className="btn btn-ghost btn-sm">View all</button>
      </div>
      {window.NG_DATA.announcements.map((a) => (
        <div className="announcement" key={a.id} style={{ marginBottom: 10 }}>
          <div className="row items-center justify-between" style={{ marginBottom: 8 }}>
            <Chip variant={a.pinned ? "chip-amber" : ""}>
              {a.pinned && <span style={{ marginRight: 4 }}>⚑</span>}
              {a.tag}
            </Chip>
            <span className="mono muted" style={{ fontSize: 10.5 }}>{a.updated}</span>
          </div>
          <div className="serif" style={{ fontSize: 19, lineHeight: 1.25, marginBottom: 6 }}>{a.title}</div>
          <div style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.55 }}>{a.body}</div>
        </div>
      ))}

      <div className="card-kraft" style={{ padding: 22, marginTop: 20 }}>
        <div className="kicker" style={{ marginBottom: 10 }}>barista's picks</div>
        <div className="serif" style={{ fontSize: 20, lineHeight: 1.2, marginBottom: 6 }}>Try "Latte Tree"</div>
        <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
          A warm, easy segment tree problem. 428 people have solved it — a great first pour.
        </div>
      </div>
    </div>
  );
}

function Dashboard({ onSubmit, onOpenProblem }) {
  return (
    <div>
      <Hero />
      <div style={{ marginBottom: 28 }}>
        <SubmitBox onSubmit={onSubmit} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28 }}>
        <ProblemsTable onOpen={onOpenProblem} />
        <AnnouncementsPanel />
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
