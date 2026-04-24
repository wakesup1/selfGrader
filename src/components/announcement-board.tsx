"use client";

import { useState, useRef } from "react";
import { RelativeTime } from "@/components/relative-time";

export type Announcement = {
  id: number;
  tag: string;
  title: string;
  body: string;
  pinned: boolean;
  is_published: boolean;
  updated_at: string;
};

const PRESET_TAGS = ["Quiz", "Data", "Hint", "Info", "Alert", "Event"];

// ── helpers ──────────────────────────────────────────────────────────────────

function tagChip(tag: string, pinned: boolean) {
  const accent = pinned ? "chip-amber" : tag === "Alert" ? "chip-clay" : "";
  return (
    <span className={`chip ${accent}`}>
      {pinned && <span style={{ marginRight: 4 }}>⚑</span>}
      {tag}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AnnouncementBoard({
  initial,
  isAdmin,
}: {
  initial: Announcement[];
  isAdmin: boolean;
}) {
  const [items, setItems] = useState<Announcement[]>(initial);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ── CRUD helpers ────────────────────────────────────────────────────────────

  async function save(id: number | "new", patch: Partial<Announcement>) {
    setSaving(true);
    setError("");
    try {
      if (id === "new") {
        const res = await fetch("/api/admin/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
        const created: Announcement = await res.json();
        setItems((prev) => [created, ...prev]);
      } else {
        const res = await fetch(`/api/admin/announcements/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
        const updated: Announcement = await res.json();
        setItems((prev) => prev.map((a) => (a.id === id ? updated : a)));
      }
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this announcement?")) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setItems((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  async function togglePin(item: Announcement) {
    await save(item.id, { pinned: !item.pinned });
  }

  async function togglePublish(item: Announcement) {
    await save(item.id, { is_published: !item.is_published });
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  // Sort: pinned first, then by updated_at desc
  const sorted = [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return (
    <div>
      {/* Chalkboard header */}
      <div className="row items-center justify-between" style={{ marginBottom: 14 }}>
        <div>
          <div className="kicker">the chalkboard</div>
          <div className="serif" style={{ fontSize: 22, marginTop: 2 }}>Announcements</div>
        </div>
        {isAdmin && editingId !== "new" && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setEditingId("new")}
            disabled={saving}
          >
            + New
          </button>
        )}
      </div>

      {error && (
        <div style={{
          marginBottom: 12, padding: "10px 14px",
          background: "var(--clay-bg)", border: "1px solid #E3C4BE",
          borderRadius: "var(--r)", fontSize: 13, color: "#8C4B42",
        }}>
          {error}
        </div>
      )}

      {/* New announcement form */}
      {isAdmin && editingId === "new" && (
        <AnnouncementForm
          initial={null}
          saving={saving}
          onSave={(patch) => save("new", patch)}
          onCancel={() => setEditingId(null)}
        />
      )}

      {/* Announcement list */}
      {sorted.length === 0 && editingId !== "new" && (
        <div style={{
          padding: "28px 20px", textAlign: "center",
          fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)",
          border: "1px dashed var(--kraft-2)", borderRadius: "var(--r-lg)",
        }}>
          {isAdmin ? "No announcements yet. Click + New to add one." : "No announcements yet."}
        </div>
      )}

      {sorted.map((a) =>
        isAdmin && editingId === a.id ? (
          <AnnouncementForm
            key={a.id}
            initial={a}
            saving={saving}
            onSave={(patch) => save(a.id, patch)}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <AnnouncementCard
            key={a.id}
            item={a}
            isAdmin={isAdmin}
            saving={saving}
            onEdit={() => setEditingId(a.id)}
            onDelete={() => remove(a.id)}
            onTogglePin={() => togglePin(a)}
            onTogglePublish={() => togglePublish(a)}
          />
        )
      )}

      {/* Barista's picks card */}
      <div className="card-kraft" style={{ padding: 22, marginTop: 20 }}>
        <div className="kicker" style={{ marginBottom: 10 }}>barista&apos;s picks</div>
        <div className="serif" style={{ fontSize: 20, lineHeight: 1.2, marginBottom: 6 }}>
          Try the first problem
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
          A great warm-up for beginners. A great first pour.
        </div>
      </div>
    </div>
  );
}

// ── Read-only card ────────────────────────────────────────────────────────────

function AnnouncementCard({
  item, isAdmin, saving,
  onEdit, onDelete, onTogglePin, onTogglePublish,
}: {
  item: Announcement;
  isAdmin: boolean;
  saving: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onTogglePublish: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="announcement"
      style={{
        marginBottom: 10,
        opacity: item.is_published ? 1 : 0.55,
        position: "relative",
        transition: "opacity 0.2s",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Tag + timestamp row */}
      <div className="row items-center justify-between" style={{ marginBottom: 8 }}>
        {tagChip(item.tag, item.pinned)}
        <div className="row items-center gap-2">
          {!item.is_published && (
            <span style={{
              fontFamily: "var(--mono)", fontSize: 9.5, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "var(--muted)", padding: "2px 7px",
              border: "1px solid var(--line)", borderRadius: 999,
            }}>
              draft
            </span>
          )}
          <span className="mono muted" style={{ fontSize: 10.5 }}>
            <RelativeTime date={item.updated_at} />
          </span>
        </div>
      </div>

      <div className="serif" style={{ fontSize: 19, lineHeight: 1.25, marginBottom: 6 }}>
        {item.title}
      </div>
      <div style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.55 }}>
        {item.body}
      </div>

      {/* Admin action bar — visible on hover */}
      {isAdmin && (
        <div style={{
          position: "absolute", top: 10, right: 12,
          display: "flex", gap: 6,
          opacity: hover ? 1 : 0,
          transition: "opacity 0.15s",
          pointerEvents: hover ? "auto" : "none",
        }}>
          <button
            className="tweak-opt"
            style={{ fontSize: 11, padding: "4px 10px" }}
            onClick={onTogglePin}
            disabled={saving}
            title={item.pinned ? "Unpin" : "Pin to top"}
          >
            {item.pinned ? "unpin" : "⚑ pin"}
          </button>
          <button
            className="tweak-opt"
            style={{ fontSize: 11, padding: "4px 10px" }}
            onClick={onTogglePublish}
            disabled={saving}
            title={item.is_published ? "Hide (draft)" : "Publish"}
          >
            {item.is_published ? "hide" : "publish"}
          </button>
          <button
            className="tweak-opt"
            style={{ fontSize: 11, padding: "4px 10px" }}
            onClick={onEdit}
            disabled={saving}
          >
            edit
          </button>
          <button
            className="tweak-opt"
            style={{ fontSize: 11, padding: "4px 10px", color: "var(--clay)" }}
            onClick={onDelete}
            disabled={saving}
          >
            delete
          </button>
        </div>
      )}
    </div>
  );
}

// ── Inline edit / create form ─────────────────────────────────────────────────

type FormState = {
  tag: string;
  title: string;
  body: string;
  pinned: boolean;
  is_published: boolean;
};

function AnnouncementForm({
  initial,
  saving,
  onSave,
  onCancel,
}: {
  initial: Announcement | null;
  saving: boolean;
  onSave: (patch: Partial<Announcement>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>({
    tag:          initial?.tag          ?? "Info",
    title:        initial?.title        ?? "",
    body:         initial?.body         ?? "",
    pinned:       initial?.pinned       ?? false,
    is_published: initial?.is_published ?? true,
  });
  const titleRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <div
      className="card"
      style={{
        padding: 20, marginBottom: 10,
        border: "1.5px solid var(--clay-bg)",
        boxShadow: "0 0 0 3px var(--clay-bg)",
      }}
    >
      <div className="kicker" style={{ marginBottom: 14 }}>
        {initial ? "editing announcement" : "new announcement"}
      </div>

      {/* Tag selector */}
      <div style={{ marginBottom: 12 }}>
        <label className="field-label">Tag</label>
        <div className="row gap-2" style={{ flexWrap: "wrap" }}>
          {PRESET_TAGS.map((t) => (
            <button
              key={t}
              type="button"
              className={`tweak-opt${form.tag === t ? " active" : ""}`}
              style={{ fontSize: 12 }}
              onClick={() => set("tag", t)}
            >
              {t}
            </button>
          ))}
          {/* custom tag */}
          {!PRESET_TAGS.includes(form.tag) && (
            <button type="button" className="tweak-opt active" style={{ fontSize: 12 }}>
              {form.tag}
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 12 }}>
        <label className="field-label">Title</label>
        <input
          ref={titleRef}
          className="input"
          style={{ fontFamily: "var(--serif)", fontSize: 18 }}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Announcement title…"
          autoFocus
        />
      </div>

      {/* Body */}
      <div style={{ marginBottom: 14 }}>
        <label className="field-label">Body</label>
        <textarea
          className="input"
          style={{ minHeight: 80, resize: "vertical", fontSize: 13.5, lineHeight: 1.6 }}
          value={form.body}
          onChange={(e) => set("body", e.target.value)}
          placeholder="Details, hints, or notes…"
        />
      </div>

      {/* Options row */}
      <div className="row gap-4 items-center" style={{ marginBottom: 16 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={form.pinned}
            onChange={(e) => set("pinned", e.target.checked)}
            style={{ accentColor: "var(--amber-dark)", width: 14, height: 14 }}
          />
          Pin to top
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => set("is_published", e.target.checked)}
            style={{ accentColor: "var(--clay)", width: 14, height: 14 }}
          />
          Published (visible to students)
        </label>
      </div>

      {/* Footer actions */}
      <div className="row gap-2">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => onSave(form)}
          disabled={saving || !form.title.trim()}
        >
          {saving ? "Saving…" : initial ? "Save changes" : "Post announcement"}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
