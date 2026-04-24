// Post Problem (admin/teacher)

function PostProblemPage({ addToast }) {
  const [title, setTitle] = React.useState("");
  const [code, setCode] = React.useState("");
  const [topic, setTopic] = React.useState("algo");
  const [difficulty, setDifficulty] = React.useState("Medium");
  const [blend, setBlend] = React.useState("House");
  const [statement, setStatement] = React.useState("");
  const [sourceMode, setSourceMode] = React.useState("pdf"); // "pdf" | "markdown"
  const [pdfName, setPdfName] = React.useState("");
  const [cases, setCases] = React.useState([{ in: "2\n●○\n○●", out: "0", sample: true }]);
  const [tl, setTl] = React.useState(2);
  const [mem, setMem] = React.useState(256);

  const addCase = () => setCases([...cases, { in: "", out: "", sample: false }]);
  const rmCase = (i) => setCases(cases.filter((_, j) => j !== i));
  const updCase = (i, k, v) => setCases(cases.map((c, j) => j === i ? { ...c, [k]: v } : c));

  const publish = () => {
    addToast({ title: "Problem published to the menu", msg: `${title || "Untitled"} · ${difficulty} · visible to students`, kind: "ok" });
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-sub">barista only · admin / teacher</div>
          <h1 className="page-title">Post a problem</h1>
          <p className="page-intro">Add a new item to the menu. Write the statement, upload testcases, and publish when it's ready to serve.</p>
        </div>
        <div className="row gap-2">
          <button className="btn btn-ghost">Save draft</button>
          <button className="btn btn-ghost">Preview</button>
          <button className="btn btn-primary" onClick={publish}>Publish to menu →</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28 }}>
        <div className="col gap-4">
          {/* title card */}
          <div className="card" style={{ padding: 28 }}>
            <label className="field-label">Problem title</label>
            <input className="input" style={{ fontFamily: "var(--serif)", fontSize: 34, padding: "14px 16px", border: "none", background: "transparent" }}
              value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Kraft Paper Graph" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginTop: 8 }}>
              <div>
                <label className="field-label">Short code</label>
                <input className="input mono" value={code} onChange={(e) => setCode(e.target.value)} placeholder="a68_q9c_slug" />
              </div>
              <div>
                <label className="field-label">Topic</label>
                <select className="select" value={topic} onChange={(e) => setTopic(e.target.value)}>
                  {window.NG_DATA.topics.filter((t) => t.id !== "all").map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Difficulty</label>
                <select className="select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  {window.NG_DATA.difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Blend</label>
                <select className="select" value={blend} onChange={(e) => setBlend(e.target.value)}>
                  <option>House</option><option>Signature</option><option>Seasonal</option><option>Rare</option>
                </select>
              </div>
            </div>
          </div>

          {/* statement */}
          <div className="card" style={{ padding: 28 }}>
            <div className="row justify-between items-center" style={{ marginBottom: 14 }}>
              <div>
                <div className="kicker">the recipe</div>
                <div className="serif" style={{ fontSize: 22, marginTop: 2 }}>Problem statement</div>
              </div>
              <div className="row gap-2">
                <button className={`tweak-opt ${sourceMode === "pdf" ? "active" : ""}`} onClick={() => setSourceMode("pdf")}>PDF upload</button>
                <button className={`tweak-opt ${sourceMode === "markdown" ? "active" : ""}`} onClick={() => setSourceMode("markdown")}>Write inline</button>
              </div>
            </div>

            {sourceMode === "pdf" ? (
              <>
                <label style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 12, padding: "48px 24px",
                  border: `1.5px dashed ${pdfName ? "var(--sage-dark)" : "var(--kraft-2)"}`,
                  borderRadius: "var(--r-lg)",
                  background: pdfName ? "var(--clay-bg)" : "var(--bg-warm)",
                  cursor: "pointer", transition: "all 0.2s",
                }}>
                  <input type="file" accept=".pdf" style={{ display: "none" }}
                    onChange={(e) => setPdfName(e.target.files[0]?.name || "")} />
                  {!pdfName ? (
                    <>
                      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="12" y1="18" x2="12" y2="12"/>
                        <polyline points="9 15 12 12 15 15"/>
                      </svg>
                      <div className="serif" style={{ fontSize: 22, lineHeight: 1.2 }}>Drop your problem PDF here</div>
                      <div className="muted" style={{ fontSize: 13, textAlign: "center", maxWidth: 400 }}>
                        The usual way. Students will see the PDF rendered inline on the problem page. Max 10MB.
                      </div>
                      <span className="btn btn-ghost btn-sm" style={{ marginTop: 4 }}>Choose file</span>
                    </>
                  ) : (
                    <>
                      <div style={{
                        width: 56, height: 72, background: "var(--surface)", border: "1px solid var(--kraft-2)",
                        borderRadius: 4, display: "grid", placeItems: "center",
                        fontFamily: "var(--mono)", fontSize: 10, color: "var(--clay)", letterSpacing: "0.1em",
                        boxShadow: "var(--shadow-sm)",
                      }}>PDF</div>
                      <div className="serif" style={{ fontSize: 20 }}>{pdfName}</div>
                      <div className="mono muted" style={{ fontSize: 11 }}>uploaded · 247 KB · 3 pages</div>
                      <button className="tweak-opt" onClick={(e) => { e.preventDefault(); setPdfName(""); }}>Replace</button>
                    </>
                  )}
                </label>
                <div className="row gap-3 mono muted" style={{ fontSize: 11, marginTop: 10 }}>
                  <span>PDF · recommended for most problems</span>
                  <span style={{ marginLeft: "auto" }}>Rendered with pdf.js · text selectable</span>
                </div>
              </>
            ) : (
              <>
                <textarea
                  className="input mono"
                  style={{ minHeight: 260, resize: "vertical", fontSize: 13, lineHeight: 1.7 }}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder={"# Problem\n\nDescribe the problem here. Markdown supported.\n\n## Input\n\n...\n\n## Output\n\n..."} />
                <div className="row gap-3 mono muted" style={{ fontSize: 11, marginTop: 10 }}>
                  <span>Markdown · LaTeX · supports images</span>
                  <span style={{ marginLeft: "auto" }}>{statement.length} chars</span>
                </div>
              </>
            )}
          </div>

          {/* testcases */}
          <div className="card" style={{ padding: 28 }}>
            <div className="row justify-between items-center" style={{ marginBottom: 14 }}>
              <div>
                <div className="kicker">the taste panel</div>
                <div className="serif" style={{ fontSize: 22, marginTop: 2 }}>Testcases</div>
              </div>
              <div className="row gap-2">
                <button className="btn btn-ghost btn-sm">Upload .zip</button>
                <button className="btn btn-sage btn-sm" onClick={addCase}>+ Add case</button>
              </div>
            </div>
            <div className="col gap-3">
              {cases.map((c, i) => (
                <div key={i} style={{ border: "1px solid var(--line)", borderRadius: "var(--r)", overflow: "hidden" }}>
                  <div style={{ padding: "8px 14px", background: "var(--bg-warm)", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--line-soft)" }}>
                    <span className="mono" style={{ fontSize: 12 }}>case {String(i + 1).padStart(2, "0")}</span>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                      <input type="checkbox" checked={c.sample} onChange={(e) => updCase(i, "sample", e.target.checked)} />
                      sample (shown to students)
                    </label>
                    <span className="muted mono" style={{ fontSize: 11, marginLeft: "auto" }}>{c.sample ? "0 pts" : "10 pts"}</span>
                    <button className="tweak-opt" onClick={() => rmCase(i)}>remove</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    <textarea className="mono" value={c.in} onChange={(e) => updCase(i, "in", e.target.value)}
                      style={{ border: "none", borderRight: "1px solid var(--line-soft)", padding: 14, fontSize: 12, minHeight: 100, resize: "vertical", background: "transparent" }} placeholder="stdin…" />
                    <textarea className="mono" value={c.out} onChange={(e) => updCase(i, "out", e.target.value)}
                      style={{ border: "none", padding: 14, fontSize: 12, minHeight: 100, resize: "vertical", background: "transparent" }} placeholder="expected stdout…" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* right sidebar */}
        <div className="col gap-4">
          <div className="card" style={{ padding: 22 }}>
            <div className="kicker" style={{ marginBottom: 12 }}>judging settings</div>
            <div className="col gap-3">
              <div>
                <label className="field-label">Time limit (s)</label>
                <input className="input mono" type="number" value={tl} onChange={(e) => setTl(+e.target.value)} />
              </div>
              <div>
                <label className="field-label">Memory limit (MB)</label>
                <input className="input mono" type="number" value={mem} onChange={(e) => setMem(+e.target.value)} />
              </div>
              <div>
                <label className="field-label">Languages allowed</label>
                <div className="row gap-2" style={{ flexWrap: "wrap", marginTop: 4 }}>
                  {["C++17","C++20","Python","Java","Rust","Verilog"].map((l) => (
                    <span key={l} className="tweak-opt active" style={{ cursor: "default" }}>{l}</span>
                  ))}
                </div>
              </div>
              <div>
                <label className="field-label">Visibility</label>
                <div className="row gap-2" style={{ marginTop: 4 }}>
                  <span className="tweak-opt active">Draft</span>
                  <span className="tweak-opt">Unlisted</span>
                  <span className="tweak-opt">Live</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card-kraft" style={{ padding: 22 }}>
            <div className="kicker" style={{ marginBottom: 10 }}>checklist</div>
            {[
              ["Title & short code", !!title && !!code],
              ["Statement ≥ 200 chars", statement.length >= 200],
              ["At least 3 testcases", cases.length >= 3],
              ["Sample case included", cases.some((c) => c.sample)],
              ["Solution reference uploaded", false],
            ].map(([label, done]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 13 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: done ? "var(--sage-dark)" : "transparent",
                  border: done ? "none" : "1.5px dashed var(--muted-2)",
                  color: "white", display: "grid", placeItems: "center", fontSize: 11, flexShrink: 0,
                }}>{done && "✓"}</div>
                <span style={{ color: done ? "var(--ink)" : "var(--muted)" }}>{label}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div className="kicker" style={{ marginBottom: 10 }}>danger zone</div>
            <button className="btn btn-ghost btn-sm" style={{ color: "var(--clay)", borderColor: "var(--clay-bg)" }}>Discard draft</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PostProblemPage });
