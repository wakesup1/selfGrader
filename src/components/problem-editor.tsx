"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { JUDGE0_LANGUAGE_MAP, STARTER_CODE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
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

export function ProblemEditor({ problemId }: { problemId: number }) {
  const [languageId, setLanguageId] = useState(71);
  const [code, setCode] = useState(STARTER_CODE[71]);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const monacoLanguage = useMemo(() => JUDGE0_LANGUAGE_MAP[languageId as 54 | 62 | 71].monaco, [languageId]);

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
          alert("⚠️ Judge0 Server is offline or unreachable. Please try again later.");
        } else {
          alert("⚠️ Failed to submit code. Server responded with error.");
        }
      }

      const data = (await response.json()) as SubmitResponse;
      setResult(data);
      router.refresh(); // Refresh to update Dashboard submissions table
    } catch {
      alert("⚠️ Network Error: Unable to reach the grading server.");
      setResult({ status: "ERR", score: 0, passed: 0, total: 0, message: "Unexpected error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[80vh] flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3">
        <div className="flex items-center gap-3">
          <select
            value={languageId}
            onChange={(event) => {
              const selected = Number(event.target.value);
              setLanguageId(selected);
              setCode(STARTER_CODE[selected]);
            }}
            className="h-9 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-200 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          >
            {languageOptions.map((language) => (
              <option key={language.id} value={language.id}>
                {language.label}
              </option>
            ))}
          </select>
        </div>
        <Button
          onClick={onSubmit}
          disabled={loading}
          className="bg-blue-600 font-semibold text-white hover:bg-blue-700"
        >
          {loading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              Running...
            </>
          ) : (
            <>
              <Play className="mr-1.5 h-4 w-4 fill-current" />
              Run Code
            </>
          )}
        </Button>
      </div>

      {/* Split Screen */}
      <ResizablePanelGroup className="flex-1">
        {/* Editor Panel */}
        <ResizablePanel defaultSize={60} minSize={30}>
          <Editor
            theme="vs-dark"
            language={monacoLanguage}
            value={code}
            onChange={(value) => setCode(value ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-slate-800" />

        {/* Console Panel */}
        <ResizablePanel defaultSize={40} minSize={20} className="flex flex-col bg-black">
          <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/50 px-4 py-2 text-xs font-semibold tracking-wider text-slate-400">
            <TerminalIcon className="h-4 w-4" />
            CONSOLE
          </div>
          <ScrollArea className="flex-1 p-4 font-mono text-sm leading-relaxed">
            {!result && !loading && (
              <div className="text-slate-500">Ready to run. Output will appear here...</div>
            )}
            
            {loading && (
              <div className="animate-pulse text-blue-400">Executing...</div>
            )}

            {result && !loading && (
              <div className="space-y-4">
                <div>
                  <span className="font-bold text-slate-400">Verdict: </span>
                  <span
                    className={`font-black ${
                      result.status === "AC"
                        ? "text-green-500"
                        : result.status === "ERR" || result.status === "JUDGE0_OFFLINE"
                          ? "text-red-500"
                          : "text-amber-500" // WA, TLE, etc.
                    }`}
                  >
                    {result.status}
                  </span>
                </div>
                
                <div>
                  <span className="font-bold text-slate-400">Score: </span>
                  <span className="text-blue-400">{result.score}</span>
                </div>
                
                <div>
                  <span className="font-bold text-slate-400">Test Cases Passed: </span>
                  <span className="text-slate-300">
                    {result.passed} / {result.total}
                  </span>
                </div>

                {result.message && (
                  <div className="mt-4 rounded-md bg-red-500/10 p-3 text-red-400 border border-red-500/20">
                    <div className="mb-1 font-bold">Error Output:</div>
                    <pre className="whitespace-pre-wrap font-mono text-xs">{result.message}</pre>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
