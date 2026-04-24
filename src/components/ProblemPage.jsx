// Problem detail page — prompt + code editor + submit with live testcase progress

function ProblemPage({ problemId, onBack, onSubmitted, addToast }) {
  const p = window.NG_DATA.problems.find((x) => x.id === problemId) || window.NG_DATA.problems[0];
  // Some problems come as PDF (the common case), others inline
  const isPdf = !["normal_puzzle", "latte_tree"].includes(p.id);
  const [tab, setTab] = React.useState(isPdf ? "pdf" : "problem");
  const [lang, setLang] = React.useState("C++17");
  const [code, setCode] = React.useState(SAMPLE_CODE);
  const [running, setRunning] = React.useState(false);
  const [tcStates, setTcStates] = React.useState(Array(10).fill("pending"));

  const runSubmit = () => {
    if (running) return;
    setRunning(true);
    setTcStates(Array(10).fill("pending"));
    addToast({ title: "Submitted to the grader", msg: `${p.name} · ${lang}`, kind: "info" });
    // animate test cases one by one
    let i = 0;
    const step = () => {
      if (i >= 10) {
        setRunning(false);
        const score = p.id === "normal_puzzle" ? 80 : 100;
        addToast({
          title: score === 100 ? "Accepted — nicely brewed" : `Partial · ${score}/100`,
          msg: score === 100 ? "All 10 testcases passed." : "Case 3 tasted off. Check your edge conditions.",
          kind: score === 100 ? "ok" : "wrong",
        });
        return;
      }
      setTcStates((prev) => {
        const next = [...prev];
        next[i] = "running";
        return next;
      });
      setTimeout(() => {
        setTcStates((prev) => {
          const next = [...prev];
          const passes = p.id === "normal_puzzle" ? (i !== 2 && i !== 7) : true;
          next[i] = passes ? "pass" : "fail";
          return next;
        });
        i++;
        setTimeout(step, 180);
      }, 320);
    };
    setTimeout(step, 350);
  };

  return (
    <div>
      <div className="row items-center gap-3" style={{ marginBottom: 18 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← back to menu</button>
        <span className="mono muted" style={{ fontSize: 11 }}>problems / {p.num} / {p.name.toLowerCase().replace(/\s+/g, "-")}</span>
      </div>

      <div className="row items-start justify-between gap-6" style={{ marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <div className="kicker" style={{ marginBottom: 8 }}>
            {p.brewed} blend · {p.topic.toUpperCase()} · {p.pts} pts
          </div>
          <h1 className="serif" style={{ fontSize: 60, lineHeight: 1, letterSpacing: "-0.025em", margin: "0 0 10px" }}>
            {p.name}
          </h1>
          <div className="row gap-2 items-center">
            <Chip variant={p.difficulty === "Easy" ? "chip-sage" : p.difficulty === "Medium" ? "chip-amber" : "chip-clay"}>{p.difficulty}</Chip>
            <Chip>Solved by {p.solved}</Chip>
            <Chip>Avg. 2 tries</Chip>
            <Chip>Time limit 2s</Chip>
            <Chip>Memory 256MB</Chip>
          </div>
        </div>
        <div className="card-kraft" style={{ padding: 18, minWidth: 220 }}>
          <div className="kicker" style={{ marginBottom: 8 }}>your tab</div>
          <div className="row justify-between items-baseline" style={{ marginBottom: 6 }}>
            <span className="serif" style={{ fontSize: 30, lineHeight: 1 }}>{p.score.toFixed(1)}</span>
            <span className="mono muted" style={{ fontSize: 11 }}>/ 100</span>
          </div>
          <Progress value={p.score} tone={p.score === 100 ? "sage" : p.score > 0 ? "amber" : "clay"} />
          <div className="mono muted" style={{ fontSize: 11, marginTop: 10 }}>{p.tries} tries · last {p.lastSub}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.05fr)", gap: 28 }}>
        {/* LEFT — prompt */}
        <div className="card paper" style={{ padding: 32 }}>
          <div className="row gap-2 items-center" style={{ marginBottom: 16 }}>
            {isPdf && (
              <button className={`tweak-opt ${tab === "pdf" ? "active" : ""}`} onClick={() => setTab("pdf")}>PDF</button>
            )}
            {["problem", "examples", "hints"].map((t) => (
              <button
                key={t}
                className={`tweak-opt ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}
              >{t}</button>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button className="tweak-opt" title="Download PDF">↓ pdf</button>
              <button className="tweak-opt" title="Open in new tab">↗</button>
            </div>
          </div>

          {tab === "pdf" && <PdfViewer problem={p} />}

          {tab === "problem" && <>
            <h3 className="serif" style={{ fontSize: 24, margin: "8px 0 10px" }}>Statement</h3>
            <p style={{ color: "var(--ink-soft)", lineHeight: 1.7 }}>
              You are given an N × N grid. Each cell holds either a coffee bean (●) or an empty cup (○).
              A <em>normal puzzle</em> is one where every row and every column has the same number of beans.
              Given the grid, determine the minimum number of cells you must flip so that the puzzle becomes normal.
            </p>
            <p style={{ color: "var(--ink-soft)", lineHeight: 1.7 }}>
              The grid is small enough that careful case analysis wins — <em>think with your hands</em>.
              For N = 2, listing all 24 cases is a valid approach worth 30 pts.
            </p>

            <h3 className="serif" style={{ fontSize: 20, margin: "22px 0 8px" }}>Input</h3>
            <div className="mono" style={{ fontSize: 13, color: "var(--ink-soft)", background: "var(--bg-warm)", padding: "12px 16px", borderRadius: 8 }}>
              Line 1: integer N (2 ≤ N ≤ 12)<br />
              Next N lines: a string of N characters, each '●' or '○'
            </div>

            <h3 className="serif" style={{ fontSize: 20, margin: "22px 0 8px" }}>Output</h3>
            <div className="mono" style={{ fontSize: 13, color: "var(--ink-soft)", background: "var(--bg-warm)", padding: "12px 16px", borderRadius: 8 }}>
              A single integer — the minimum number of flips.
            </div>

            <h3 className="serif" style={{ fontSize: 20, margin: "22px 0 8px" }}>Constraints</h3>
            <ul style={{ color: "var(--ink-soft)", lineHeight: 1.8, paddingLeft: 22 }}>
              <li>Subtask A (30 pts): N = 2</li>
              <li>Subtask B (40 pts): N ≤ 6</li>
              <li>Subtask C (30 pts): N ≤ 12</li>
            </ul>
          </>}

          {tab === "examples" && <>
            <h3 className="serif" style={{ fontSize: 24, margin: "8px 0 16px" }}>Examples</h3>
            {[["2\n●○\n○●", "0"], ["3\n●●○\n○○●\n●●○", "2"]].map(([inp, out], i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <div className="kicker" style={{ marginBottom: 6 }}>input #{i + 1}</div>
                  <pre className="mono" style={{ margin: 0, padding: 14, background: "var(--bg-warm)", borderRadius: 8, fontSize: 13 }}>{inp}</pre>
                </div>
                <div>
                  <div className="kicker" style={{ marginBottom: 6 }}>output</div>
                  <pre className="mono" style={{ margin: 0, padding: 14, background: "var(--bg-warm)", borderRadius: 8, fontSize: 13 }}>{out}</pre>
                </div>
              </div>
            ))}
          </>}

          {tab === "hints" && <>
            <h3 className="serif" style={{ fontSize: 24, margin: "8px 0 16px" }}>Hints</h3>
            <div className="card-kraft" style={{ padding: 18, marginBottom: 12 }}>
              <div className="kicker" style={{ marginBottom: 6 }}>hint · 1 of 3</div>
              <div style={{ color: "var(--ink-soft)" }}>For small N, think about what each row's bean count must be in a "normal" grid.</div>
            </div>
            <div className="card-kraft" style={{ padding: 18, opacity: 0.6 }}>
              <div className="kicker">hint · 2 of 3 — click to unlock (−5 pts)</div>
            </div>
          </>}
        </div>

        {/* RIGHT — editor + testcases */}
        <div className="col gap-4">
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line-soft)", display: "flex", alignItems: "center", gap: 12 }}>
              <div className="kicker">editor</div>
              <select className="select" value={lang} onChange={(e) => setLang(e.target.value)} style={{ width: "auto", padding: "4px 30px 4px 10px", fontSize: 12, fontFamily: "var(--mono)" }}>
                <option>C++17</option><option>C++20</option><option>Python 3.12</option><option>Java 21</option><option>Verilog</option>
              </select>
              <span className="mono muted" style={{ fontSize: 11, marginLeft: "auto" }}>autosaved · just now</span>
            </div>
            <CodePane filename="solution.cpp" lang={lang}>
{`<span class="tok-cm">// normal puzzle — minimum flips to balance</span>
<span class="tok-kw">#include</span> <span class="tok-str">&lt;bits/stdc++.h&gt;</span>
<span class="tok-kw">using namespace</span> std;

<span class="tok-kw">int</span> <span class="tok-fn">main</span>() {
  <span class="tok-kw">int</span> n; cin &gt;&gt; n;
  vector&lt;string&gt; g(n);
  <span class="tok-kw">for</span> (<span class="tok-kw">auto</span>&amp; r : g) cin &gt;&gt; r;

  <span class="tok-kw">int</span> best = INT_MAX;
  <span class="tok-kw">for</span> (<span class="tok-kw">int</span> target = <span class="tok-num">0</span>; target &lt;= n; ++target) {
    <span class="tok-kw">int</span> cost = <span class="tok-fn">solve</span>(g, target);
    best = min(best, cost);
  }
  cout &lt;&lt; best &lt;&lt; endl;
}`}
            </CodePane>
            <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "#1A201A", display: "flex", alignItems: "center", gap: 10, color: "#9A9782", fontFamily: "var(--mono)", fontSize: 11 }}>
              <span>Ln 14, Col 28</span>
              <span style={{ marginLeft: "auto" }}>UTF-8 · LF · 24 lines</span>
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div className="row items-center justify-between" style={{ marginBottom: 12 }}>
              <div>
                <div className="kicker">the taste test</div>
                <div className="serif" style={{ fontSize: 20, marginTop: 2 }}>Testcases</div>
              </div>
              <div className="row items-center gap-3">
                <span className="mono muted" style={{ fontSize: 12 }}>
                  {tcStates.filter((s) => s === "pass").length}/{tcStates.length} passed
                </span>
                <button className="btn btn-sage" onClick={runSubmit} disabled={running}>
                  {running ? "Grading…" : "Submit & brew"}
                </button>
              </div>
            </div>

            <div className="col gap-2">
              {tcStates.map((s, i) => (
                <div key={i} className={`tc-row ${s}`}>
                  <span className="tc-dot" />
                  <span>case {String(i + 1).padStart(2, "0")} · {["sample", "sample", "small", "small", "medium", "medium", "medium", "large", "large", "stress"][i]}</span>
                  <span>{s === "pass" ? "0.0" + Math.floor(Math.random()*9+1) + "s" : s === "running" ? "…" : s === "fail" ? "WA" : "—"}</span>
                  <span style={{ textAlign: "right" }}>
                    {s === "pass" ? "✓ passed" : s === "running" ? "steeping…" : s === "fail" ? "✕ wrong" : "pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SAMPLE_CODE = `// normal puzzle`;

function PdfViewer({ problem }) {
  return (
    <div style={{ margin: "-16px -16px 0" }}>
      <div className="row items-center justify-between mono" style={{
        padding: "10px 16px", background: "var(--bg-warm)",
        border: "1px solid var(--line)", borderRadius: "var(--r) var(--r) 0 0",
        fontSize: 11, color: "var(--muted)", letterSpacing: "0.06em",
      }}>
        <span>{problem.num}_{problem.id}.pdf · 3 pages</span>
        <div className="row gap-3">
          <span>↕ fit page</span>
          <span>⌕ 100%</span>
          <span>page 1 of 3</span>
        </div>
      </div>
      {/* Faux PDF page */}
      <div style={{
        background: "#FDFCF9", border: "1px solid var(--line)",
        borderTop: "none", borderRadius: "0 0 var(--r) var(--r)",
        padding: "48px 56px", minHeight: 620, position: "relative",
        boxShadow: "inset 0 6px 12px -8px rgba(0,0,0,0.06)",
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: "#1A1A1A", lineHeight: 1.7, fontSize: 14,
      }}>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 10, color: "#999",
          letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6,
          borderBottom: "1px solid #E5E5E5", paddingBottom: 10,
          display: "flex", justifyContent: "space-between",
        }}>
          <span>CPE 2110103 — Algorithm Design · Semester 1/68</span>
          <span>Problem {problem.num}</span>
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, margin: "20px 0 4px", fontWeight: "normal" }}>
          {problem.name}
        </h1>
        <div style={{ fontSize: 12, color: "#666", fontStyle: "italic", marginBottom: 24 }}>
          Time limit: 2 seconds · Memory limit: 256 MB · {problem.pts} points
        </div>

        <p style={{ margin: "0 0 14px" }}>
          You are given an N × N grid. Each cell holds either a coffee bean (●) or an empty cup (○).
          A <em>normal puzzle</em> is one where every row and every column contains the same number of beans.
        </p>
        <p style={{ margin: "0 0 14px" }}>
          Given the initial configuration, determine the minimum number of cells you must flip so that
          the puzzle becomes normal. The grid is small enough that careful case analysis wins — <em>think with your hands</em>.
        </p>

        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 18, margin: "24px 0 6px", fontWeight: "normal" }}>Input</h2>
        <p style={{ margin: "0 0 12px" }}>
          The first line contains an integer N (2 ≤ N ≤ 12).
          The next N lines each contain a string of N characters, each either '●' or '○'.
        </p>

        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 18, margin: "24px 0 6px", fontWeight: "normal" }}>Output</h2>
        <p style={{ margin: "0 0 12px" }}>Print a single integer — the minimum number of flips required.</p>

        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 18, margin: "24px 0 10px", fontWeight: "normal" }}>Example</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "#F5F2EC", padding: "10px 14px", borderRadius: 4, fontFamily: "Courier, monospace", fontSize: 12, whiteSpace: "pre" }}>
            {"3\n●●○\n○○●\n●●○"}
          </div>
          <div style={{ background: "#F5F2EC", padding: "10px 14px", borderRadius: 4, fontFamily: "Courier, monospace", fontSize: 12 }}>
            2
          </div>
        </div>

        <div style={{
          position: "absolute", bottom: 16, left: 0, right: 0,
          textAlign: "center", fontSize: 11, color: "#999", fontFamily: "var(--mono)",
        }}>— 1 —</div>
      </div>
    </div>
  );
}


Object.assign(window, { ProblemPage });
