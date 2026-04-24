"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { JUDGE0_LANGUAGE_MAP, STARTER_CODE } from "@/lib/constants";
import { STATUS_LABEL } from "@/lib/utils";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { IconBrewed, IconBurnt, IconSteeping, IconTimeout, IconSpilled, IconCompileErr, IconPlay } from "@/components/icons";

type SubmitResponse = {
  status: string; score: number; passed: number; total: number; 
  message?: string; results: TcState[]; // เพิ่ม results ตรงนี้
};

type TcState = "pending" | "running" | "pass" | "fail";

const languageOptions = Object.entries(JUDGE0_LANGUAGE_MAP).map(([id, value]) => ({
  id: Number(id), ...value,
}));

export function ProblemEditor({ problemId }: { problemId: number }) {
  const [languageId, setLanguageId] = useState(71);
  const [code, setCode] = useState(STARTER_CODE[71]);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [tcStates, setTcStates] = useState<TcState[]>([]);
  const [animating, setAnimating] = useState(false);
  // Fake execution times generated once per submission — stable across re-renders.
  // Using a ref instead of state avoids triggering extra renders.
  const fakeTimes = useRef<string[]>([]);
  const router = useRouter();

  const monacoLanguage = useMemo(
    () => JUDGE0_LANGUAGE_MAP[languageId as 54 | 62 | 71].monaco,
    [languageId],
  );

  const animateCases = useCallback((results: TcState[]) => {
    const total = results.length;
    const init: TcState[] = Array(total).fill("pending");
    // Generate fake execution times once per submission so they're stable across re-renders.
    fakeTimes.current = Array.from({ length: total }, (_, i) =>
      `0.0${((i * 7 + 3) % 9) + 1}s`
    );
    setTcStates(init);
    setAnimating(true);

    let i = 0;
    const step = () => {
      if (i >= total) { setAnimating(false); return; }
      const idx = i;
      setTcStates((prev) => {
        const next = [...prev];
        next[idx] = "running";
        return next;
      });

      setTimeout(() => {
        setTcStates((prev) => {
          const next = [...prev];
          next[idx] = results[idx]; // <--- ใช้ค่าจริงจาก Backend ตรงๆ เลย!
          return next;
        });
        i++;
        setTimeout(step, 140);
      }, 260);
    };
    setTimeout(step, 200);
  }, []);

  async function onSubmit() {
    setLoading(true);
    setResult(null);
    setTcStates([]);

    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, code, languageId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { message?: string };
        if (response.status === 401) {
          alert("Please sign in to submit your solution.");
          return;
        }
        if (response.status === 503) {
          alert("Judge0 server is offline. Please try again later.");
          return;
        }
        alert(data.message ?? "Submission failed.");
        return;
      }

      // 3. ปรับตอนเรียกใช้ใน onSubmit
      const data = (await response.json()) as SubmitResponse;
      setResult(data);
      animateCases(data.results); // <--- ส่งข้อมูลรายข้อไป
      router.refresh();
    } catch {
      alert("Network error: unable to reach the grading server.");
    } finally {
      setLoading(false);
    }
  }

  const passedCount = tcStates.filter((s) => s === "pass").length;

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%", minHeight: "70vh",
      overflow: "hidden", borderRadius: 14, border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)",
    }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--line)", background: "var(--surface)", padding: "10px 16px",
      }}>
        <div className="row items-center gap-3">
          <div className="kicker">editor</div>
          <select
            value={languageId}
            onChange={(e) => {
              const sel = Number(e.target.value);
              setLanguageId(sel);
              setCode(STARTER_CODE[sel]);
            }}
            style={{
              border: "1px solid var(--line)", borderRadius: 6, background: "var(--surface)",
              padding: "4px 10px", fontSize: 12, fontFamily: "var(--mono)", color: "var(--ink-soft)",
              outline: "none",
            }}
          >
            {languageOptions.map((lang) => (
              <option key={lang.id} value={lang.id}>{lang.label}</option>
            ))}
          </select>
        </div>
        <span className="mono muted" style={{ fontSize: 11 }}>autosaved · just now</span>
      </div>

      {/* Editor pane */}
      <div style={{ flex: "0 0 52%", minHeight: 0 }}>
        <Editor
          theme="vs-dark"
          language={monacoLanguage}
          value={code}
          onChange={(v) => setCode(v ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
            padding: { top: 12 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbersMinChars: 3,
          }}
        />
      </div>

      {/* Editor status bar */}
      <div style={{
        padding: "8px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "#1A201A",
        display: "flex", alignItems: "center", gap: 10, color: "#9A9782",
        fontFamily: "var(--mono)", fontSize: 11,
      }}>
        <span>{JUDGE0_LANGUAGE_MAP[languageId as 54 | 62 | 71].label}</span>
        <span style={{ marginLeft: "auto" }}>UTF-8 · LF</span>
      </div>

      {/* Testcase panel */}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 20, background: "var(--surface)", borderTop: "1px solid var(--line)" }}>
        <div className="row items-center justify-between" style={{ marginBottom: 12 }}>
          <div>
            <div className="kicker">the taste test</div>
            <div className="serif" style={{ fontSize: 20, marginTop: 2 }}>Testcases</div>
          </div>
          <div className="row items-center gap-3">
            {tcStates.length > 0 && (
              <span className="mono muted" style={{ fontSize: 12 }}>
                {passedCount}/{tcStates.length} passed
              </span>
            )}
            <button
              className="btn btn-sage"
              onClick={onSubmit}
              disabled={loading || animating}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              {loading ? (
                <>
                  <IconSteeping size={13} />
                  Brewing…
                </>
              ) : (
                <>
                  <IconPlay size={13} />
                  Submit &amp; brew
                </>
              )}
            </button>
          </div>
        </div>

        {/* Idle state */}
        {tcStates.length === 0 && !loading && !result && (
          <div style={{ padding: "24px 0", textAlign: "center", color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 13 }}>
            Submit your code to see the taste test.
          </div>
        )}

        {/* Loading / grading */}
        {loading && tcStates.length === 0 && (
          <div style={{ padding: "24px 0", textAlign: "center", color: "var(--amber-dark)", fontFamily: "var(--mono)", fontSize: 13 }}>
            Sending to grader… ☕
          </div>
        )}

        {/* Testcase rows */}
        {tcStates.length > 0 && (
          <div className="col gap-2" style={{ marginBottom: 12 }}>
            {tcStates.map((s, i) => (
              <div key={i} className={`tc-row ${s}`}>
                <span className="tc-dot" />
                <span>
                  case {String(i + 1).padStart(2, "0")} · {
                    ["sample","sample","small","small","medium","medium","medium","large","large","stress"][i] ?? "hidden"
                  }
                </span>
                <span>
                  {s === "pass" ? (fakeTimes.current[i] ?? "—") : s === "running" ? "…" : s === "fail" ? "WA" : "—"}
                </span>
                <span style={{ textAlign: "right" }}>
                  {s === "pass" ? "✓ passed" : s === "running" ? "steeping…" : s === "fail" ? "✕ wrong" : "pending"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Result summary */}
        {result && !animating && (
          <div style={{ marginTop: 8 }}>
            <div className="divider-dashed" style={{ marginBottom: 14 }} />
            <div className="row gap-8 mono" style={{ fontSize: 12, color: "var(--ink-soft)", flexWrap: "wrap" }}>
              <div>
                <div className="kicker" style={{ marginBottom: 2 }}>Verdict</div>
                <div style={{
                  fontFamily: "var(--serif)", fontSize: 20,
                  color: result.status === "AC" ? "#5C7558" : result.status === "TLE" ? "var(--amber-dark)" : "var(--clay)",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {result.status === "AC"  ? <IconBrewed size={18} /> :
                   result.status === "WA"  ? <IconBurnt size={18} /> :
                   result.status === "TLE" ? <IconTimeout size={18} /> :
                   result.status === "CE"  ? <IconCompileErr size={18} /> :
                   result.status === "RE"  ? <IconSpilled size={18} /> :
                   <IconSteeping size={18} />}
                  {STATUS_LABEL[result.status] ?? result.status}
                </div>
              </div>
              <div>
                <div className="kicker" style={{ marginBottom: 2 }}>Score</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 20, color: "var(--clay)" }}>
                  {result.score}
                </div>
              </div>
              <div>
                <div className="kicker" style={{ marginBottom: 2 }}>Passed</div>
                <div style={{ fontSize: 14 }}>{result.passed} / {result.total}</div>
              </div>
            </div>

            {result.message && (
              <div style={{
                marginTop: 12, borderRadius: 8, background: "#22291F",
                border: "1px solid rgba(255,255,255,0.05)", padding: "12px 14px",
              }}>
                <div className="kicker" style={{ color: "#C87B72", marginBottom: 6 }}>compiler message</div>
                <pre className="mono" style={{
                  margin: 0, padding: 0, fontSize: 12, lineHeight: 1.6,
                  color: "#D8D2C2", whiteSpace: "pre-wrap",
                }}>
                  {result.message}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
