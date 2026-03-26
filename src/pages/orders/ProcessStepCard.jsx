import React, { useState, useEffect } from "react";
import { getVendors } from "../../utils/api";
import { Modal, Badge, Spinner } from "../../components/UI";

const stepColors = {
  gum:        { bg: "bg-black/10", border: "border-black/30", text: "text-black", icon: "◆" },
  polishing:  { bg: "bg-black/10", border: "border-black/30", text: "text-black", icon: "◇" },
  blouse_work:{ bg: "bg-black/10",   border: "border-black/30",   text: "text-black",   icon: "✦" },
};

function SendModal({ step, sarees, onSend, onClose }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    vendor_id: "",
    logistics_vendor: "",
    logistics_type: "",
    price: "",
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
    getVendors(step).then(r => setVendors(r.data)).finally(() => setLoading(false));
  }, [step]);

  const toggle = (i) =>
    setForm({ ...form, sarees_sent: form.sarees_sent.map((s, idx) => idx === i ? { ...s, selected: !s.selected } : s) });

  const updateQty = (i, qty) =>
    setForm({ ...form, sarees_sent: form.sarees_sent.map((s, idx) => idx === i ? { ...s, send_qty: qty } : s) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.vendor_id) return setErr("Select a vendor");
    const sarees_sent = form.sarees_sent
      .filter(s => s.selected && parseInt(s.send_qty) > 0)
      .map(s => ({ saree_type: s.saree_type, quantity: parseInt(s.send_qty) }));
    if (!sarees_sent.length) return setErr("Select at least one saree");
    setSaving(true);
    try {
      await onSend({ vendor_id: form.vendor_id, logistics_vendor: form.logistics_vendor, logistics_type: form.logistics_type, price: form.price !== "" ? parseFloat(form.price) : null, sarees_sent });
    } catch (e) {
      setErr(e.response?.data?.error || "Failed");
      setSaving(false);
    }
  };

  const c = stepColors[step];
  return (
    <form onSubmit={handleSubmit} className="space-y-2 pb-92">
      <div>
        <label className="label">Vendor *</label>
        {loading ? <Spinner size="sm" /> : vendors.length === 0
          ? <p className="text-stone-500 text-sm">No vendors for this process.</p>
          : <select className="input" value={form.vendor_id} onChange={e => setForm({ ...form, vendor_id: e.target.value })}>
              <option value="">-- Select vendor --</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
        }
      </div>

      <div>
        <label className="label">Sarees to send</label>
        <div className="space-y-2">
          {form.sarees_sent.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${s.selected ? `${c.bg} ${c.border}` : "bg-ink-800 border-ink-700"}`}>
              <input type="checkbox" checked={s.selected} onChange={() => toggle(i)} className="accent-gold-500" />
              <span className={`flex-1 text-sm font-medium ${s.selected ? c.text : "text-stone-500"}`}>{s.saree_type}</span>
              <span className="text-stone-500 text-xs">Qty:</span>
              <input type="number" min="1" max={s.max} value={s.send_qty} onChange={e => updateQty(i, e.target.value)}
                disabled={!s.selected} className="input w-20 text-center py-1" />
              <span className="text-stone-600 text-xs">/ {s.max} avail</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Logistics Vendor</label><input className="input" value={form.logistics_vendor} onChange={e => setForm({ ...form, logistics_vendor: e.target.value })} placeholder="DTDC, BlueDart…" /></div>
        <div><label className="label">Logistics Type</label><input className="input" value={form.logistics_type} onChange={e => setForm({ ...form, logistics_type: e.target.value })} placeholder="Surface, Air…" /></div>
      </div>
      <div><label className="label">Price (₹)</label><input className="input" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Cost for this send" /></div>

      {err && <p className="text-ruby-400 text-sm">{err}</p>}
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? "Sending…" : "Send"}</button>
      </div>
    </form>
  );
}

export default function ProcessStepCard({ step, dispatches = [], stepStatus, orderSarees, locked, onSend, onComplete }) {
  const [modal, setModal] = useState(false);
  const [completing, setCompleting] = useState(null); // dispatch id being completed
  const c = stepColors[step];

  const handleComplete = async (dispatchId) => {
    setCompleting(dispatchId);
    try { await onComplete(step, dispatchId); }
    finally { setCompleting(null); }
  };

  const handleSend = async (payload) => { await onSend(step, payload); setModal(false); };

  return (
    <>
      <div className={`rounded-xl border ${c.bg} ${c.border} p-4`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-xl ${c.text}`}>{c.icon}</span>
            <h3 className={`font-medium text-sm capitalize ${c.text}`}>{step.replace("_", " ")}</h3>
            {dispatches.length > 0 && (
              <span className="text-xs text-stone-500">({dispatches.length} send{dispatches.length > 1 ? "s" : ""})</span>
            )}
          </div>
          {/* Derived step badge */}
          <span className={`badge ${
            stepStatus === "completed" ? "bg-white text-black" :
            stepStatus === "in_process" ? "bg-orange-500 text-white" :
            "bg-orange-500/50 text-orange-400"
          }`}>
            {stepStatus}
          </span>
        </div>

        {/* Dispatch list */}
        {dispatches.length > 0 && (
          <div className="space-y-2 mb-3">
            {dispatches.map((d) => (
              <div key={d.id} className="bg-ink-900/60 rounded-lg p-3 border border-ink-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-stone-200 text-sm font-medium">{d.vendor_name}</span>
                  <span className={`badge text-xs ${d.status === "completed" ? "bg-white text-black" : "bg-orange-500 text-white"}`}>
                    {d.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {d.sarees_sent?.map((s, i) => (
                    <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
                      {s.saree_type} × {s.quantity}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500">
                  <div className="flex gap-3">
                    {d.price != null && <span>₹{d.price}</span>}
                    {d.logistics_vendor && <span>{d.logistics_vendor} · {d.logistics_type}</span>}
                  </div>
                  {!locked && d.status === "in_process" && (
                    <button
                      onClick={() => handleComplete(d.id)}
                      disabled={completing === d.id}
                      className="text-emerald-400 hover:text-emerald-300 font-medium transition-all"
                    >
                      {completing === d.id ? "…" : "Mark done ✓"}
                    </button>
                  )}
                  {d.status === "completed" && (
                    <span className="text-emerald-500">
                      Done {d.completed_at ? new Date(d.completed_at).toLocaleDateString("en-IN") : ""}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add send button */}
        {!locked && (
          <button onClick={() => setModal(true)}
            className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${c.text} border ${c.border} hover:bg-ink-800`}>
            + Send to {step.replace("_", " ")}
          </button>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={`Send to ${step.replace("_", " ")}`} size="lg">
        <SendModal step={step} sarees={orderSarees} onSend={handleSend} onClose={() => setModal(false)} />
      </Modal>
    </>
  );
}