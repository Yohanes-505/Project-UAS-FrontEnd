"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { HELP_CATEGORIES, HELP_MESSAGE_MAX } from "@/data/help";

/** Form "Masih Butuh Bantuan?". Di prototype ini hanya simulasi kirim. */
export function HelpForm() {
  const showToast = useToast();
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!category || !subject.trim() || !message.trim()) {
      showToast("Lengkapi kategori, judul, dan detail kendala.");
      return;
    }
    showToast("Pertanyaan berhasil dicatat pada prototype.");
    setCategory("");
    setSubject("");
    setMessage("");
  };

  return (
    <form id="help-form" className="help-form" onSubmit={handleSubmit}>
      <label>
        <span>Kategori</span>
        <Select
          id="help-category"
          value={category}
          onChange={setCategory}
          options={HELP_CATEGORIES}
          placeholder="Pilih kategori"
        />
      </label>

      <label>
        <span>Judul</span>
        <input
          id="help-subject"
          required
          type="text"
          maxLength={80}
          placeholder="Contoh: Tidak bisa mengubah status pesanan"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
      </label>

      <label>
        <span>Detail Kendala</span>
        <textarea
          id="help-message"
          required
          rows={5}
          maxLength={HELP_MESSAGE_MAX}
          placeholder="Jelaskan kendala secara singkat..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <small>
          <span id="help-message-count">{message.length}</span>/{HELP_MESSAGE_MAX} karakter
        </small>
      </label>

      <Button type="submit" icon="send" className="help-submit">
        Kirim Pertanyaan
      </Button>

      <p className="help-form-note">
        <Icon name="info" className="u-size-3" /> Pada prototype ini, form hanya mensimulasikan
        pengiriman dan belum terhubung ke sistem tiket.
      </p>
    </form>
  );
}
