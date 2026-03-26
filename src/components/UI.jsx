import React from "react";

/* =========================
   MODAL
========================= */
export function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl w-full ${sizes[size]} shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="font-semibold text-sm">{title}</h2>
          <button onClick={onClose} className="text-lg">×</button>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

/* =========================
   SPINNER
========================= */
export function Spinner({ size = "md" }) {
  const s =
    size === "sm" ? "w-4 h-4" :
    size === "lg" ? "w-8 h-8" :
    "w-6 h-6";

  return (
    <div className={`${s} border-2 border-gray-300 border-t-orange-600 rounded-full animate-spin`} />
  );
}

/* =========================
   BADGE
========================= */
const badgeColors = {
  order_pending: "bg-gray-100 text-gray-600",
  packing_completed: "bg-orange-100 text-orange-600",
  completed: "bg-green-100 text-green-600",
  pending: "bg-gray-100 text-gray-500",
  in_process: "bg-amber-100 text-amber-600",
};

export function Badge({ label, type }) {
  const color = badgeColors[type] || "bg-gray-100 text-gray-600";

  return (
    <span className={`text-xs px-2 py-1 rounded ${color}`}>
      {label || type?.replace(/_/g, " ")}
    </span>
  );
}

/* =========================
   EMPTY STATE
========================= */
export function EmptyState({ icon = "◌", title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="font-medium">{title}</p>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* =========================
   PAGE HEADER
========================= */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/* =========================
   CONFIRM DIALOG
========================= */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 mb-4">{message}</p>

      <div className="flex gap-2 justify-end">
        <button
          onClick={onClose}
          className="px-3 py-1 border rounded"
        >
          Cancel
        </button>

        <button
          onClick={onConfirm}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
}

/* =========================
   TOAST
========================= */
export function Toast({ message, type = "success", onClose }) {
  const colors = {
    success: "bg-green-100 text-green-600",
    error: "bg-red-100 text-red-600",
    info: "bg-orange-100 text-orange-600",
  };

  return (
    <div className={`fixed bottom-5 right-5 px-4 py-2 rounded shadow ${colors[type]}`}>
      <div className="flex gap-2 items-center">
        <span>
          {type === "success" ? "✓" : type === "error" ? "✗" : "ℹ"}
        </span>
        <span className="text-sm">{message}</span>
        <button onClick={onClose}>×</button>
      </div>
    </div>
  );
}

/* =========================
   TOAST HOOK
========================= */
export function useToast() {
  const [toast, setToast] = React.useState(null);

  const show = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const ToastComponent = toast ? (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={() => setToast(null)}
    />
  ) : null;

  return { show, ToastComponent };
}