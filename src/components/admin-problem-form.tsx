"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconUpload, IconPdf, IconClose, IconPlus, IconTrash } from "@/components/icons";

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
  pdf_url: string | null;
  testCases: TestCaseInput[];
};

export function AdminProblemForm({ initial }: { initial?: InitialValues }) {
  const isEdit = !!initial;
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [constraints, setConstraints] = useState(initial?.constraints ?? "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "Medium");
  const [points, setPoints] = useState(initial?.points ?? 100);
  const [timeLimit, setTimeLimit] = useState(initial?.time_limit ?? 2);
  const [memoryLimit, setMemoryLimit] = useState(initial?.memory_limit ?? 256);
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? false);
  const [testCases, setTestCases] = useState<TestCaseInput[]>(
    initial?.testCases ?? [{ input: "", expected_output: "", is_sample: true }],
  );

  // PDF state
  const [sourceMode, setSourceMode] = useState<"pdf" | "markdown">(
    initial?.pdf_url ? "pdf" : "pdf", // default to PDF mode
  );
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState<string | null>(initial?.pdf_url ?? null);
  const [isDragging, setIsDragging] = useState(false);
  const [showFallbackDesc, setShowFallbackDesc] = useState(
    // auto-expand if there's already a description saved alongside a PDF
    !!(initial?.pdf_url && initial?.description),
  );
  const [pdfUploading, setPdfUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [toastKind, setToastKind] = useState<"ok" | "err">("ok");

  function updateCase(index: number, patch: Partial<TestCaseInput>) {
    setTestCases((cur) => cur.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }
  function removeCase(index: number) {
    setTestCases((cur) => cur.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") setPdfFile(file);
  }

  async function uploadPdf(problemId: number): Promise<string | null> {
    if (!pdfFile) return existingPdfUrl;
    setPdfUploading(true);
    try {
      const fd = new FormData();
      fd.append("pdf", pdfFile);
      const res = await fetch(`/api/admin/problems/${problemId}/pdf`, {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { pdf_url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "PDF upload failed");
      return data.pdf_url ?? null;
    } finally {
      setPdfUploading(false);
    }
  }

  async function removePdf() {
    if (!isEdit || !initial) return;
    if (!confirm("Remove the uploaded PDF? The inline description will be used instead.")) return;
    const res = await fetch(`/api/admin/problems/${initial.id}/pdf`, { method: "DELETE" });
    if (res.ok) {
      setExistingPdfUrl(null);
      setPdfFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(publish: boolean) {
    setMessage("");
    setLoading(true);
    const targetPublished = publish;
    try {
      const url = isEdit ? `/api/admin/problems/${initial.id}` : "/api/admin/problems";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          constraints,
          difficulty,
          points,
          time_limit: timeLimit,
          memory_limit: memoryLimit,
          is_published: targetPublished,
          testCases,
        }),
      });

      const data = (await res.json()) as { message?: string; error?: string; id?: number };
      if (!res.ok) {
        setToastKind("err");
        setMessage(data.error ?? "Failed to save");
        return;
      }

      const problemId = isEdit ? initial.id : data.id!;

      // Upload PDF if a new file was selected
      if (pdfFile) {
        try {
          const pdfUrl = await uploadPdf(problemId);
          setExistingPdfUrl(pdfUrl);
          setPdfFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
          setToastKind("err");
          setMessage(`Problem saved but PDF upload failed: ${err instanceof Error ? err.message : "unknown error"}`);
          return;
        }
      }

      setToastKind("ok");
      setMessage(
        targetPublished
          ? "Problem published to the menu ✓"
          : "Draft saved ✓",
      );

      if (!isEdit && data.id) {
        router.push(`/admin/problems/${data.id}/edit`);
      }
    } finally {
      setLoading(false);
    }
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "—";

  const hasPdf = !!(existingPdfUrl || pdfFile);

  const checks: [string, boolean][] = [
    ["Title entered", !!title.trim()],
    ["Statement ready", sourceMode === "pdf" ? hasPdf : description.length >= 200],
    ["At least 3 testcases", testCases.length >= 3],
    ["Sample case included", testCases.some((c) => c.is_sample)],
  ];

  const isBusy = loading || pdfUploading;

  return (
    <div style={{ padding: "40px 48px 80px", maxWidth: 1480, margin: "0 auto" }}>
      {/* ── Page header ── */}
      <div className="page-head">
        <div>
          <div className="page-sub">barista only · {isEdit ? "editing" : "admin / teacher"}</div>
          <h1 className="page-title">{isEdit ? initial.title : "Post a problem"}</h1>
          <p className="page-intro">
            {isEdit
              ? "Update the recipe and republish when changes are ready to serve."
              : "Add a new item to the menu. Write the statement, upload testcases, and publish when it's ready to serve."}
          </p>
        </div>
        <div className="row gap-2" style={{ alignItems: "center", flexShrink: 0 }}>
          <Link href="/admin/problems" className="btn btn-ghost">← All problems</Link>
          <button className="btn btn-ghost" type="button" onClick={() => handleSubmit(false)} disabled={isBusy}>
            {isBusy && !isPublished ? "Saving…" : "Save draft"}
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isBusy}
          >
            {isBusy ? "Saving…" : "Publish to menu →"}
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          marginBottom: 20, padding: "12px 18px",
          background: toastKind === "ok" ? "var(--sage-bg)" : "var(--clay-bg)",
          border: `1px solid ${toastKind === "ok" ? "#CFD9C7" : "#E3C4BE"}`,
          borderRadius: "var(--r)", fontSize: 13.5,
          color: toastKind === "ok" ? "#3A5A37" : "#8C4B42",
        }}>
          {message}
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28 }}>
        {/* ── Left column ── */}
        <div className="col gap-4">

          {/* Title card */}
          <div className="card" style={{ padding: 28 }}>
            <label className="field-label">Problem title</label>
            <input
              className="input"
              style={{ fontFamily: "var(--serif)", fontSize: 34, padding: "14px 16px", border: "none", background: "transparent", fontWeight: 400 }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Kraft Paper Graph"
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 8 }}>
              <div>
                <label className="field-label">Short code (auto)</label>
                <div className="input mono" style={{ background: "var(--bg-warm)", color: "var(--muted)", fontSize: 13, cursor: "default" }}>
                  {slug}
                </div>
              </div>
              <div>
                <label className="field-label">Difficulty</label>
                <select className="select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="field-label">Points</label>
                <input className="input mono" type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} min={1} />
              </div>
            </div>
          </div>

          {/* Statement card */}
          <div className="card" style={{ padding: 28 }}>
            <div className="row justify-between items-center" style={{ marginBottom: 14 }}>
              <div>
                <div className="kicker">the recipe</div>
                <div className="serif" style={{ fontSize: 22, marginTop: 2 }}>Problem statement</div>
              </div>
              <div className="row gap-2">
                <button type="button" className={`tweak-opt${sourceMode === "pdf" ? " active" : ""}`} onClick={() => setSourceMode("pdf")}>
                  PDF upload
                </button>
                <button type="button" className={`tweak-opt${sourceMode === "markdown" ? " active" : ""}`} onClick={() => setSourceMode("markdown")}>
                  Write inline
                </button>
              </div>
            </div>

            {sourceMode === "pdf" ? (
              <>
                {/* Show existing PDF preview if already uploaded */}
                {existingPdfUrl && !pdfFile && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 20px", marginBottom: 14,
                    background: "var(--sage-bg)", border: "1px solid #CFD9C7",
                    borderRadius: "var(--r-lg)",
                  }}>
                    <div style={{
                      width: 44, height: 56, background: "var(--surface)",
                      border: "1px solid var(--kraft-2)", borderRadius: 4,
                      display: "grid", placeItems: "center",
                      fontFamily: "var(--mono)", fontSize: 9, color: "var(--clay)", letterSpacing: "0.1em",
                      flexShrink: 0,
                    }}>PDF</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="serif" style={{ fontSize: 16, marginBottom: 3 }}>PDF uploaded</div>
                      <div className="mono muted" style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {existingPdfUrl}
                      </div>
                    </div>
                    <div className="row gap-2">
                      <a href={existingPdfUrl} target="_blank" rel="noopener noreferrer" className="tweak-opt" style={{ fontSize: 11, textDecoration: "none" }}>
                        view ↗
                      </a>
                      <button type="button" className="tweak-opt" style={{ fontSize: 11, color: "var(--clay)" }} onClick={removePdf}>
                        remove
                      </button>
                    </div>
                  </div>
                )}

                {/* Drop zone */}
                <label
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", gap: 12, padding: "48px 24px",
                    border: `1.5px dashed ${isDragging ? "var(--clay)" : pdfFile ? "var(--sage-dark)" : "var(--kraft-2)"}`,
                    borderRadius: "var(--r-lg)",
                    background: isDragging ? "var(--clay-bg)" : pdfFile ? "var(--sage-bg)" : "var(--bg-warm)",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    style={{ display: "none" }}
                    onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                  />
                  {!pdfFile ? (
                    <>
                      <IconUpload size={42} style={{ color: "var(--muted)" }} strokeWidth={1.3} />
                      <div className="serif" style={{ fontSize: 22, lineHeight: 1.2 }}>
                        {existingPdfUrl ? "Drop a new PDF to replace" : "Drop your problem PDF here"}
                      </div>
                      <div className="muted" style={{ fontSize: 13, textAlign: "center", maxWidth: 400 }}>
                        Students will see the PDF rendered inline on the problem page. Max 10 MB.
                      </div>
                      <span className="btn btn-ghost btn-sm" style={{ marginTop: 4 }}>Choose file</span>
                    </>
                  ) : (
                    <>
                      <div style={{
                        width: 56, height: 72, background: "var(--surface)",
                        border: "1px solid var(--kraft-2)", borderRadius: 4,
                        display: "grid", placeItems: "center",
                        fontFamily: "var(--mono)", fontSize: 10,
                        color: "var(--clay)", letterSpacing: "0.1em",
                        boxShadow: "var(--shadow-sm)",
                      }}>PDF</div>
                      <div className="serif" style={{ fontSize: 20 }}>{pdfFile.name}</div>
                      <div className="mono muted" style={{ fontSize: 11 }}>
                        ready to upload · {(pdfFile.size / 1024).toFixed(0)} KB
                      </div>
                      <button
                        type="button"
                        className="tweak-opt"
                        onClick={(e) => {
                          e.preventDefault();
                          setPdfFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        Clear
                      </button>
                    </>
                  )}
                </label>
                {pdfUploading && (
                  <div className="mono muted" style={{ fontSize: 12, marginTop: 10, textAlign: "center" }}>
                    Uploading PDF…
                  </div>
                )}
                <div className="row gap-3 mono muted" style={{ fontSize: 11, marginTop: 10 }}>
                  <span>PDF · recommended for most problems</span>
                  <span style={{ marginLeft: "auto" }}>Rendered inline · text selectable</span>
                </div>

                {/* Fallback description — optional when PDF is uploaded */}
                <div style={{ marginTop: 20 }}>
                  {!showFallbackDesc ? (
                    <button
                      type="button"
                      onClick={() => setShowFallbackDesc(true)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        fontFamily: "var(--mono)", fontSize: 11,
                        letterSpacing: "0.12em", textTransform: "uppercase",
                        color: "var(--muted)", background: "none", border: "none",
                        cursor: "pointer", padding: 0,
                      }}
                    >
                      <span style={{ fontSize: 14 }}>+</span> add fallback description (optional)
                    </button>
                  ) : (
                    <>
                      <div className="row items-center justify-between" style={{ marginBottom: 8 }}>
                        <label className="field-label" style={{ margin: 0 }}>
                          Fallback description
                          <span style={{ opacity: 0.55, textTransform: "none", letterSpacing: 0, fontFamily: "var(--sans)", fontSize: 12 }}>
                            {" "}— shown only when the PDF fails to load
                          </span>
                        </label>
                        <button
                          type="button"
                          className="tweak-opt"
                          style={{ fontSize: 11 }}
                          onClick={() => { setShowFallbackDesc(false); setDescription(""); }}
                        >
                          remove
                        </button>
                      </div>
                      <textarea
                        className="input mono"
                        style={{ minHeight: 100, resize: "vertical", fontSize: 13, lineHeight: 1.7 }}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief plain-text description shown as fallback if the PDF can't render."
                        autoFocus
                      />
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <textarea
                  className="input mono"
                  style={{ minHeight: 260, resize: "vertical", fontSize: 13, lineHeight: 1.7 }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={"# Problem\n\nDescribe the problem here. Markdown supported.\n\n## Input\n\n...\n\n## Output\n\n..."}
                />
                <div className="row gap-3 mono muted" style={{ fontSize: 11, marginTop: 10 }}>
                  <span>Markdown · supports images</span>
                  <span style={{ marginLeft: "auto" }}>{description.length} chars</span>
                </div>
                <div style={{ marginTop: 16 }}>
                  <label className="field-label">Constraints</label>
                  <textarea
                    className="input"
                    style={{ minHeight: 64, resize: "vertical", fontSize: 13 }}
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder="e.g. 1 ≤ N ≤ 10⁵"
                  />
                </div>
              </>
            )}
          </div>

          {/* Testcases card */}
          <div className="card" style={{ padding: 28 }}>
            <div className="row justify-between items-center" style={{ marginBottom: 14 }}>
              <div>
                <div className="kicker">the taste panel</div>
                <div className="serif" style={{ fontSize: 22, marginTop: 2 }}>Testcases</div>
              </div>
              <div className="row gap-2">
                <button
                  type="button"
                  className="btn btn-sage btn-sm"
                  onClick={() => setTestCases((cur) => [...cur, { input: "", expected_output: "", is_sample: false }])}
                >
                  + Add case
                </button>
              </div>
            </div>

            <div className="col gap-3">
              {testCases.map((tc, i) => (
                <div key={i} style={{ border: "1px solid var(--line)", borderRadius: "var(--r)", overflow: "hidden" }}>
                  {/* case header */}
                  <div style={{
                    padding: "8px 14px", background: "var(--bg-warm)",
                    display: "flex", alignItems: "center", gap: 10,
                    borderBottom: "1px solid var(--line-soft)",
                  }}>
                    <span className="mono" style={{ fontSize: 12 }}>case {String(i + 1).padStart(2, "0")}</span>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={tc.is_sample}
                        onChange={(e) => updateCase(i, { is_sample: e.target.checked })}
                        style={{ accentColor: "var(--clay)" }}
                      />
                      sample (shown to students)
                    </label>
                    {testCases.length > 1 && (
                      <button type="button" className="tweak-opt" style={{ fontSize: 11, marginLeft: "auto" }} onClick={() => removeCase(i)}>
                        remove
                      </button>
                    )}
                  </div>
                  {/* stdin / stdout */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    <textarea
                      className="mono"
                      value={tc.input}
                      onChange={(e) => updateCase(i, { input: e.target.value })}
                      style={{ border: "none", borderRight: "1px solid var(--line-soft)", padding: 14, fontSize: 12, minHeight: 100, resize: "vertical", background: "transparent", outline: "none", lineHeight: 1.6 }}
                      placeholder="stdin…"
                    />
                    <textarea
                      className="mono"
                      value={tc.expected_output}
                      onChange={(e) => updateCase(i, { expected_output: e.target.value })}
                      style={{ border: "none", padding: 14, fontSize: 12, minHeight: 100, resize: "vertical", background: "transparent", outline: "none", lineHeight: 1.6 }}
                      placeholder="expected stdout…"
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--bg-warm)", borderTop: "1px solid var(--line-soft)" }}>
                    <div className="mono muted" style={{ fontSize: 10, padding: "5px 14px", letterSpacing: "0.1em", textTransform: "uppercase" }}>stdin</div>
                    <div className="mono muted" style={{ fontSize: 10, padding: "5px 14px", letterSpacing: "0.1em", textTransform: "uppercase", borderLeft: "1px solid var(--line-soft)" }}>expected stdout</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="col gap-4">

          {/* Judging settings */}
          <div className="card" style={{ padding: 22 }}>
            <div className="kicker" style={{ marginBottom: 12 }}>judging settings</div>
            <div className="col gap-3">
              <div>
                <label className="field-label">Time limit (s)</label>
                <input className="input mono" type="number" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} min={1} />
              </div>
              <div>
                <label className="field-label">Memory limit (MB)</label>
                <input className="input mono" type="number" value={memoryLimit} onChange={(e) => setMemoryLimit(Number(e.target.value))} min={16} />
              </div>
              <div>
                <label className="field-label">Languages</label>
                <div className="row gap-2" style={{ flexWrap: "wrap", marginTop: 4 }}>
                  {["C++17", "Python", "Java", "Rust"].map((l) => (
                    <span key={l} className="tweak-opt active" style={{ cursor: "default", fontSize: 11 }}>{l}</span>
                  ))}
                </div>
              </div>
              <div>
                <label className="field-label">Visibility</label>
                <div className="row gap-2" style={{ marginTop: 4 }}>
                  <button type="button" className={`tweak-opt${!isPublished ? " active" : ""}`} onClick={() => setIsPublished(false)}>Draft</button>
                  <button type="button" className={`tweak-opt${isPublished ? " active" : ""}`} onClick={() => setIsPublished(true)}>Live</button>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="card-kraft" style={{ padding: 22 }}>
            <div className="kicker" style={{ marginBottom: 10 }}>checklist</div>
            {checks.map(([label, done]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 13 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: done ? "var(--sage-dark)" : "transparent",
                  border: done ? "none" : "1.5px dashed var(--muted-2)",
                  color: "white", display: "grid", placeItems: "center",
                  fontSize: 11, flexShrink: 0,
                }}>
                  {done && "✓"}
                </div>
                <span style={{ color: done ? "var(--ink)" : "var(--muted)" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="card" style={{ padding: 22 }}>
            <div className="kicker" style={{ marginBottom: 10 }}>quick actions</div>
            <div className="col gap-2">
              <button type="button" className="btn btn-primary" onClick={() => handleSubmit(true)} disabled={isBusy} style={{ width: "100%", justifyContent: "center" }}>
                {isBusy ? "Saving…" : "Publish to menu →"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => handleSubmit(false)} disabled={isBusy} style={{ width: "100%", justifyContent: "center" }}>
                Save draft
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="card" style={{ padding: 22 }}>
            <div className="kicker" style={{ marginBottom: 10 }}>danger zone</div>
            {isEdit ? (
              <button type="button" className="btn btn-ghost btn-sm" style={{ color: "var(--clay)", borderColor: "var(--clay-bg)" }}>
                Delete problem
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ color: "var(--clay)", borderColor: "var(--clay-bg)" }}
                onClick={() => {
                  setTitle(""); setDescription(""); setConstraints("");
                  setDifficulty("Medium"); setPoints(100);
                  setTimeLimit(2); setMemoryLimit(256);
                  setTestCases([{ input: "", expected_output: "", is_sample: true }]);
                  setPdfFile(null); setExistingPdfUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Discard draft
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
