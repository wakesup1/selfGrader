// Submissions list + submission detail

function SubmissionsPage({ onOpen }) {
  const [filter, setFilter] = React.useState("all");
  const list = window.NG_DATA.submissions.filter((s) => {
    if (filter === "all") return true;
    if (filter === "accepted") return s.verdict === "Accepted";
    if (filter === "partial") return s.verdict === "Partial";
    if (filter === "wrong") return s.verdict === "Wrong Answer";
    return true;
  });

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-sub">your order history · kept for 90 days</div>
          <h1 className="page-title">Submissions</h1>
          <p className="page-intro">Every cup you've ordered. Click a receipt to see the full tasting notes and compiler messages.</p>
        </div>
        <div className="row gap-2">
          {[
            ["all", "All"], ["accepted", "Brewed"], ["partial", "Steeping"], ["wrong", "Burnt"]
          ].map(([k, v]) => (
            <button key={k} className={`tweak-opt ${filter === k ? "active" : ""}`} onClick={() => setFilter(k)}>{v}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table className="problems-table">
          <thead>
            <tr>
              <th style={{ width: 120 }}>Order #</th>
              <th>Problem</th>
              <th style={{ width: 120 }}>Verdict</th>
              <th style={{ width: 100 }}>Score</th>
              <th style={{ width: 100 }}>Runtime</th>
              <th style={{ width: 110 }}>Language</th>
              <th style={{ width: 180 }}>When</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="clickable" onClick={() => onOpen(s.id)}>
                <td className="mono" style={{ fontSize: 12 }}>#{s.id}</td>
                <td>
                  <div className="serif" style={{ fontSize: 17 }}>{s.problem}</div>
                  <div className="mono muted" style={{ fontSize: 11, marginTop: 2 }}>try #{s.tries}</div>
                </td>
                <td>
                  <Chip variant={window.NG_HELPERS.verdictChip(s.verdict)}>{s.verdict}</Chip>
                </td>
                <td className="mono" style={{ fontSize: 13, color: s.score === 100 ? "var(--sage-dark)" : s.score > 0 ? "var(--amber-dark)" : "var(--clay)" }}>
                  {s.score.toFixed(1)}
                </td>
                <td className="mono muted" style={{ fontSize: 12 }}>{s.runtime}</td>
                <td className="mono muted" style={{ fontSize: 12 }}>{s.lang}</td>
                <td className="mono muted" style={{ fontSize: 12 }}>
                  <div>{s.time}</div>
                  <div style={{ fontSize: 10.5, opacity: 0.7 }}>{s.date}</div>
                </td>
                <td><span className="muted">→</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubmissionDetail({ submissionId, onBack }) {
  const s = window.NG_DATA.submissions.find((x) => x.id === submissionId) || window.NG_DATA.submissions[0];
  const cases = React.useMemo(() => {
    const n = 10;
    return Array.from({ length: n }, (_, i) => {
      if (s.verdict === "Accepted") return "pass";
      if (s.verdict === "Wrong Answer") return i < 2 ? "pass" : "fail";
      return i === 2 || i === 7 ? "fail" : "pass";
    });
  }, [s.id]);

  const passCount = cases.filter((c) => c === "pass").length;
  const verdictTone = s.verdict === "Accepted" ? "accepted" : s.verdict === "Wrong Answer" ? "wrong" : "pending";

  return (
    <div>
      <div className="row items-center gap-3" style={{ marginBottom: 18 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← all submissions</button>
        <span className="mono muted" style={{ fontSize: 11 }}>submissions / #{s.id}</span>
      </div>

      {/* receipt header */}
      <div className="receipt" style={{ marginBottom: 28 }}>
        <div className="receipt-notch l" />
        <div className="receipt-notch r" />
        <div className="row items-start justify-between">
          <div style={{ flex: 1 }}>
            <div className="kicker" style={{ marginBottom: 10 }}>nograder · order receipt</div>
            <div className="row gap-6 items-start">
              <div>
                <div className={`verdict-hero ${verdictTone}`}>{s.verdict}</div>
                <div className="mono muted" style={{ fontSize: 12, marginTop: 8 }}>#{s.id} · try {s.tries} · {s.date}</div>
              </div>
              <div style={{ width: 1, background: "var(--kraft-2)", alignSelf: "stretch" }} />
              <div>
                <div className="kicker" style={{ marginBottom: 6 }}>problem</div>
                <div className="serif" style={{ fontSize: 28, letterSpacing: "-0.02em" }}>{s.problem}</div>
                <div className="mono muted" style={{ fontSize: 12, marginTop: 4 }}>a68_q4a_normal_puzzle</div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.14em" }}>SCORE</div>
            <div className="serif" style={{ fontSize: 64, lineHeight: 1, letterSpacing: "-0.03em", color: s.score === 100 ? "var(--sage-dark)" : s.score > 0 ? "var(--amber-dark)" : "var(--clay)" }}>
              {s.score.toFixed(1)}
            </div>
            <div className="mono muted" style={{ fontSize: 11 }}>/ 100.00</div>
          </div>
        </div>
        <div className="divider-dashed" style={{ margin: "24px 0 16px" }} />
        <div className="row gap-8 mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
          <ReceiptStat k="Language" v={s.lang} />
          <ReceiptStat k="Runtime" v={s.runtime} />
          <ReceiptStat k="Memory" v={s.mem} />
          <ReceiptStat k="Passed" v={`${passCount}/10`} />
          <ReceiptStat k="Grader" v="c07-node-14" />
          <ReceiptStat k="Queued" v="0.02s" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="kicker" style={{ marginBottom: 10 }}>tasting notes · per case</div>
          <div className="serif" style={{ fontSize: 22, marginBottom: 16 }}>Testcase results</div>
          <div className="col gap-2">
            {cases.map((c, i) => (
              <div key={i} className={`tc-row ${c}`}>
                <span className="tc-dot" />
                <span>case {String(i + 1).padStart(2, "0")} · {["sample","sample","small","small","medium","medium","medium","large","large","stress"][i]}</span>
                <span>{c === "pass" ? "0.0" + ((i*3)%7+1) + "s" : "—"}</span>
                <span style={{ textAlign: "right" }}>{c === "pass" ? "✓ passed" : "✕ wrong"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col gap-4">
          <CodePane filename={`solution.${s.lang.startsWith("Python") ? "py" : s.lang === "Verilog" ? "v" : "cpp"}`} lang={s.lang}>
{`<span class="tok-cm">// submission #${s.id}</span>
<span class="tok-kw">#include</span> <span class="tok-str">&lt;bits/stdc++.h&gt;</span>
<span class="tok-kw">using namespace</span> std;

<span class="tok-kw">int</span> <span class="tok-fn">solve</span>(vector&lt;string&gt;&amp; g, <span class="tok-kw">int</span> t) {
  <span class="tok-kw">int</span> n = g.size(), cost = <span class="tok-num">0</span>;
  <span class="tok-kw">for</span> (<span class="tok-kw">auto</span>&amp; row : g) {
    <span class="tok-kw">int</span> c = count(row.begin(), row.end(), <span class="tok-str">'@'</span>);
    cost += abs(c - t);
  }
  <span class="tok-kw">return</span> cost;
}`}
          </CodePane>
          <div className="card" style={{ padding: 20 }}>
            <div className="kicker" style={{ marginBottom: 10 }}>compiler message</div>
            <pre className="mono" style={{
              margin: 0, padding: 14, background: "#22291F", color: "#D8D2C2",
              borderRadius: 8, fontSize: 12, lineHeight: 1.6, overflowX: "auto", whiteSpace: "pre-wrap"
            }}>
{`g++ -std=c++17 -O2 -Wall solution.cpp -o solution
solution.cpp: In function 'int main()':
solution.cpp:14:18: warning: unused variable 'k' [-Wunused-variable]
   14 |   int k = best;
      |                  ^
Compilation finished with warnings (exit 0) — 0.34s`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptStat({ k, v }) {
  return (
    <div>
      <div className="kicker" style={{ marginBottom: 2 }}>{k}</div>
      <div>{v}</div>
    </div>
  );
}

Object.assign(window, { SubmissionsPage, SubmissionDetail });
