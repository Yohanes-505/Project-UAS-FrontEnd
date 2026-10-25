"use client";

import { useRef, type CSSProperties, type MouseEvent } from "react";
import { cx, photoUrl } from "@/lib/format";
import { HERO_PHOTOS } from "./content";
import { useRotatingIndex } from "./hooks";

const TITLE = ["MASAKAN", "MINANG", "DARI", "HATI"];

/** Lingkaran foto yang berganti pelan lewat lapisan `.hero-layer`. */
function FoodCircle({ className, photos, size, offset, ms }: { className: string; photos: string[]; size?: string; offset: number; ms: number }) {
  const active = useRotatingIndex(photos.length, ms, offset);
  return (
    <div className={cx("food-circle", className)} aria-hidden="true">
      {photos.map((src, i) => (
        <div
          key={src}
          className={cx("hero-layer", i === active && "is-active")}
          style={{ backgroundImage: `url("${photoUrl(src)}")`, backgroundSize: size ?? "cover", backgroundPosition: "center" }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  // parallax halus mengikuti kursor (nilai -1..1 dibaca CSS lewat --mx / --my)
  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el || window.innerWidth < 993) return;
    el.style.setProperty("--mx", String((e.clientX / window.innerWidth - 0.5) * 2));
    el.style.setProperty("--my", String((e.clientY / window.innerHeight - 0.5) * 2));
  };

  return (
    <section id="beranda" className="hero" ref={ref} onMouseMove={onMove} style={{ scrollMarginTop: 0 }}>
      <p className="hero-subtitle">RESTORAN MINANG AUTENTIK · JAKARTA BARAT</p>
      <h1 className="hero-title title-split">
        {TITLE.map((w, i) => (
          <span key={w}>
            <span className="hero-word" style={{ "--i": i } as CSSProperties}>
              {w === "HATI" ? <span className="highlight-word">{w}</span> : w}
            </span>
            {i === 1 ? <br /> : " "}
          </span>
        ))}
      </h1>

      <div className="food-circles-container">
        <FoodCircle className="circle-left" photos={HERO_PHOTOS.left} offset={1200} ms={5200} />
        <FoodCircle className="circle-center" photos={HERO_PHOTOS.center} size="110%" offset={0} ms={6000} />
        <FoodCircle className="circle-right" photos={HERO_PHOTOS.right} offset={2400} ms={5600} />
      </div>

      <svg className="hero-curve" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 220V140C300 20 1140 20 1440 140V220Z" />
      </svg>
    </section>
  );
}