import type { Metadata } from "next";
import type { ReactNode } from "react";
// Urutan penting: Bootstrap dulu, baru globals.css supaya bisa menimpa Bootstrap.
import "bootstrap/dist/css/bootstrap.min.css";
import "../globals.css";

export const metadata: Metadata = {
  title: "Lamak Bana - Dashboard Admin",
  robots: { index: false, follow: false },
  icons: { icon: [{ url: "/images/favicon/favicon.svg", type: "image/svg+xml" }, { url: "/favicon.ico" }] },
};

/** Root layout khusus admin (Bootstrap biasa, sama seperti versi HTML). */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Sans+Condensed:wght@500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
        />
      </head>
      <body className="u-bg-cream u-text-ink app-body">{children}</body>
    </html>
  );
}
