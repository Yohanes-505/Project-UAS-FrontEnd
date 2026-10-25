"use client";

import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";

interface LogoutConfirmProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LogoutConfirm({ open, onCancel, onConfirm }: LogoutConfirmProps) {
  return (
    <Modal open={open} onClose={onCancel} labelledBy="logout-confirm-title" describedBy="logout-confirm-desc">
      <div className="logout-confirm-box">
        <span className="logout-confirm-icon">
          <Icon name="log-out" />
        </span>
        <p id="logout-confirm-title" className="logout-confirm-title">
          Keluar dari dashboard?
        </p>
        <p id="logout-confirm-desc" className="logout-confirm-desc">
          Sesi admin akan diakhiri. Silakan login kembali untuk membuka Dashboard.
        </p>
        <div className="logout-confirm-actions">
          <button type="button" id="logout-cancel" className="logout-cancel" onClick={onCancel}>
            Batal
          </button>
          <button type="button" id="logout-confirm-btn" className="logout-submit" onClick={onConfirm}>
            Keluar
          </button>
        </div>
      </div>
    </Modal>
  );
}
