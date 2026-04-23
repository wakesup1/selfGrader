"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type TestCaseInput = {
  id?: number;
  input: string;
  expected_output: string;
  is_sample: boolean;
};

type InitialValues = {
  id: number;
  title: string;
  description: string;
  constraints: string;
  difficulty: string;
  points: number;
  time_limit: number;
  memory_limit: number;
  is_published: boolean;
  testCases: TestCaseInput[];
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  border: "1px solid var(--line)", borderRadius: 8,
  background: "var(--surface)", fontSize: 14,
  fontFamily: "var(--sans)", color: "var(--ink)",
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
};

export function AdminProblemForm({ initial }: { initial?: InitialValues }) {
  const isEdit = !!initial;
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [constraints, setConstraints] = useState(initial?.constraints ?? "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "Easy");
  const [points, setPoints] = useState(initial?.points ?? 100);
  const [timeLimit, setTimeLimit] = useState(initial?.time_limit ?? 2);
  const [memoryLimit, setMemoryLimit] = useState(initial?.memory_limit ?? 256);
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true);
  const [testCases, setTestCases] = useState<TestCaseInput[]>(
    initial?.testCases ?? [{ input: "", expected_output: "", is_sample: true }],
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function updateCase(index: number, patch: Partial<TestCaseInput>) {
    setTestCases((cur) => cur.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeCase(index: number) {
    setTestCases((cur) => cur.filter((_, i) => i !== index));
  }

  async function submit() {
    setMessage("");
    setLoading(true);
    try {
      const url = isEdit ? `/api/admin/problems/${initial.id}` : "/api/admin/problems";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, constraints, difficulty, points,
          time_limit: timeLimit, memory_limit: memoryLimit,
          is_published: isPublished, testCases,
        }),
      });

      const data = (await res.json()) as { message?: string; error?: string; id?: number };
      if (!res.ok) { setMessage(data.error ?? "Failed to save"); return; }
      setMessage(data.message ?? "Saved");

      if (!isEdit) {
        setTitle(""); setDescription(""); setConstraints("");
        setDifficulty("Easy"); setPoints(100); setTimeLimit(2);
        setMemoryLimit(256); setIsPublished(true);
        setTestCases([{ input: "", expected_output: "", is_sample: true }]);
        if (data.id) router.push(`/admin/problems/${data.id}/edit`);
      }
    } finally {
      setLoading(false);
    }
  }

  const sectionHead = (text: string) => (
    <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 16 }}>
      {text}
    </div>
  );

  return (
    <div>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, gap: 16 }}>
        <div>
          <div className="kicker" style={{ marginBottom: 6 }}>{isEdit ? "editing problem" : "new problem"}</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 32, color: "var(--ink)", margin: 0, fontWeight: 400, letterSpacing: "-0.015em" }}>
            {isEdit ? initial.title : "New Problem"}
          </h1>
        </div>
        <Link href="/admin/problems" style={{
          padding: "8px 16px", border: "1px solid var(--line)",
          borderRadius: 999, fontSize: 13, color: "var(--ink-soft)", textDecoration: "none",
        }}>
          ← All Problems
        </Link>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        {/* Basic info */}
        <div style={{ padding: 24, borderBottom: "1px solid var(--line)" }}>
          {sectionHead("Problem Info")}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input style={inputStyle} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea
              style={{ ...textareaStyle, minHeight: 180, fontFamily: "var(--mono)", fontSize: 13 }}
              placeholder="Description (Markdown supported)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <textarea
              style={{ ...textareaStyle, minHeight: 64 }}
              placeholder="Constraints (e.g. 1 ≤ N ≤ 10^5)"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
            />
          </div>
        </div>

        {/* Settings */}
        <div style={{ padding: 24, borderBottom: "1px solid var(--line)" }}>
          {sectionHead("Settings")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={{ ...inputStyle }}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
            <input style={inputStyle} type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} placeholder="Points" />
            <input style={inputStyle} type="number" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} placeholder="Time (s)" />
            <input style={inputStyle} type="number" value={memoryLimit} onChange={(e) => setMemoryLimit(Number(e.target.value))} placeholder="Memory (MB)" />
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--ink-soft)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "var(--clay)" }}
              />
              Published
            </label>
          </div>
        </div>

        {/* Test cases */}
        <div style={{ padding: 24, borderBottom: "1px solid var(--line)" }}>
          {sectionHead("Test Cases")}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {testCases.map((tc, i) => (
              <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 16, background: "var(--bg-warm)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted-2)" }}>Case {i + 1}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--muted)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={tc.is_sample}
                        onChange={(e) => updateCase(i, { is_sample: e.target.checked })}
                        style={{ width: 13, height: 13, accentColor: "var(--clay)" }}
                      />
                      Sample (shown to users)
                    </label>
                    {testCases.length > 1 && (
                      <button type="button" onClick={() => removeCase(i)} style={{
                        fontSize: 12, color: "var(--clay)", background: "none",
                        border: "none", cursor: "pointer", padding: 0,
                      }}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  style={{ ...textareaStyle, minHeight: 56, fontFamily: "var(--mono)", fontSize: 13, marginBottom: 8 }}
                  placeholder="Input (leave empty for no-input problems)"
                  value={tc.input}
                  onChange={(e) => updateCase(i, { input: e.target.value })}
                />
                <textarea
                  style={{ ...textareaStyle, minHeight: 56, fontFamily: "var(--mono)", fontSize: 13 }}
                  placeholder="Expected output"
                  value={tc.expected_output}
                  onChange={(e) => updateCase(i, { expected_output: e.target.value })}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setTestCases((cur) => [...cur, { input: "", expected_output: "", is_sample: false }])}
              style={{
                alignSelf: "flex-start",
                padding: "8px 16px", border: "1px solid var(--line)",
                borderRadius: 999, fontSize: 13, color: "var(--ink-soft)",
                background: "var(--surface)", cursor: "pointer",
                fontFamily: "var(--sans)",
              }}
            >
              + Add Test Case
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 24 }}>
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            style={{
              padding: "10px 24px",
              background: "var(--ink)", color: "var(--bg)",
              borderRadius: 999, fontSize: 14, fontWeight: 500,
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, fontFamily: "var(--sans)",
            }}
          >
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Problem"}
          </button>
          {message && <p style={{ fontSize: 13.5, color: "var(--clay)" }}>{message}</p>}
        </div>
      </div>
    </div>
  );
}
