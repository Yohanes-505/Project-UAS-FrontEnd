"use client";

import { useState } from "react";
import { CloseButton } from "@/components/ui/Button";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { NOTIFICATIONS } from "@/data/notifications";

export function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [allRead, setAllRead] = useState(false);
  useEscapeKey(onClose, open);
  if (!open) return null;

  return (
    <div
      id="notif"
      className="position-fixed u-inset-0 u-z-60 d-flex justify-content-end"
      style={{ background: "rgba(0,0,0,.2)" }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        id="notif-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notif-title"
        className="anim-slide d-flex h-100 u-w-380px flex-column u-gap-4 u-border-l u-border-solid border-soft bg-white u-p-6"
      >
        <div className="d-flex align-items-center justify-content-between">
          <p id="notif-title" className="u-text-base fw-semibold u-leading-6 u-text-ink">
            Notifikasi
          </p>
          <CloseButton id="notif-close" onClick={onClose} />
        </div>

        <div id="notif-list" className="d-flex flex-column u-gap-2">
          {NOTIFICATIONS.map((n) => (
            <div
              key={n.title}
              className="d-flex u-cursor-pointer u-gap-3 u-rounded-xl u-border u-border-solid u-p-3 u-transition-colors u-hover-bg-cream"
              style={{ borderColor: "rgba(59,31,20,.08)" }}
            >
              <span
                className="u-mt-1 u-size-2 flex-shrink-0 rounded-pill"
                style={{ background: allRead ? "rgba(59,31,20,.18)" : n.color }}
              />
              <div className="d-flex u-flex-1 flex-column u-gap-0-5">
                <p className="u-text-sm fw-medium u-leading-5 u-text-ink">{n.title}</p>
                <p className="u-text-xs u-leading-4 ink60">{n.detail}</p>
                <p className="u-mt-0-5 u-text-xs u-leading-4 ink40">{n.time}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setAllRead(true)}
          disabled={allRead}
          className="mt-auto rounded-pill u-bg-maroon u-py-2-5 u-text-sm fw-medium text-white u-transition-opacity u-hover-opacity-90"
        >
          {allRead ? "Semua sudah terbaca" : "Tandai semua terbaca"}
        </button>
      </div>
    </div>
  );
}
