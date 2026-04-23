"use client";

import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { JUDGE0_LANGUAGE_MAP, STARTER_CODE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const monacoLanguage = useMemo(() => JUDGE0_LANGUAGE_MAP[languageId as 54 | 62 | 71].monaco, [languageId]);

  async function onSubmit() {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId,
          code,
          languageId,
        }),
      });

      const data = (await response.json()) as SubmitResponse;
      setResult(data);
    } catch {
      setResult({ status: "ERR", score: 0, passed: 0, total: 0, message: "Unexpected error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={languageId}
          onChange={(event) => {
            const selected = Number(event.target.value);
            setLanguageId(selected);
            setCode(STARTER_CODE[selected]);
          }}
          className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
        >
          {languageOptions.map((language) => (
            <option key={language.id} value={language.id}>
              {language.label}
            </option>
          ))}
        </select>
        <Button onClick={onSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <Editor
          height="520px"
          theme="vs-dark"
          language={monacoLanguage}
          value={code}
          onChange={(value) => setCode(value ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
          }}
        />
      </div>

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle>Result: {result.status}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-zinc-300">
            <p>Score: {result.score}</p>
            <p>Passed: {result.passed}/{result.total}</p>
            {result.message ? <p>{result.message}</p> : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
