import React, { useState, useEffect } from "react";
import { getVendors } from "../../utils/api";
import { Modal, Spinner } from "../../components/UI";

const stepMeta = {
  gum:        { label: "Gum", icon: "⬡" },
  polishing:  { label: "Polishing", icon: "◈" },
  blouse_work:{ label: "Blouse Work", icon: "✦" },
};

function SendModal({ step, sarees, onSend, onClose }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    vendor_id: "",
    sarees_sent: sarees.map(s => ({
      saree_type: s.saree_type,
      max: s.quantity,
      selected: false,
      send_qty: s.quantity,
    })),
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    getVendors(step)
      .then(r => setVendors(r.data))
      .finally(() => setLoading(false));
  }, [step]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vendor_id) return setErr("Select vendor");

    const sarees_sent = form.sarees_sent
      .filter(s => s.selected)
      .map(s => ({
        saree_type: s.saree_type,
        quantity: s.send_qty
      }));

    if (!sarees_sent.length) return setErr("Select sarees");

    setSaving(true);
    await onSend({ vendor_id: form.vendor_id, sarees_sent });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <select
        className="w-full border rounded-xl px-3 py-2"
        value={form.vendor_id}
        onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}
      >
        <option value="">Select vendor</option>
        {vendors.map(v => (
          <option key={v.id} value={v.id}>{v.name}</option>
        ))}
      </select>

      <div className="space-y-2">
        {form.sarees_sent.map((s, i) => (
          <label key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              checked={s.selected}
              onChange={() => {
                const updated = [...form.sarees_sent];
                updated[i].selected = !updated[i].selected;
                setForm({ ...form, sarees_sent: updated });
              }}
            />
            <span className="flex-1 text-sm">{s.saree_type}</span>
            <input
              type="number"
              value={s.send_qty}
              disabled={!s.selected}
              className="w-16 border rounded px-2 py-1 text-sm"
              onChange={(e) => {
                const updated = [...form.sarees_sent];
                updated[i].send_qty = e.target.value;
                setForm({ ...form, sarees_sent: updated });
              }}
            />
          </label>
        ))}
      </div>

      {err && <p className="text-red-500 text-sm">{err}</p>}

      <div className="flex justify-end gap-2">
        <button onClick={onClose} type="button">Cancel</button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl">
          {saving ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}

export default function ProcessStepCard({
  step,
  dispatches = [],
  stepStatus,
  orderSarees,
  locked,
  onSend,
  onComplete
}) {
  const [modal, setModal] = useState(false);
  const meta = stepMeta[step];

  return (
    <>
      <div className="border rounded-2xl p-4 bg-white shadow-sm">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">

          <div className="flex items-center gap-2">
            <span className="text-lg">{meta.icon}</span>
            <h3 className="font-semibold">{meta.label}</h3>
          </div>

          <span className={`text-xs px-2 py-1 rounded-lg ${
            stepStatus === "completed"
              ? "bg-green-100 text-green-700"
              : stepStatus === "in_process"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-600"
          }`}>
            {stepStatus}
          </span>
        </div>

        {/* DISPATCH LIST */}
        {dispatches.length === 0 ? (
          <p className="text-sm text-gray-400 mb-3">
            No items sent yet
          </p>
        ) : (
          <div className="space-y-3 mb-4">
            {dispatches.map((d) => (
              <div
                key={d.id}
                className="p-3 rounded-xl border bg-gray-50"
              >

                <div className="flex justify-between mb-1">
                  <span className="font-medium text-sm">
                    {d.vendor_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {d.status}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mb-2">
                  {d.sarees_sent?.map(s => `${s.saree_type} × ${s.quantity}`).join(", ")}
                </div>

                {!locked && d.status === "in_process" && (
                  <button
                    onClick={() => onComplete(step, d.id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Mark done →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {!locked && (
          <button
            onClick={() => setModal(true)}
            className="w-full py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
          >
            + Send to {meta.label}
          </button>
        )}
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={`Send to ${meta.label}`}
      >
        <SendModal
          step={step}
          sarees={orderSarees}
          onSend={onSend}
          onClose={() => setModal(false)}
        />
      </Modal>
    </>
  );
}