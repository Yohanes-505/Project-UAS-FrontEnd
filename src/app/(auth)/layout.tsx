import type { Metadata } from "next";
import type { ReactNode } from "react";
// Bootstrap dimuat di layer + compat supaya tampilan tetap sama dengan versi HTML.
import "@/styles/bootstrap-layer.css";
import "@/styles/bootstrap-compat.css";
import "../globals.css";

export const metadata: Metadata = {
  title: "Security Check - Lamak Bana",
  robots: { index: false, follow: false },
  icons: { icon: [{ url: "/images/favicon/favicon.svg", type: "image/svg+xml" }, { url: "/favicon.ico" }] },
};

/** Root layout khusus halaman login. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
        />
      </head>
      <body className="security-body">{children}</body>
    </html>
  );
}
