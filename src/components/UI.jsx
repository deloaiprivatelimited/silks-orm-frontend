import React from "react";

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;
  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,9,8,0.85)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className={`card w-full ${sizes[size]} shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700">
          <h2 className="section-title">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1 text-xl leading-none">
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = "md" }) {
  const s = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-6 h-6";
  return (
    <div
      className={`${s} border-2 border-ink-700 border-t-gold-500 rounded-full animate-spin`}
    />
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const badgeColors = {
  order_pending: "bg-stone-700/40 text-stone-300",
  packing_completed: "bg-sapphire-500/20 text-sapphire-400",
  completed: "bg-emerald-500/20 text-emerald-400",
  pending: "bg-stone-700/40 text-stone-400",
  in_process: "bg-gold-500/20 text-gold-400",
  gum: "bg-orange-500/20 text-orange-400",
  polishing: "bg-purple-500/20 text-purple-400",
  blouse_work: "bg-pink-500/20 text-pink-400",
  call: "bg-sapphire-500/15 text-sapphire-400",
  whatsapp: "bg-emerald-500/15 text-emerald-400",
  store_visit: "bg-gold-500/15 text-gold-400",
  reference: "bg-purple-500/15 text-purple-400",
};

export function Badge({ label, type }) {
  const color = badgeColors[type] || "bg-ink-700 text-stone-400";
  return (
    <span className={`badge ${color}`}>
      {label || type?.replace(/_/g, " ")}
    </span>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = "◌", title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl text-stone-700 mb-4">{icon}</div>
      <p className="text-stone-400 font-medium text-base mb-1">{title}</p>
      {subtitle && <p className="text-stone-600 text-sm mb-6">{subtitle}</p>}
      {action}
    </div>
  );
}

// ── Page Header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="text-stone-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, danger = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-stone-400 text-sm mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={onConfirm} className={danger ? "btn-danger" : "btn-primary"}>
          Confirm
        </button>
      </div>
    </Modal>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ message, type = "success", onClose }) {
  const colors = {
    success: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
    error: "bg-ruby-500/20 border-ruby-500/40 text-ruby-300",
    info: "bg-sapphire-500/20 border-sapphire-500/40 text-sapphire-300",
  };
  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-3 shadow-xl ${colors[type]}`}
    >
      <span>{type === "success" ? "✓" : type === "error" ? "✗" : "ℹ"}</span>
      <span>{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 ml-2">×</button>
    </div>
  );
}

// ── useToast hook ─────────────────────────────────────────────────────────────
export function useToast() {
  const [toast, setToast] = React.useState(null);
  const show = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };
  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
  ) : null;
  return { show, ToastComponent };
}