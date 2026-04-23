"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { JUDGE0_LANGUAGE_MAP, STARTER_CODE } from "@/lib/constants";
import { STATUS_LABEL } from "@/lib/utils";
import { Play, Terminal as TerminalIcon } from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";

type SubmitResponse = {
  status: string;
  score: number;
  passed: number;
  total: number;
  message?: string;
};

const languageOptions = Object.entries(JUDGE0_LANGUAGE_MAP).map(([id, value]) => ({
  id: Number(id),
  ...value,
}));

const verdictColor: Record<string, string> = {
  AC:  "#8FA88C",
  WA:  "var(--clay)",
  TLE: "var(--amber)",
  CE:  "#A87EC8",
  RE:  "#C89B6B",
};

export function ProblemEditor({ problemId }: { problemId: number }) {
  const [languageId, setLanguageId] = useState(71);
  const [code, setCode] = useState(STARTER_CODE[71]);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const monacoLanguage = useMemo(
    () => JUDGE0_LANGUAGE_MAP[languageId as 54 | 62 | 71].monaco,
    [languageId],
  );

  async function onSubmit() {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, code, languageId }),
      });

      if (!response.ok) {
        if (response.status === 503) {
          alert("Judge0 server is offline or unreachable. Please try again later.");
        } else {
          alert("Failed to submit. Server responded with an error.");
        }
      }

      const data = (await response.json()) as SubmitResponse;
      setResult(data);
      router.refresh();
    } catch {
      alert("Network error: unable to reach the grading server.");
      setResult({ status: "ERR", score: 0, passed: 0, total: 0, message: "Unexpected error" });
    } finally {
      setLoading(false);
    }
  }

  const vColor = result ? (verdictColor[result.status] ?? "var(--muted)") : "var(--muted)";

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%", minHeight: "78vh",
      overflow: "hidden", borderRadius: 14,
      border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)",
    }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--line)",
        background: "var(--surface)", padding: "10px 16px",
      }}>
        <select
          value={languageId}
          onChange={(e) => {
            const sel = Number(e.target.value);
            setLanguageId(sel);
            setCode(STARTER_CODE[sel]);
          }}
          style={{
            height: 32, borderRadius: 6,
            border: "1px solid var(--line)", background: "var(--surface)",
            padding: "0 10px", fontSize: 12.5,
            fontFamily: "var(--mono)", color: "var(--ink-soft)", cursor: "pointer",
          }}
        >
          {languageOptions.map((lang) => (
            <option key={lang.id} value={lang.id}>{lang.label}</option>
          ))}
        </select>

        <button
          onClick={onSubmit}
          disabled={loading}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "7px 16px",
            background: loading ? "var(--ink-soft)" : "var(--ink)",
            color: "var(--bg)", borderRadius: 999,
            fontSize: 12.5, fontWeight: 500, fontFamily: "var(--sans)",
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
        >
          {loading ? (
            <>
              <span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
              Brewing…
            </>
          ) : (
            <>
              <Play style={{ width: 12, height: 12, fill: "currentColor" }} />
              Submit & brew
            </>
          )}
        </button>
      </div>

      {/* Editor + Console */}
      <ResizablePanelGroup className="flex-1">
        <ResizablePanel defaultSize={62} minSize={30}>
          <Editor
            theme="vs-dark"
            language={monacoLanguage}
            value={code}
            onChange={(v) => setCode(v ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
              padding: { top: 14 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              lineNumbersMinChars: 3,
            }}
          />
        </ResizablePanel>

        <ResizableHandle style={{ background: "var(--line)", width: 1 }} className="hover:bg-amber-300 transition-colors" />

        <ResizablePanel defaultSize={38} minSize={20} className="flex flex-col" style={{ background: "var(--ink-bg)" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            padding: "10px 16px",
            fontFamily: "var(--mono)", fontSize: 10.5,
            letterSpacing: "0.2em", textTransform: "uppercase", color: "#5A6456",
          }}>
            <TerminalIcon style={{ width: 13, height: 13 }} />
            OUTPUT
          </div>
          <ScrollArea className="flex-1 p-4 font-mono text-xs leading-relaxed">
            {!result && !loading && (
              <span style={{ color: "#4A5448", fontFamily: "var(--mono)", fontSize: 12.5 }}>
                Submit your code to see tasting notes.
              </span>
            )}

            {loading && (
              <span style={{ color: "var(--amber)", fontFamily: "var(--mono)", fontSize: 12.5 }}>
                Brewing… ☕
              </span>
            )}

            {result && !loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <span style={{ color: "#4A5448", fontFamily: "var(--mono)", fontSize: 11 }}>VERDICT  </span>
                  <span style={{ fontWeight: 600, color: vColor, fontFamily: "var(--mono)" }}>
                    {STATUS_LABEL[result.status] ?? result.status}
                  </span>
                </div>
                <div>
                  <span style={{ color: "#4A5448", fontFamily: "var(--mono)", fontSize: 11 }}>SCORE    </span>
                  <span style={{ color: "var(--amber)", fontFamily: "var(--mono)" }}>{result.score}</span>
                </div>
                <div>
                  <span style={{ color: "#4A5448", fontFamily: "var(--mono)", fontSize: 11 }}>CASES    </span>
                  <span style={{ color: "#D8D2C2", fontFamily: "var(--mono)" }}>{result.passed} / {result.total}</span>
                </div>
                {result.message && (
                  <div style={{
                    marginTop: 4, borderRadius: 8,
                    background: "rgba(184,104,94,0.12)", border: "1px solid rgba(184,104,94,0.2)",
                    padding: "12px 14px",
                  }}>
                    <p style={{ marginBottom: 6, fontSize: 11, fontWeight: 500, color: "#C87B72", fontFamily: "var(--mono)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      Error
                    </p>
                    <pre style={{ whiteSpace: "pre-wrap", color: "rgba(200,140,134,0.85)", fontSize: 12, margin: 0, fontFamily: "var(--mono)" }}>
                      {result.message}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
