"use client";

import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminPage";
import { HelpFaq } from "@/components/admin/help/HelpFaq";
import { HelpForm } from "@/components/admin/help/HelpForm";
import { HelpGuideCard } from "@/components/admin/help/HelpGuideCard";
import { Icon } from "@/components/ui/Icon";
import { HELP_FAQ, HELP_GUIDES } from "@/data/help";

/** Cocok kalau kata kunci muncul di salah satu teks (huruf besar/kecil diabaikan). */
function matches(query: string, ...texts: string[]): boolean {
  return !query || texts.join(" ").toLowerCase().includes(query);
}

export default function BantuanPage() {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();

  const guides = HELP_GUIDES.filter((g) => matches(query, g.title, g.description, g.keywords));
  const faq = HELP_FAQ.filter((f) =>
    matches(query, f.question, f.answer.replaceAll("**", ""), f.keywords),
  );

  return (
    <AdminPage id="page-bantuan" className="help-page">
      <section className="reveal help-hero" style={{ animationDelay: "60ms" }}>
        <div className="help-hero-copy">
          <span className="help-kicker">
            <Icon name="life-buoy" className="u-size-4" /> PUSAT BANTUAN
          </span>
          <h2>Bagaimana kami bisa membantu?</h2>
          <p>
            Temukan panduan singkat penggunaan Admin Lamak Bana atau cari jawaban dari pertanyaan
            yang sering ditanyakan.
          </p>
        </div>
        <label className="help-search-wrap">
          <Icon name="search" className="u-size-4" />
          <input
            id="help-search"
            type="search"
            placeholder="Cari bantuan, contoh: tambah menu..."
            autoComplete="off"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </section>

      <section className="reveal help-section" style={{ animationDelay: "100ms" }}>
        <div className="help-section-head">
          <div>
            <p className="u-text-base fw-semibold u-text-ink">Panduan Cepat</p>
            <p className="u-text-xs ink60">Akses fitur yang paling sering digunakan.</p>
          </div>
        </div>
        <div id="help-guide-grid" className="help-guide-grid">
          {guides.map((guide) => (
            <HelpGuideCard key={guide.href} guide={guide} />
          ))}
        </div>
      </section>

      <section className="help-two-col">
        <article className="reveal help-panel" style={{ animationDelay: "140ms" }}>
          <div className="help-section-head">
            <div>
              <p className="u-text-base fw-semibold u-text-ink">Pertanyaan Umum</p>
              <p className="u-text-xs ink60">Jawaban singkat untuk penggunaan sehari-hari.</p>
            </div>
          </div>
          <HelpFaq items={faq} />
          {query && faq.length === 0 && (
            <div id="help-no-result" className="help-no-result">
              Tidak ada panduan yang cocok dengan pencarian.
            </div>
          )}
        </article>

        <article className="reveal help-panel help-contact" style={{ animationDelay: "180ms" }}>
          <div className="help-section-head">
            <div>
              <p className="u-text-base fw-semibold u-text-ink">Masih Butuh Bantuan?</p>
              <p className="u-text-xs ink60">Kirim catatan kendala kepada pengelola sistem.</p>
            </div>
          </div>
          <HelpForm />
        </article>
      </section>
    </AdminPage>
  );
}
