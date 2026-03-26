import React, { useState, useEffect } from "react";
import { getVendors } from "../../utils/api";
import { Modal, Badge, Spinner } from "../../components/UI";

/* ─── inject Google Fonts once ─── */
if (typeof document !== "undefined" && !document.getElementById("psc-fonts")) {
  const l = document.createElement("link");
  l.id = "psc-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@300;400;500&display=swap";
  document.head.appendChild(l);
}

/* ─── design tokens ─── */
const T = {
  white:    "#ffffff",
  paper:    "#fafaf9",
  smoke:    "#f3f2f0",
  hairline: "#e8e6e2",
  mid:      "#b0aca5",
  muted:    "#7a766f",
  ink:      "#1a1815",
  font:     "'IBM Plex Mono', monospace",
  serif:    "'Cormorant Garamond', serif",
};

/* ─── style helpers ─── */
const s = {
  card: (active) => ({
    background: T.white,
    border: `1px solid ${active ? "#c0bbb4" : T.hairline}`,
    borderRadius: 8,
    padding: "16px 14px",
    fontFamily: T.font,
    boxShadow: active
      ? "0 2px 16px rgba(26,24,21,0.07)"
      : "0 1px 4px rgba(26,24,21,0.04)",
    transition: "box-shadow .2s, border-color .2s",
  }),
  header: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: 14,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 },
  iconBox: {
    width: 28, height: 28, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    border: `1px solid ${T.hairline}`, borderRadius: 5,
    fontSize: 11, color: T.ink, background: T.smoke,
  },
  title: {
    fontFamily: T.serif, fontSize: 17, fontWeight: 500,
    color: T.ink, letterSpacing: "0.01em",
    textTransform: "capitalize", lineHeight: 1,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  count: { fontSize: 10, color: T.muted, letterSpacing: "0.05em", flexShrink: 0 },

  badgeDone:    { background: T.ink,   color: T.white,  fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 3, fontFamily: T.font, fontWeight: 500, whiteSpace: "nowrap" },
  badgeActive:  { background: "transparent", color: T.ink, border: `1px solid ${T.ink}`, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 3, fontFamily: T.font, fontWeight: 500, whiteSpace: "nowrap" },
  badgePending: { background: T.smoke, color: T.muted, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 3, fontFamily: T.font, whiteSpace: "nowrap" },

  dispatchList: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 },
  dispatch: {
    background: T.paper, border: `1px solid ${T.hairline}`,
    borderRadius: 6, padding: "11px 12px",
  },
  dispatchTop: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: 8, gap: 6,
  },
  vendorName: {
    fontFamily: T.serif, fontSize: 14, fontWeight: 500,
    color: T.ink, letterSpacing: "0.02em",
  },
  pills: { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 },
  pill: {
    fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase",
    padding: "2px 7px", borderRadius: 2,
    border: `1px solid ${T.hairline}`,
    color: T.muted, background: T.white, fontFamily: T.font,
  },
  metaRow: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", flexWrap: "wrap", gap: 6,
  },
  metaLeft: { display: "flex", gap: 12, flexWrap: "wrap" },
  metaItem: { fontSize: 10, color: T.muted, letterSpacing: "0.04em", fontFamily: T.font },
  markDoneBtn: {
    fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
    color: T.ink, background: "none", border: "none",
    cursor: "pointer", fontFamily: T.font, fontWeight: 500,
    textDecoration: "underline", textUnderlineOffset: 3, padding: 0,
  },
  doneText: { fontSize: 10, color: T.muted, letterSpacing: "0.06em", fontFamily: T.font },

  sendBtn: (hov) => ({
    width: "100%", padding: "10px 0",
    border: `1.5px dashed ${hov ? "#c0bbb4" : T.hairline}`,
    borderRadius: 6,
    background: hov ? T.smoke : "transparent",
    color: hov ? T.ink : T.muted,
    fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
    cursor: "pointer", fontFamily: T.font,
    transition: "all .18s",
  }),

  /* modal form */
  form: { display: "flex", flexDirection: "column", gap: 16, paddingBottom:360,marginBottom:36 },
  label: {
    display: "block", fontSize: 9, letterSpacing: "0.14em",
    textTransform: "uppercase", color: T.muted, fontFamily: T.font, marginBottom: 5,
  },
  input: {
    width: "100%", boxSizing: "border-box",
    background: T.paper, border: `1px solid ${T.hairline}`,
    borderRadius: 5, color: T.ink, fontFamily: T.font,
    fontSize: 12, padding: "9px 11px", outline: "none",
  },
  select: {
    width: "100%", boxSizing: "border-box",
    background: T.paper, border: `1px solid ${T.hairline}`,
    borderRadius: 5, color: T.ink, fontFamily: T.font,
    fontSize: 12, padding: "9px 11px", outline: "none", appearance: "none",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },

  sareeList: { display: "flex", flexDirection: "column", gap: 6 },
  sareeRow: (checked) => ({
    display: "flex", alignItems: "center", gap: 8, padding: "9px 11px",
    border: `1px solid ${checked ? T.ink : T.hairline}`,
    borderRadius: 5, background: checked ? T.smoke : T.white,
    transition: "border-color .15s, background .15s",
  }),
  sareeName: (checked) => ({
    flex: 1, fontSize: 11, letterSpacing: "0.03em",
    fontFamily: T.font, color: checked ? T.ink : T.mid,
  }),
  qtyLabel: { fontSize: 9, color: T.muted, letterSpacing: "0.05em", fontFamily: T.font },
  qtyInput: {
    width: 52, background: T.white,
    border: `1px solid ${T.hairline}`, borderRadius: 3,
    color: T.ink, fontFamily: T.font, fontSize: 11,
    padding: "5px 6px", textAlign: "center", outline: "none",
  },
  qtyAvail: { fontSize: 9, color: T.mid, letterSpacing: "0.04em", whiteSpace: "nowrap", fontFamily: T.font },

  error: { fontSize: 10, color: "#c0392b", letterSpacing: "0.05em", fontFamily: T.font },
  actions: { display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 4 },
  btnCancel: {
    padding: "9px 18px", background: "transparent",
    border: `1px solid ${T.hairline}`, borderRadius: 5, color: T.muted,
    fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
    cursor: "pointer", fontFamily: T.font,
  },
  btnPrimary: (disabled) => ({
    padding: "9px 22px",
    background: disabled ? T.mid : T.ink,
    border: "none", borderRadius: 5, color: T.white,
    fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: T.font, fontWeight: 500, transition: "background .15s",
  }),
};

/* ─── stepColors kept for structural parity ─── */
const stepColors = {
  gum:         { bg: "bg-ink-700/50", border: "border-ink-600", text: "text-stone-200", icon: "◆" },
  polishing:   { bg: "bg-ink-700/50", border: "border-ink-600", text: "text-stone-200", icon: "◇" },
  blouse_work: { bg: "bg-ink-700/50", border: "border-ink-600", text: "text-stone-200", icon: "✦" },
};

/* ─── SendModal ─── */
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
    setForm({ ...form, sarees_sent: form.sarees_sent.map((sr, idx) => idx === i ? { ...sr, selected: !sr.selected } : sr) });

  const updateQty = (i, qty) =>
    setForm({ ...form, sarees_sent: form.sarees_sent.map((sr, idx) => idx === i ? { ...sr, send_qty: qty } : sr) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.vendor_id) return setErr("Select a vendor");
    const sarees_sent = form.sarees_sent
      .filter(sr => sr.selected && parseInt(sr.send_qty) > 0)
      .map(sr => ({ saree_type: sr.saree_type, quantity: parseInt(sr.send_qty) }));
    if (!sarees_sent.length) return setErr("Select at least one saree");
    setSaving(true);
    try {
      await onSend({ vendor_id: form.vendor_id, logistics_vendor: form.logistics_vendor, logistics_type: form.logistics_type, price: form.price !== "" ? parseFloat(form.price) : null, sarees_sent });
    } catch (e) {
      setErr(e.response?.data?.error || "Failed");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={s.form}>
      {/* Vendor */}
      <div>
        <label style={s.label}>Vendor *</label>
        {loading
          ? <Spinner size="sm" />
          : vendors.length === 0
            ? <p style={{ ...s.metaItem, marginTop: 4 }}>No vendors for this process.</p>
            : <select style={s.select} value={form.vendor_id} onChange={e => setForm({ ...form, vendor_id: e.target.value })}>
                <option value="">— Select vendor —</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
        }
      </div>

      {/* Sarees */}
      <div>
        <label style={s.label}>Sarees to send</label>
        <div style={s.sareeList}>
          {form.sarees_sent.map((sr, i) => (
            <div key={i} style={s.sareeRow(sr.selected)}>
              <input type="checkbox" checked={sr.selected} onChange={() => toggle(i)}
                style={{ width: 14, height: 14, accentColor: T.ink, cursor: "pointer", flexShrink: 0 }} />
              <span style={s.sareeName(sr.selected)}>{sr.saree_type}</span>
              <span style={s.qtyLabel}>Qty</span>
              <input type="number" min="1" max={sr.max} value={sr.send_qty}
                onChange={e => updateQty(i, e.target.value)}
                disabled={!sr.selected}
                style={{ ...s.qtyInput, opacity: sr.selected ? 1 : 0.3 }} />
              <span style={s.qtyAvail}>/ {sr.max}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Logistics */}
      <div style={s.grid2}>
        <div>
          <label style={s.label}>Logistics Vendor</label>
          <input style={s.input} value={form.logistics_vendor}
            onChange={e => setForm({ ...form, logistics_vendor: e.target.value })}
            placeholder="DTDC, BlueDart…" />
        </div>
        <div>
          <label style={s.label}>Logistics Type</label>
          <input style={s.input} value={form.logistics_type}
            onChange={e => setForm({ ...form, logistics_type: e.target.value })}
            placeholder="Surface, Air…" />
        </div>
      </div>

      {/* Price */}
      <div>
        <label style={s.label}>Price (₹)</label>
        <input style={s.input} type="number" min="0" step="0.01" value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          placeholder="Cost for this send" />
      </div>

      {err && <p style={s.error}>{err}</p>}

      <div style={s.actions}>
        <button type="button" onClick={onClose} style={s.btnCancel}>Cancel</button>
        <button type="submit" disabled={saving} style={s.btnPrimary(saving)}>
          {saving ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}

/* ─── ProcessStepCard ─── */
export default function ProcessStepCard({ step, dispatches = [], stepStatus, orderSarees, locked, onSend, onComplete }) {
  const [modal, setModal] = useState(false);
  const [completing, setCompleting] = useState(null);
  const [sendHov, setSendHov] = useState(false);
  const c = stepColors[step];

  const handleComplete = async (dispatchId) => {
    setCompleting(dispatchId);
    try { await onComplete(step, dispatchId); }
    finally { setCompleting(null); }
  };

  const handleSend = async (payload) => { await onSend(step, payload); setModal(false); };

  const badgeStyle =
    stepStatus === "completed"  ? s.badgeDone :
    stepStatus === "in_process" ? s.badgeActive :
    s.badgePending;

  return (
    <>
      <div style={s.card(stepStatus === "in_process")}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.iconBox}>{c.icon}</div>
            <span style={s.title}>{step.replace("_", " ")}</span>
            {dispatches.length > 0 && (
              <span style={s.count}>
                ({dispatches.length} send{dispatches.length > 1 ? "s" : ""})
              </span>
            )}
          </div>
          <span style={badgeStyle}>{stepStatus}</span>
        </div>

        {/* Dispatch list */}
        {dispatches.length > 0 && (
          <div style={s.dispatchList}>
            {dispatches.map((d) => (
              <div key={d.id} style={s.dispatch}>
                <div style={s.dispatchTop}>
                  <span style={s.vendorName}>{d.vendor_name}</span>
                  <span style={d.status === "completed" ? s.badgeDone : s.badgeActive}>
                    {d.status}
                  </span>
                </div>

                <div style={s.pills}>
                  {d.sarees_sent?.map((sr, i) => (
                    <span key={i} style={s.pill}>
                      {sr.saree_type} × {sr.quantity}
                    </span>
                  ))}
                </div>

                <div style={s.metaRow}>
                  <div style={s.metaLeft}>
                    {d.price != null && <span style={s.metaItem}>₹{d.price}</span>}
                    {d.logistics_vendor && (
                      <span style={s.metaItem}>{d.logistics_vendor} · {d.logistics_type}</span>
                    )}
                  </div>
                  {!locked && d.status === "in_process" && (
                    <button
                      onClick={() => handleComplete(d.id)}
                      disabled={completing === d.id}
                      style={s.markDoneBtn}
                    >
                      {completing === d.id ? "…" : "Mark done ✓"}
                    </button>
                  )}
                  {d.status === "completed" && (
                    <span style={s.doneText}>
                      Done {d.completed_at ? new Date(d.completed_at).toLocaleDateString("en-IN") : ""}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Send button */}
        {!locked && (
          <button
            onClick={() => setModal(true)}
            style={s.sendBtn(sendHov)}
            onMouseEnter={() => setSendHov(true)}
            onMouseLeave={() => setSendHov(false)}
          >
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