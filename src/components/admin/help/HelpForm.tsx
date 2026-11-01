"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { HELP_CATEGORIES, HELP_MESSAGE_MAX } from "@/data/help";
import { apiSend, errorMessage } from "@/lib/api";

/** Form "Masih Butuh Bantuan?". Pertanyaan dikirim ke backend dan disimpan di tabel help_tickets. */
export function HelpForm() {
  const showToast = useToast();
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!category || !subject.trim() || !message.trim()) {
      showToast("Lengkapi kategori, judul, dan detail kendala.");
      return;
    }
    setSending(true);
    try {
      await apiSend("POST", "/api/help", {
        category,
        subject: subject.trim(),
        message: message.trim(),
      });
      showToast("Pertanyaan berhasil dikirim dan tersimpan.");
      setCategory("");
      setSubject("");
      setMessage("");
    } catch (err) {
      showToast(errorMessage(err, "Pertanyaan gagal dikirim."));
    } finally {
      setSending(false);
    }
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

      <Button type="submit" icon="send" className="help-submit" disabled={sending}>
        {sending ? "Mengirim..." : "Kirim Pertanyaan"}
      </Button>

      <p className="help-form-note">
        <Icon name="info" className="u-size-3" /> Pertanyaan disimpan di database dan dapat
        dilihat tim pengembang lewat endpoint GET /api/help.
      </p>
    </form>
  );
}
