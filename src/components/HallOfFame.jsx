// Hall of Fame — coffee cards grid / podium / list (tweakable)

function HallOfFame({ layout, setLayout }) {
  const people = window.NG_DATA.hallOfFame;
  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-sub">the regulars · all-time</div>
          <h1 className="page-title">Hall of Fame</h1>
          <p className="page-intro">The baristas behind the grader. Some have been brewing for years — pull up a seat and learn from them.</p>
        </div>
        <div>
          <div className="kicker" style={{ marginBottom: 6, textAlign: "right" }}>layout</div>
          <div className="row gap-2">
            {[
              ["grid", "Coffee cards"],
              ["podium", "Podium"],
              ["list", "Ledger"],
            ].map(([k, v]) => (
              <button key={k} className={`tweak-opt ${layout === k ? "active" : ""}`} onClick={() => setLayout(k)}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      {layout === "grid" && <CoffeeCardGrid people={people} />}
      {layout === "podium" && <Podium people={people} />}
      {layout === "list" && <Ledger people={people} />}
    </div>
  );
}

function CoffeeCardGrid({ people }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
      {people.map((p) => {
        const medal = p.rank === 1 ? "gold" : p.rank === 2 ? "silver" : p.rank === 3 ? "bronze" : "";
        return (
          <div key={p.handle} className={`coffee-card ${medal}`}>
            <div className="row items-center justify-between" style={{ marginBottom: 16 }}>
              <div className="kicker">{p.roast}</div>
              <span className="rank-badge">#{p.rank}</span>
            </div>
            <div className="row items-center gap-3" style={{ marginBottom: 16 }}>
              <div className="mug">{p.name[0]}</div>
              <div style={{ minWidth: 0 }}>
                <div className="serif" style={{ fontSize: 22, lineHeight: 1.15, letterSpacing: "-0.01em" }}>{p.name}</div>
                <div className="mono muted truncate" style={{ fontSize: 11 }}>{p.handle} · {p.origin}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.55, minHeight: 40 }}>
              "{p.notes}"
            </div>
            <div className="divider-dashed" style={{ margin: "16px 0 12px" }} />
            <div className="row justify-between mono" style={{ fontSize: 11 }}>
              <span className="muted">SOLVED</span>
              <span style={{ color: "var(--ink)" }}>{p.solved}</span>
            </div>
            <div className="row justify-between mono" style={{ fontSize: 11, marginTop: 4 }}>
              <span className="muted">STREAK</span>
              <span style={{ color: "var(--ink)" }}>{p.streak} days</span>
            </div>
            <div className="row justify-between mono" style={{ fontSize: 11, marginTop: 4 }}>
              <span className="muted">BEST TRACK</span>
              <span style={{ color: "var(--ink)" }}>{["Algo","Flow","DP","Clean","HWSyn","DB","Algo","Alumni","Algo"][p.rank-1]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Podium({ people }) {
  const [first, second, third, ...rest] = people;
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr 1fr", gap: 24, alignItems: "end", marginBottom: 40 }}>
        <PodiumCard p={second} height={210} tone="silver" place="02" />
        <PodiumCard p={first} height={260} tone="gold" place="01" big />
        <PodiumCard p={third} height={180} tone="bronze" place="03" />
      </div>
      <div className="card">
        {rest.map((p, i) => (
          <div key={p.handle} style={{
            display: "grid", gridTemplateColumns: "60px 56px 1fr 120px 120px",
            alignItems: "center", padding: "18px 24px",
            borderBottom: i < rest.length - 1 ? "1px solid var(--line-soft)" : "none", gap: 18,
          }}>
            <span className="serif" style={{ fontSize: 26, color: "var(--muted)" }}>#{p.rank}</span>
            <div className="mug" style={{ width: 44, height: 44, fontSize: 18 }}>{p.name[0]}</div>
            <div>
              <div className="serif" style={{ fontSize: 18 }}>{p.name}</div>
              <div className="mono muted" style={{ fontSize: 11 }}>{p.handle} · {p.origin}</div>
            </div>
            <div className="mono" style={{ fontSize: 12 }}><span className="muted">solved </span>{p.solved}</div>
            <div className="mono" style={{ fontSize: 12 }}><span className="muted">streak </span>{p.streak}d</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PodiumCard({ p, height, tone, place, big }) {
  const toneColor = { gold: "var(--amber)", silver: "#A69F8A", bronze: "#B58862" }[tone];
  return (
    <div style={{ textAlign: "center" }}>
      <div className="mug" style={{
        width: big ? 88 : 66, height: big ? 88 : 66, fontSize: big ? 36 : 26,
        margin: "0 auto 14px", boxShadow: `0 0 0 2px ${toneColor}, 0 0 0 4px var(--surface), 0 0 0 5px var(--kraft-2)`
      }}>{p.name[0]}</div>
      <div className="serif" style={{ fontSize: big ? 26 : 22, lineHeight: 1.1 }}>{p.name}</div>
      <div className="mono muted" style={{ fontSize: 11, marginTop: 4 }}>{p.handle}</div>
      <div style={{
        marginTop: 16,
        height,
        borderRadius: "var(--r-lg)",
        background: "var(--bg-warm)",
        border: "1px solid var(--kraft-2)",
        borderTop: `3px solid ${toneColor}`,
        padding: "18px 16px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        <div className="serif" style={{ fontSize: big ? 52 : 44, lineHeight: 1, color: "var(--ink)" }}>{place}</div>
        <div>
          <div className="kicker" style={{ marginBottom: 3 }}>{p.roast}</div>
          <div className="mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>{p.solved} solved · {p.streak}d</div>
        </div>
      </div>
    </div>
  );
}

function Ledger({ people }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "18px 28px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="kicker">the ledger · updated 2 min ago</div>
        <span className="mono muted" style={{ fontSize: 11 }}>{people.length} regulars</span>
      </div>
      {people.map((p) => {
        const movement = p.rank <= 3 ? 0 : [+1, -1, 0, +2][p.rank % 4];
        return (
          <div key={p.handle} style={{
            display: "grid", gridTemplateColumns: "50px 44px 1fr 100px 80px 80px 70px",
            alignItems: "center", gap: 20, padding: "18px 28px",
            borderBottom: "1px solid var(--line-soft)",
          }}>
            <div className="serif" style={{ fontSize: 26, color: p.rank <= 3 ? "var(--ink)" : "var(--muted)" }}>#{p.rank}</div>
            <div className="mug" style={{ width: 38, height: 38, fontSize: 16 }}>{p.name[0]}</div>
            <div>
              <div className="serif" style={{ fontSize: 18 }}>{p.name}</div>
              <div className="mono muted" style={{ fontSize: 11 }}>{p.handle} · {p.origin} · {p.roast}</div>
            </div>
            <div className="mono" style={{ fontSize: 13 }}>{p.solved}<span className="muted" style={{ fontSize: 11 }}> solved</span></div>
            <div className="mono" style={{ fontSize: 13 }}>{p.streak}d</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--mono)", fontSize: 11,
              color: movement > 0 ? "var(--sage-dark)" : movement < 0 ? "var(--clay)" : "var(--muted)" }}>
              {movement > 0 ? "▲" : movement < 0 ? "▼" : "—"}
              {movement !== 0 && <span>{Math.abs(movement)}</span>}
            </div>
            <button className="btn btn-ghost btn-sm">Profile</button>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { HallOfFame });
