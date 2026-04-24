"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ProblemWithStat } from "@/app/page";

type Toast = { id: string; title: string; msg: string; kind: "ok" | "wrong" | "info" };

function detectLanguage(filename: string): number {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "cpp" || ext === "cc" || ext === "cxx") return 54;
  if (ext === "java") return 62;
  return 71; // default Python
}

export function DashboardSubmitBox({
  problems,
  isLoggedIn,
}: {
  problems: ProblemWithStat[];
  isLoggedIn: boolean;
}) {
  const [problemId, setProblemId] = useState<string>("");
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function addToast(t: Omit<Toast, "id">) {
    const id = Math.random().toString(36).slice(2);
    setToasts((ts) => [...ts, { ...t, id }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 5200);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setFileContent((ev.target?.result as string) ?? "");
    reader.readAsText(file);
  }

  async function handleSubmit() {
    if (!isLoggedIn) {
      router.push("/auth");
      return;
    }
    if (!problemId) {
      addToast({ title: "Pick a problem first", msg: "Select a problem from the dropdown.", kind: "wrong" });
      return;
    }
    if (!fileContent) {
      addToast({ title: "No file chosen", msg: "Choose a source file to submit.", kind: "wrong" });
      return;
    }

    const languageId = detectLanguage(fileName);
    setLoading(true);

    addToast({ title: "Submitted to the grader", msg: `${fileName} · queued for brewing`, kind: "info" });

    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: Number(problemId), code: fileContent, languageId }),
      });

      const data = await res.json() as { status: string; score: number; passed: number; total: number; message?: string };

      if (res.ok && data.status === "AC") {
        addToast({
          title: "Accepted — nicely brewed ☕",
          msg: `All ${data.total} testcases passed · ${data.score} pts`,
          kind: "ok",
        });
      } else if (res.ok) {
        addToast({
          title: `${data.status === "CE" ? "Compile Error" : data.status === "TLE" ? "Time Limit Exceeded" : `Partial · ${data.score} pts`}`,
          msg: data.message ?? `${data.passed}/${data.total} testcases passed`,
          kind: "wrong",
        });
      } else {
        addToast({ title: "Submission failed", msg: "Server error — try again.", kind: "wrong" });
      }

      router.push(`/problems/${problemId}`);
      router.refresh();
    } catch {
      addToast({ title: "Network error", msg: "Could not reach the grading server.", kind: "wrong" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: "var(--amber-bg)",
            display: "grid", placeItems: "center", color: "var(--amber-dark)",
            fontFamily: "var(--serif)", fontSize: 20,
          }}>↑</div>
          <div>
            <div className="serif" style={{ fontSize: 22, lineHeight: 1 }}>Drop off your order</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
              Submit your code — we&apos;ll taste-test it against every case.
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
          <div>
            <label className="field-label">Problem</label>
            <select
              className="select"
              value={problemId}
              onChange={(e) => setProblemId(e.target.value)}
            >
              <option value="">— Select a problem —</option>
              {problems.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">File</label>
            <label className="input" style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 14px" }}>
              <span style={{
                padding: "4px 10px", background: "var(--bg-warm)", borderRadius: 999,
                fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-soft)", flexShrink: 0,
              }}>Choose</span>
              <span className="mono" style={{ fontSize: 12, color: fileName ? "var(--ink)" : "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {fileName || "solution.cpp · no file chosen"}
              </span>
              <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleFileChange} accept=".cpp,.cc,.py,.java,.txt" />
            </label>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ height: 46 }}
          >
            {loading ? (
              <>
                <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                Brewing…
              </>
            ) : (
              <>Submit →</>
            )}
          </button>
        </div>
      </div>

      {/* Toast stack */}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.kind === "wrong" ? "wrong" : t.kind === "info" ? "info" : ""}`}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: t.kind === "wrong" ? "var(--clay-bg)" : t.kind === "info" ? "var(--amber-bg)" : "var(--sage-bg)",
              color: t.kind === "wrong" ? "var(--clay)" : t.kind === "info" ? "var(--amber-dark)" : "#5C7558",
              display: "grid", placeItems: "center", fontSize: 14, fontWeight: 600, flexShrink: 0,
            }}>
              {t.kind === "wrong" ? "✕" : t.kind === "info" ? "◦" : "✓"}
            </div>
            <div style={{ flex: 1 }}>
              <div className="toast-title">{t.title}</div>
              <div className="toast-msg">{t.msg}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
