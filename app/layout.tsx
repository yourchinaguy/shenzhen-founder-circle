import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Shenzhen Founder Circle",
  description: "Curated introductions for founders building in Shenzhen",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1a2e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body style={{ fontFamily: "var(--font-dm-sans), -apple-system, sans-serif" }}>
        <header style={{
          background: "var(--primary)",
          color: "#fff",
          padding: "16px 24px",
        }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>Shenzhen Founder Circle</h1>
          </div>
        </header>
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
