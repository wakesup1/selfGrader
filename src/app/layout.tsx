import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "NoGrader",
  description: "Online judge platform — cafe · grade · chill",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <footer
          style={{
            padding: "24px 48px",
            borderTop: "1px solid var(--line)",
            color: "var(--muted)",
            fontSize: 12,
            fontFamily: "var(--mono)",
            letterSpacing: "0.06em",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>© 2026 nograder · cafe · grade · chill</span>
          <span>self-hosted judge0 · powered by claude</span>
        </footer>
      </body>
    </html>
  );
}
