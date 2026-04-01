import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div style={{
      textAlign: "center",
      paddingTop: 80,
      paddingBottom: 80,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "rgba(61,122,74,0.1)", color: "var(--success)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, margin: "0 auto 24px",
      }}>
        ✓
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
        Request received
      </h2>
      <p style={{ fontSize: 16, color: "var(--muted)", maxWidth: 400, margin: "0 auto", marginBottom: 32 }}>
        You'll hear from Jan within 48 hours with a curated introduction.
        The best matches come from specific asks, so thank you for the detail.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          padding: "10px 20px",
          borderRadius: 8,
          border: "1px solid var(--border)",
          color: "var(--text)",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Back to home
      </Link>
    </div>
  );
}
