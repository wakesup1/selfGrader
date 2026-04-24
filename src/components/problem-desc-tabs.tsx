"use client";

import { useState } from "react";
import { MarkdownContent } from "@/components/markdown-content";
import { DashboardSubmissions } from "@/components/dashboard-submissions";
import { IconUpload, IconExternalLink } from "@/components/icons";
import type { Problem, TestCase } from "@/lib/types";

export function ProblemDescTabs({
  problem,
  sampleCases,
  problemId,
}: {
  problem: Problem;
  sampleCases: TestCase[];
  problemId: number;
}) {
  const hasPdf = !!problem.pdf_url;
  const [tab, setTab] = useState<"problem" | "examples" | "submissions">("problem");
  const [expanded, setExpanded] = useState(false);

  // Proxy URL — same origin, bypasses cross-origin iframe restrictions
  const proxyPdfUrl = `/api/problems/${problem.id}/pdf`;

  const tabs: { id: typeof tab; label: string }[] = [
    { id: "problem",     label: "problem"        },
    { id: "examples",   label: "examples"       },
    { id: "submissions", label: "my submissions" },
  ];

  return (
    <div
      className="card paper"
      style={{
        padding: "28px 28px 28px",
        // When a PDF is present and expanded, stretch to fill viewport height
        minHeight: hasPdf && tab === "problem" ? (expanded ? "calc(100vh - 180px)" : "70vh") : "60vh",
        display: "flex",
        flexDirection: "column",
        transition: "min-height 0.3s ease",
      }}
    >
      {/* ── Tab bar ── */}
      <div className="row gap-2 items-center" style={{ marginBottom: 20, flexShrink: 0 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`tweak-opt ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}

        {hasPdf && tab === "problem" && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <button
              className="tweak-opt"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "↙ collapse" : "↗ expand"}
            </button>
            <a
              href={proxyPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tweak-opt"
              style={{ textDecoration: "none" }}
            >
              ↓ open PDF
            </a>
          </div>
        )}
      </div>

      {/* ── Problem tab ── */}
      {tab === "problem" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {hasPdf ? (
            <PdfViewer
              proxyUrl={proxyPdfUrl}
              directUrl={problem.pdf_url!}
              expanded={expanded}
            />
          ) : problem.description ? (
            <MarkdownContent content={problem.description} />
          ) : (
            <div style={{ color: "var(--muted)", fontStyle: "italic", fontSize: 14 }}>
              No description provided.
            </div>
          )}

          {!hasPdf && (
            <>
              {problem.constraints && (
                <div style={{ marginTop: 24 }}>
                  <h3 className="serif" style={{ fontSize: 20, margin: "0 0 8px" }}>Constraints</h3>
                  <div className="mono" style={{
                    fontSize: 13, color: "var(--ink-soft)", background: "var(--bg-warm)",
                    padding: "12px 16px", borderRadius: 8, lineHeight: 1.7,
                  }}>
                    {problem.constraints}
                  </div>
                </div>
              )}
              <div style={{ marginTop: 24 }}>
                <div className="row gap-6 mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                  <div><span className="muted">Time limit </span>{problem.time_limit}s</div>
                  <div><span className="muted">Memory </span>{problem.memory_limit} MB</div>
                  <div><span className="muted">Points </span>{problem.points}</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Examples tab ── */}
      {tab === "examples" && (
        <>
          <h3 className="serif" style={{ fontSize: 24, margin: "0 0 16px" }}>Examples</h3>
          {sampleCases.length === 0 ? (
            <div style={{ color: "var(--muted)", fontSize: 14 }}>No sample cases for this problem.</div>
          ) : (
            sampleCases.map((tc, i) => (
              <div key={tc.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <div className="kicker" style={{ marginBottom: 6 }}>input #{i + 1}</div>
                  <pre className="mono" style={{
                    margin: 0, padding: 14, background: "var(--bg-warm)",
                    borderRadius: 8, fontSize: 13, whiteSpace: "pre-wrap",
                  }}>{tc.input || "(empty)"}</pre>
                </div>
                <div>
                  <div className="kicker" style={{ marginBottom: 6 }}>output</div>
                  <pre className="mono" style={{
                    margin: 0, padding: 14, background: "var(--bg-warm)",
                    borderRadius: 8, fontSize: 13, color: "var(--clay)",
                    whiteSpace: "pre-wrap",
                  }}>{tc.expected_output}</pre>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* ── My submissions tab ── */}
      {tab === "submissions" && (
        <div>
          <h3 className="serif" style={{ fontSize: 24, margin: "0 0 16px" }}>My Submissions</h3>
          <DashboardSubmissions problemId={problemId} />
        </div>
      )}
    </div>
  );
}

// ── PDF Viewer ────────────────────────────────────────────────────────────────

function PdfViewer({
  proxyUrl,
  directUrl,
  expanded,
}: {
  proxyUrl: string;
  directUrl: string;
  expanded: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const frameHeight = expanded ? "calc(100vh - 280px)" : "60vh";

  if (failed) {
    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 16, padding: "48px 24px",
        border: "1.5px dashed var(--kraft-2)", borderRadius: "var(--r-lg)",
        background: "var(--bg-warm)",
      }}>
        <IconUpload size={36} style={{ color: "var(--muted)" }} strokeWidth={1.3} />
        <div className="serif" style={{ fontSize: 18, color: "var(--ink-soft)" }}>
          PDF couldn&apos;t render inline
        </div>
        <a
          href={directUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm"
          style={{ textDecoration: "none" }}
        >
          Open PDF in new tab ↗
        </a>
        <button
          className="tweak-opt"
          style={{ fontSize: 11 }}
          onClick={() => setFailed(false)}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      borderRadius: "var(--r-lg)", overflow: "hidden",
      border: "1px solid var(--line)",
    }}>
      {/* toolbar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 14px", background: "var(--surface)",
        borderBottom: "1px solid var(--line-soft)", flexShrink: 0,
      }}>
        <div className="row gap-2 items-center">
          <div style={{
            width: 28, height: 36, background: "var(--bg-warm)",
            border: "1px solid var(--kraft-2)", borderRadius: 3,
            display: "grid", placeItems: "center",
            fontFamily: "var(--mono)", fontSize: 7, color: "var(--clay)",
            letterSpacing: "0.08em", flexShrink: 0,
          }}>PDF</div>
          <div>
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>problem statement</div>
            <div className="mono muted" style={{ fontSize: 10 }}>Ctrl + scroll to zoom</div>
          </div>
        </div>
        <a
          href={directUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="tweak-opt"
          style={{ fontSize: 11, textDecoration: "none" }}
        >
          new tab ↗
        </a>
      </div>

      {/* iframe — proxied through same origin to avoid cross-origin block */}
      <iframe
        key={proxyUrl}
        src={proxyUrl}
        style={{
          width: "100%",
          height: frameHeight,
          border: "none",
          display: "block",
          background: "#525659",
          flex: 1,
        }}
        title="Problem statement"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
