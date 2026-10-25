import Link from "next/link";

/*
 * TODO(Orang 2): susun landing page dari komponen di src/components/landing/
 * (Navbar, Hero, Kategori, MenuSection, Promo, Katering, Tentang, KenapaKami,
 * Reservasi, Footer). CSS-nya sudah ada di src/app/globals.css (bagian LANDING PAGE).
 */
export default function HomePage() {
  return (
    <main
      id="konten-utama"
      style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "var(--cream)", textAlign: "center" }}
    >
      <div>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 48 }}>LAMAK BANA</p>
        <p style={{ margin: "12px 0 24px" }}>Landing page sedang dipindahkan ke Next.js.</p>
        <Link href="/security-check" className="btn-cream">
          Masuk admin
        </Link>
      </div>
    </main>
  );
}
