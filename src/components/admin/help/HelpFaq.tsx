"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { HelpFaqItem } from "@/data/help";
import { cx } from "@/lib/format";

/** Tampilkan teks dengan **bagian tebal**. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
      )}
    </>
  );
}

/**
 * Daftar FAQ berbentuk akordeon: hanya satu jawaban terbuka dalam satu waktu.
 * `items` sudah difilter oleh halaman (pencarian).
 */
export function HelpFaq({ items }: { items: HelpFaqItem[] }) {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <div id="help-faq" className="help-faq">
      {items.map((item) => {
        const open = openQuestion === item.question;
        return (
          <div key={item.question} className={cx("help-faq-item", open && "is-open")}>
            <button
              className="help-faq-question"
              type="button"
              aria-expanded={open}
              onClick={() => setOpenQuestion(open ? null : item.question)}
            >
              <span>{item.question}</span>
              <Icon name="chevron-down" />
            </button>
            <div className="help-faq-answer">
              <p>
                <RichText text={item.answer} />
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
