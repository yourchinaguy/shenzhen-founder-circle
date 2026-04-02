"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface IntroRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  category: string;
  industry: string | null;
  description: string;
  urgency: string;
  status: string;
  notes: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: "#e85d3a",
  reviewing: "#c4960a",
  need_more_info: "#6366f1",
  intro_made: "#3d7a4a",
  closed: "#8a8a8a",
  discarded: "#c44536",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  reviewing: "Reviewing",
  need_more_info: "Need More Info",
  intro_made: "Intro Made",
  closed: "Closed",
  discarded: "Discarded",
};

const URGENCY_ORDER: Record<string, number> = {
  this_week: 0,
  this_month: 1,
  exploring: 2,
};

const URGENCY_LABELS: Record<string, string> = {
  this_week: "This week",
  this_month: "This month",
  exploring: "Exploring",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const DISPLAY_NAMES: Record<string, string> = {
  factory: "Factory",
  supplier: "Supplier",
  factory_supplier: "Factory / Supplier",
  local_hire: "Local Hire",
  local_expert: "Local Expert",
  investor: "Investor",
  government: "Government",
  government_regulatory: "Government",
  other: "Other",
  robotics: "Robotics",
  ai: "AI",
  physical_ai: "Physical AI",
  hardware: "Hardware",
  logistics: "Logistics",
  ecommerce: "E-commerce",
  iot: "IoT",
  ev: "EV",
  automotive: "EV",
  semiconductors: "Semiconductors",
  manufacturing: "Manufacturing",
  electronics: "Electronics",
  consumer_electronics: "Electronics",
  medtech: "MedTech",
  cleantech: "CleanTech",
};

function formatLabel(value: string): string {
  return DISPLAY_NAMES[value] ?? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function NotesField({ requestId, initialNotes, onSave }: {
  requestId: string;
  initialNotes: string;
  onSave: (notes: string) => void;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(true);

  function handleSave() {
    onSave(notes);
    setSaved(true);
    setTimeout(() => setSaved(true), 2000);
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
          Internal Notes
        </label>
        {!saved && (
          <button
            onClick={handleSave}
            style={{
              padding: "4px 12px", borderRadius: 4, border: "none",
              background: "var(--primary)", color: "#fff", fontSize: 11,
              fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
            }}
          >
            Save
          </button>
        )}
        {saved && notes !== initialNotes && (
          <span style={{ fontSize: 11, color: "var(--success)" }}>Saved</span>
        )}
      </div>
      <textarea
        value={notes}
        onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
        onBlur={handleSave}
        placeholder="Add notes about this request..."
        rows={3}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 8,
          border: `1px solid ${!saved ? "var(--accent)" : "var(--border)"}`, fontSize: 16,
          fontFamily: "inherit", resize: "vertical", outline: "none",
          background: "var(--white)",
        }}
      />
    </div>
  );
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [requests, setRequests] = useState<IntroRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"active" | "intro_made" | "discarded">("active");
  const [activeSubFilter, setActiveSubFilter] = useState<"all" | "new" | "need_more_info">("all");

  // Intro modal
  const [introFor, setIntroFor] = useState<string | null>(null);
  const [expertName, setExpertName] = useState("");
  const [expertEmail, setExpertEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ email: data.user.email ?? "" });
      } else {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  async function fetchRequests() {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) { setLoading(false); return; }

    try {
      const res = await fetch("/api/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRequests(data.requests);
    } catch {
      setError("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }

  async function updateRequest(id: string, updates: { status?: string; notes?: string }) {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) return;

    await fetch("/api/requests", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, ...updates }),
    });

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }

  async function handleSignIn() {
    if (!loginEmail.trim()) return;
    setAuthLoading(true);
    setAuthMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: loginEmail.trim(),
        options: { emailRedirectTo: window.location.origin + "/admin" },
      });
      if (error) {
        console.error("Supabase auth error:", error);
        setAuthMessage(`Error: ${error.message}`);
      } else {
        setAuthMessage("Check your email for the magic link!");
      }
    } catch (err) {
      console.error("Sign-in exception:", err);
      setAuthMessage("Something went wrong. Check the console.");
    } finally {
      setAuthLoading(false);
    }
  }

  function buildMoreInfoMailto(req: IntroRequest): string {
    const subject = encodeURIComponent(`[Shenzhen Founder Circle] Following up on your request`);
    const body = encodeURIComponent(
      `Hi ${req.name},\n\n` +
      `Thanks for reaching out to Shenzhen Founder Circle. I'd love to help you with your request for ${formatLabel(req.category).toLowerCase()}.\n\n` +
      `To make the best possible match, I'd like to understand a bit more:\n\n` +
      `- What's your timeline for this?\n` +
      `- Have you been to Shenzhen before?\n` +
      `- Any specific requirements or constraints I should know about?\n\n` +
      `Would you be open to a quick 15-minute call this week? Happy to jump on Zoom or WhatsApp.\n\n` +
      `Best,\nJan`
    );
    return `mailto:${req.email}?subject=${subject}&body=${body}`;
  }

  function buildIntroMailto(req: IntroRequest): string {
    const subject = encodeURIComponent(`[SFC] Intro: ${req.name} ↔ ${expertName}`);
    const body = encodeURIComponent(
      `Hi ${req.name} and ${expertName},\n\n` +
      `I'd like to introduce you two.\n\n` +
      `${req.name} (${req.company}) is looking for: ${formatLabel(req.category)}\n` +
      `Context: "${req.description}"\n\n` +
      `${expertName}, I think you'd be a great match for this. Happy to let you two take it from here.\n\n` +
      `Best,\nJan`
    );
    return `mailto:${expertEmail}?cc=${encodeURIComponent(req.email)}&subject=${subject}&body=${body}`;
  }

  const STATUS_SORT: Record<string, number> = {
    new: 0,
    need_more_info: 1,
    reviewing: 2,
  };

  // Sort by status (new first, then need_more_info), then urgency, then date
  const sortedRequests = [...requests].sort((a, b) => {
    const statusA = STATUS_SORT[a.status] ?? 3;
    const statusB = STATUS_SORT[b.status] ?? 3;
    if (statusA !== statusB) return statusA - statusB;
    const urgA = URGENCY_ORDER[a.urgency] ?? 3;
    const urgB = URGENCY_ORDER[b.urgency] ?? 3;
    if (urgA !== urgB) return urgA - urgB;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const filteredRequests = sortedRequests.filter((r) => {
    if (filter === "active") {
      const isActive = ["new", "need_more_info", "reviewing"].includes(r.status);
      if (!isActive) return false;
      if (activeSubFilter === "all") return true;
      return r.status === activeSubFilter;
    }
    if (filter === "intro_made") return ["intro_made", "closed"].includes(r.status);
    return r.status === "discarded";
  });

  const activeCount = requests.filter((r) => ["new", "need_more_info", "reviewing"].includes(r.status)).length;
  const newCount = requests.filter((r) => r.status === "new").length;

  // Sign-in screen
  if (!user) {
    return (
      <div style={{ paddingTop: 80, maxWidth: 400, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>Admin Sign In</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>
          Magic link, no password needed.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
            placeholder="your@email.com"
            style={{
              flex: 1, padding: "12px 16px", borderRadius: 8,
              border: "1px solid var(--border)", fontSize: 16, outline: "none",
            }}
          />
          <button
            onClick={handleSignIn}
            disabled={authLoading}
            style={{
              padding: "12px 20px", borderRadius: 8, border: "none",
              background: "var(--accent)", color: "#fff", fontSize: 14,
              fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
              opacity: authLoading ? 0.5 : 1,
            }}
          >
            {authLoading ? "..." : "Send link"}
          </button>
        </div>
        {authMessage && (
          <p style={{
            fontSize: 13, marginTop: 16,
            color: authMessage.includes("Check") ? "var(--success)" : "var(--error)",
          }}>
            {authMessage}
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 32, paddingBottom: 64 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20 }}>Intro Requests</h2>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>
          {newCount} new · {activeCount} active
        </span>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {([
          { key: "active" as const, label: `Active (${activeCount})` },
          { key: "intro_made" as const, label: `Intro Made (${requests.filter(r => ["intro_made", "closed"].includes(r.status)).length})` },
          { key: "discarded" as const, label: `Discarded (${requests.filter(r => r.status === "discarded").length})` },
        ]).map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); if (f.key !== "active") setActiveSubFilter("all"); }}
            style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 500,
              fontFamily: "inherit", cursor: "pointer",
              border: `1px solid ${filter === f.key ? "var(--accent)" : "var(--border)"}`,
              background: filter === f.key ? "rgba(232,93,58,0.08)" : "var(--white)",
              color: filter === f.key ? "var(--accent)" : "var(--muted)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sub-filter for Active */}
      {filter === "active" && activeCount > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {([
            { key: "all" as const, label: "All" },
            { key: "new" as const, label: `New (${newCount})` },
            { key: "need_more_info" as const, label: `Need Info (${requests.filter(r => r.status === "need_more_info").length})` },
          ]).map((sf) => (
            <button
              key={sf.key}
              onClick={() => setActiveSubFilter(sf.key)}
              style={{
                padding: "4px 10px", borderRadius: 4, fontSize: 12, fontWeight: 500,
                fontFamily: "inherit", cursor: "pointer",
                border: "none",
                background: activeSubFilter === sf.key ? "var(--primary)" : "var(--card)",
                color: activeSubFilter === sf.key ? "#fff" : "var(--muted)",
              }}
            >
              {sf.label}
            </button>
          ))}
        </div>
      )}

      {loading && <p style={{ color: "var(--muted)" }}>Loading...</p>}
      {error && <p style={{ color: "var(--error)" }}>{error}</p>}

      {filteredRequests.map((req) => (
        <div
          key={req.id}
          style={{
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
            background: "var(--white)",
            borderLeft: `4px solid ${STATUS_COLORS[req.status] ?? "var(--border)"}`,
            opacity: req.status === "discarded" ? 0.5 : 1,
          }}
        >
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {req.name}
                <span style={{ fontWeight: 400, color: "var(--muted)", marginLeft: 8 }}>
                  {req.company}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                {formatDate(req.created_at)} · {formatLabel(req.category)}
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                <span style={{
                  display: "inline-block", padding: "2px 8px", borderRadius: 4,
                  fontSize: 11, fontWeight: 600,
                  background: req.urgency === "this_week" ? "rgba(232,93,58,0.1)" : req.urgency === "this_month" ? "rgba(196,150,10,0.1)" : "var(--card)",
                  color: req.urgency === "this_week" ? "var(--accent)" : req.urgency === "this_month" ? "#c4960a" : "var(--muted)",
                }}>
                  {URGENCY_LABELS[req.urgency] ?? req.urgency}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                color: STATUS_COLORS[req.status], background: `${STATUS_COLORS[req.status]}15`,
              }}>
                {STATUS_LABELS[req.status]}
              </span>
            </div>
          </div>

          {/* Contact info + links */}
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span>{req.email}</span>
            {req.linkedin_url && (
              <a href={req.linkedin_url} target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--accent)", textDecoration: "none" }}>
                LinkedIn →
              </a>
            )}
            {req.twitter_url && (
              <a href={req.twitter_url} target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--accent)", textDecoration: "none" }}>
                X →
              </a>
            )}
            {req.website_url && (
              <a href={req.website_url} target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--accent)", textDecoration: "none" }}>
                Website →
              </a>
            )}
            {req.industry && (
              <span style={{
                padding: "1px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500,
                background: "var(--card)", color: "var(--text)",
              }}>
                {formatLabel(req.industry)}
              </span>
            )}
          </div>

          {/* Description */}
          <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16, background: "var(--surface)", padding: "12px 16px", borderRadius: 8 }}>
            {req.description}
          </p>

          {/* Notes */}
          <NotesField
            requestId={req.id}
            initialNotes={req.notes ?? ""}
            onSave={(notes) => updateRequest(req.id, { notes })}
          />

          {/* Actions */}
          {req.status !== "discarded" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {["new", "reviewing", "need_more_info"].includes(req.status) && (
                <a
                  href={buildMoreInfoMailto(req)}
                  onClick={() => updateRequest(req.id, { status: "need_more_info" })}
                  style={{
                    display: "inline-flex", alignItems: "center",
                    padding: "8px 16px", borderRadius: 6, border: "1px solid #6366f1",
                    background: "var(--white)", fontSize: 13, fontWeight: 500,
                    textDecoration: "none", color: "#6366f1", cursor: "pointer",
                  }}
                >
                  Request More Info
                </a>
              )}

              {["new", "reviewing", "need_more_info"].includes(req.status) && (
                <button
                  onClick={() => setIntroFor(introFor === req.id ? null : req.id)}
                  style={{
                    padding: "8px 16px", borderRadius: 6, border: "none",
                    background: "var(--primary)", color: "#fff", fontSize: 13,
                    fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                  }}
                >
                  Send Intro
                </button>
              )}

              {req.status === "intro_made" && (
                <button
                  onClick={() => updateRequest(req.id, { status: "closed" })}
                  style={{
                    padding: "8px 16px", borderRadius: 6, border: "1px solid var(--border)",
                    background: "var(--white)", fontSize: 13, fontWeight: 500,
                    fontFamily: "inherit", cursor: "pointer", color: "var(--muted)",
                  }}
                >
                  Mark Closed
                </button>
              )}

              <button
                onClick={() => updateRequest(req.id, { status: "discarded" })}
                style={{
                  padding: "8px 16px", borderRadius: 6, border: "1px solid var(--border)",
                  background: "var(--white)", fontSize: 13, fontWeight: 500,
                  fontFamily: "inherit", cursor: "pointer", color: "var(--error)",
                }}
              >
                Discard
              </button>
            </div>
          )}

          {/* Intro form */}
          {introFor === req.id && (
            <div style={{
              marginTop: 12, padding: 16, borderRadius: 8,
              background: "var(--surface)", border: "1px solid var(--border)",
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Who are you introducing them to?</p>
              <div style={{ display: "grid", gap: 8, marginBottom: 8 }}>
                <input
                  type="text" value={expertName}
                  onChange={(e) => setExpertName(e.target.value)}
                  placeholder="Expert name"
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 6,
                    border: "1px solid var(--border)", fontSize: 16, outline: "none",
                  }}
                />
                <input
                  type="email" value={expertEmail}
                  onChange={(e) => setExpertEmail(e.target.value)}
                  placeholder="Expert email"
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 6,
                    border: "1px solid var(--border)", fontSize: 16, outline: "none",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a
                  href={buildIntroMailto(req)}
                  style={{
                    display: "inline-block", padding: "8px 16px", borderRadius: 6,
                    background: "var(--accent)", color: "#fff", fontSize: 13,
                    fontWeight: 600, textDecoration: "none",
                  }}
                >
                  Open in Gmail
                </a>
                <button
                  onClick={() => {
                    updateRequest(req.id, { status: "intro_made" });
                    setIntroFor(null);
                    setExpertName("");
                    setExpertEmail("");
                  }}
                  style={{
                    padding: "8px 16px", borderRadius: 6, border: "none",
                    background: "var(--success)", color: "#fff", fontSize: 13,
                    fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
                  }}
                >
                  Intro Made ✓
                </button>
                <button
                  onClick={() => { setIntroFor(null); setExpertName(""); setExpertEmail(""); }}
                  style={{
                    padding: "8px 16px", borderRadius: 6, border: "1px solid var(--border)",
                    background: "none", fontSize: 13, fontFamily: "inherit", cursor: "pointer",
                    color: "var(--muted)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {!loading && filteredRequests.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--muted)" }}>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "var(--text)" }}>
            {filter === "active" ? "No active requests" : filter === "intro_made" ? "No intros made yet" : "No discarded requests"}
          </p>
          {filter === "active" && (
            <p style={{ fontSize: 14 }}>Share the landing page link to start receiving intro requests.</p>
          )}
        </div>
      )}
    </div>
  );
}
