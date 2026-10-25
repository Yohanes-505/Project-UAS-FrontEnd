"use client";

import { useSettings } from "@/hooks/useSettings";
import { BROSUR_URL, FALLBACK_CONTACT, SOCIALS } from "./content";
import { jamTitik, waNumber } from "./lib";

export function Footer() {
  const [s] = useSettings();
  const phone = s.storePhone || FALLBACK_CONTACT.phone;
  const email = s.adminEmail || FALLBACK_CONTACT.email;
  const address = s.storeAddress || s.storeCity || FALLBACK_CONTACT.address;

  return (
    <footer className="footer">
      <div className="footer-section">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-col-1">
              <p className="footer-logo">LAMAK BANA</p>
              <p className="footer-desc">Masakan Minang autentik dengan resep turun-temurun sejak 1998.</p>
              <div className="footer-contact">
                <p>{address}</p>
                <p className="contact-wa">
                  <a className="footer-email" href={`https://wa.me/${waNumber(phone)}`} target="_blank" rel="noopener noreferrer">
                    {phone}
                  </a>
                </p>
                <p className="contact-mail">
                  <a className="footer-email" href={`mailto:${email}`}>
                    {email}
                  </a>
                </p>
              </div>
            </div>

            <div>
              <h3 className="footer-title">Jelajahi</h3>
              <ul className="footer-links">
                <li><a href="#beranda">Beranda</a></li>
                <li><a href="#menu">Menu</a></li>
                <li><a href="#promo">Promo</a></li>
                <li><a href="#tentang">Tentang</a></li>
              </ul>
            </div>

            <div>
              <h3 className="footer-title">Layanan</h3>
              <ul className="footer-links">
                <li><a href="#katering">Katering</a></li>
                <li><a href="#reservasi">Reservasi</a></li>
                <li><a href={BROSUR_URL} download>Brosur</a></li>
              </ul>
            </div>

            <div>
              <h3 className="footer-title">Jam Buka</h3>
              <ul className="footer-schedule">
                <li>
                  <span>Senin – Jumat</span>
                  <span>{jamTitik(s.weekdayOpen)} – {jamTitik(s.weekdayClose)}</span>
                </li>
                <li>
                  <span>Sabtu – Minggu</span>
                  <span>{jamTitik(s.weekendOpen)} – {jamTitik(s.weekendClose)}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="copyright">© {new Date().getFullYear()} Lamak Bana. Semua hak dilindungi.</p>
            <div className="footer-sosmed">
              {SOCIALS.map((so) => (
                <a
                  key={so.key}
                  className={`sosmed-circle sosmed-${so.key}`}
                  href={so.href}
                  aria-label={so.label}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ))}
            </div>
          </div>
        </div>

        <svg className="footer-bg-text" viewBox="0 0 1200 250" aria-hidden="true">
          <text x="0" y="240" textLength="1200" lengthAdjust="spacingAndGlyphs">
            LAMAK BANA
          </text>
        </svg>
      </div>
    </footer>
  );
}