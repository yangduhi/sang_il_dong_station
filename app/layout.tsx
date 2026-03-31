import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "상일동역 승하차 / 권역 OD 대시보드",
  description:
    "Codex-first analytical dashboard for Sangil-dong Station with deterministic local fallback."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
