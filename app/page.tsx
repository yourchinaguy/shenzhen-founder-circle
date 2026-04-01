"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { value: "factory", label: "Factory" },
  { value: "supplier", label: "Supplier" },
  { value: "local_hire", label: "Local Hire" },
  { value: "local_expert", label: "Local Expert" },
  { value: "investor", label: "Investor" },
  { value: "government", label: "Government" },
  { value: "other", label: "Other" },
];

const INDUSTRIES = [
  { value: "robotics", label: "Robotics" },
  { value: "ai", label: "AI" },
  { value: "physical_ai", label: "Physical AI" },
  { value: "hardware", label: "Hardware" },
  { value: "logistics", label: "Logistics" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "iot", label: "IoT" },
  { value: "ev", label: "EV" },
  { value: "semiconductors", label: "Semiconductors" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "electronics", label: "Electronics" },
  { value: "medtech", label: "MedTech" },
  { value: "cleantech", label: "CleanTech" },
  { value: "other", label: "Other" },
];

export default function LandingPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [linkedin, setLinkedin] = useState("https://");
  const [twitter, setTwitter] = useState("https://");
  const [website, setWebsite] = useState("https://");
  const [category, setCategory] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("this_month");

  function cleanUrl(url: string): string | null {
    const trimmed = url.trim();
    if (trimmed === "https://" || trimmed === "http://" || trimmed === "") return null;
    return trimmed;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !company.trim() || !category || !description.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    const linkedinClean = cleanUrl(linkedin);
    const twitterClean = cleanUrl(twitter);
    const websiteClean = cleanUrl(website);

    if (!linkedinClean && !twitterClean && !websiteClean) {
      setError("Please provide at least one profile link (LinkedIn, X, or website).");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          linkedin_url: linkedinClean,
          twitter_url: twitterClean,
          website_url: websiteClean,
          category,
          industry,
          description: description.trim(),
          urgency,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong. Try again.");
        setSubmitting(false);
        return;
      }

      router.push("/thank-you");
    } catch {
      setError("Network error. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    fontSize: 16,
    fontFamily: "inherit",
    background: "var(--white)",
    color: "var(--text)",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
    color: "var(--text)",
  };

  const hintStyle: React.CSSProperties = {
    fontSize: 11,
    color: "var(--muted)",
    marginTop: 4,
  };

  return (
    <div style={{ paddingTop: 48, paddingBottom: 64 }}>
      {/* Hero */}
      <section style={{ textAlign: "center", marginBottom: 48 }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>
          Get the right intro in Shenzhen.
          <br />
          Within 48 hours.
        </h2>
        <p style={{ fontSize: 16, color: "var(--muted)", maxWidth: 520, margin: "0 auto", marginBottom: 24 }}>
          We connect founders and operators with the right people in Shenzhen's
          hardware and robotics ecosystem. Curated intros, no noise.
        </p>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
          Trusted by leaders at BBG, Forbes, DJI, and the Singapore Chamber of Commerce
        </p>
      </section>

      {/* Request Form */}
      <section style={{
        background: "var(--white)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 32,
        animation: "fadeIn 200ms ease-out",
      }}>
        <h3 style={{ fontSize: 20, marginBottom: 4 }}>Request an Intro</h3>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>
          Tell us what you need. We'll match you with the right person.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Company *</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your company"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={inputStyle}
              />
            </div>

            {/* Profile links - at least one required */}
            <div>
              <label style={labelStyle}>Profile links (at least one required) *</label>
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>LinkedIn</div>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    style={inputStyle}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>X (Twitter)</div>
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://x.com/..."
                    style={inputStyle}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Website</div>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourcompany.com"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>What do you need? *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">-</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">-</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i.value} value={i.value}>{i.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Tell us more *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you looking for? Be specific — the more context, the better the match."
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div>
              <label style={labelStyle}>How urgent is this?</label>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { value: "this_week", label: "This week" },
                  { value: "this_month", label: "This month" },
                  { value: "exploring", label: "Just exploring" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 14,
                      cursor: "pointer",
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: `1px solid ${urgency === opt.value ? "var(--accent)" : "var(--border)"}`,
                      background: urgency === opt.value ? "rgba(232,93,58,0.08)" : "var(--white)",
                      color: urgency === opt.value ? "var(--accent)" : "var(--muted)",
                      fontWeight: urgency === opt.value ? 600 : 400,
                    }}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={opt.value}
                      checked={urgency === opt.value}
                      onChange={(e) => setUrgency(e.target.value)}
                      style={{ display: "none" }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div style={{
                padding: "12px 16px",
                background: "rgba(196,69,54,0.1)",
                color: "var(--error)",
                borderRadius: 8,
                fontSize: 14,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "14px 24px",
                borderRadius: 8,
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: submitting ? "default" : "pointer",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? "Submitting..." : "Request an Intro"}
            </button>
          </div>
        </form>
      </section>

      {/* How it works */}
      <section style={{ marginTop: 48, textAlign: "center" }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>
          How it works
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
          {[
            { step: "1", title: "Tell us what you need", desc: "Factory, supplier, local expert, hire — be specific." },
            { step: "2", title: "We find the right person", desc: "11 years of Shenzhen network, curated by hand." },
            { step: "3", title: "Get introduced", desc: "Warm intro via email within 48 hours." },
          ].map((item) => (
            <div key={item.step} style={{ padding: 20 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "var(--primary)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, margin: "0 auto 12px",
              }}>
                {item.step}
              </div>
              <h4 style={{ fontSize: 15, marginBottom: 4 }}>{item.title}</h4>
              <p style={{ fontSize: 13, color: "var(--muted)" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
