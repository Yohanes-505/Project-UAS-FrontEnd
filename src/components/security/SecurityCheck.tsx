"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ADMIN_PATH, isAuthenticated, login } from "@/lib/auth";

/** Kartu login admin (pengganti security-check/index.html + script.js). */
export function SecurityCheck() {
  const router = useRouter();
  const passwordRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Sudah login? Tidak perlu lewat security check lagi.
  useEffect(() => {
    if (isAuthenticated()) router.replace(ADMIN_PATH);
  }, [router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (login(username, password)) {
      router.push(ADMIN_PATH);
      return;
    }
    setError("Username atau password tidak sesuai.");
    passwordRef.current?.focus();
  };

  return (
    <main className="security-page">
      <section className="security-card" aria-labelledby="security-title">
        <div className="brand-mark">LAMAK BANA</div>

        <div className="security-icon" aria-hidden="true">
          <span>⌁</span>
        </div>

        <p className="eyebrow">ADMIN ACCESS</p>
        <h1 id="security-title">Security Check</h1>
        <p className="intro">
          Masukkan akun admin untuk melanjutkan ke dashboard pengelolaan Lamak Bana.
        </p>

        <form id="security-form" noValidate onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Masukkan username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />

          <label htmlFor="password">Password</label>
          <div className="password-wrap">
            <input
              ref={passwordRef}
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Masukkan password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              id="toggle-password"
              type="button"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "Sembunyikan" : "Lihat"}
            </button>
          </div>

          <p id="security-error" className="error-message" role="alert" aria-live="polite">
            {error}
          </p>

          <button className="submit-button" type="submit">
            Masuk ke Dashboard
          </button>
        </form>

        <Link className="back-link" href="/">
          ← Kembali ke website
        </Link>

        <p className="demo-note">Akses demo UTS · Frontend authentication</p>
      </section>
    </main>
  );
}
