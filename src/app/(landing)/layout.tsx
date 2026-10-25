import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
// Bootstrap dimuat di layer + compat supaya tampilan tetap sama dengan versi HTML.
import "@/styles/bootstrap-layer.css";
import "@/styles/bootstrap-compat.css";
import "../globals.css";

export const metadata: Metadata = {
  title: "Lamak Bana - Restoran Masakan Minang Autentik di Jakarta Barat",
  description: "Masakan Minang autentik, dimasak dengan resep turun-temurun sejak 1998.",
  keywords: [
    "Lamak Bana", "restoran Minang", "masakan Padang", "rendang", "ayam pop",
    "dendeng batokok", "katering Minang", "reservasi meja", "Jakarta Barat",
  ],
  authors: [{ name: "Lamak Bana" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Lamak Bana",
    locale: "id_ID",
    title: "Lamak Bana - Masakan Minang Autentik",
    description: "Lamak Bana: masakan Minang autentik dengan 28 tahun resep keluarga sejak 1998.",
  },
  twitter: {
    card: "summary",
    title: "Lamak Bana - Masakan Minang Autentik",
    description: "Lamak Bana: masakan Minang autentik dengan 28 tahun resep keluarga sejak 1998.",
  },
  icons: {
    icon: [
      { url: "/images/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/images/favicon/favicon.ico", sizes: "32x32" },
    ],
    apple: "/images/favicon/Apel.png",
  },
};

export const viewport: Viewport = { themeColor: "#8B1E1E" };

/** Root layout landing page. */
export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Anton&family=Poppins:wght@400;500;700&display=swap"
        />
      </head>
      <body className="landing-body">{children}</body>
    </html>
  );
}
