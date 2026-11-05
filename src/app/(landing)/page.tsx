import {
  Hero,
  Kategori,
  KenapaKami,
  Katering,
  LandingRoot,
  MenuSection,
  Promo,
  Reservasi,
  Tentang,
} from "@/components/landing";

/** Landing page Lamak Bana. Urutan section mengikuti desain; CSS ada di globals.css (bagian LANDING PAGE). */
export default function HomePage() {
  return (
    <LandingRoot>
      <Hero />
      <Kategori />
      <Promo />
      <MenuSection />
      <Tentang />
      <KenapaKami />
      <Katering />
      <Reservasi />
    </LandingRoot>
  );
}