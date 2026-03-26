import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getOrder,
  updateOrderStatus,
  sendToProcess,
  completeProcessStep,
  completeOrder,
} from "../../utils/api";
import { Spinner, Badge, Modal, useToast } from "../../components/UI";
import ProcessStepCard from "./ProcessStepCard";

const PROCESS_STEPS = ["gum", "polishing", "blouse_work"];

function CompleteOrderModal({ order, onComplete, onClose }) {
  const [form, setForm] = useState({ invoice_number: "", remarks: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const blocking = PROCESS_STEPS.filter((step) =>
    (order[step] || []).some((d) => d.status === "in_process")
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      await onComplete(form);
    } catch (e) {
      setErr(e.response?.data?.error || "Failed");
      setSaving(false);
    }
  };

  if (blocking.length > 0) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-red-600 text-sm font-medium mb-1">
            Cannot complete order
          </p>
          <p className="text-red-500 text-xs">
            Complete all process steps first:
            <strong> {blocking.join(", ")}</strong>
          </p>
        </div>
        <button onClick={onClose} className="w-full py-2 text-sm">
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        className="w-full border rounded-xl px-3 py-2 text-sm"
        placeholder="Invoice number"
        value={form.invoice_number}
        onChange={(e) =>
          setForm({ ...form, invoice_number: e.target.value })
        }
      />

      <textarea
        className="w-full border rounded-xl px-3 py-2 text-sm"
        rows={3}
        placeholder="Remarks"
        value={form.remarks}
        onChange={(e) =>
          setForm({ ...form, remarks: e.target.value })
        }
      />

      {err && <p className="text-red-500 text-sm">{err}</p>}

      <div className="flex justify-end gap-2">
        <button onClick={onClose} type="button">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-green-600 text-white shadow"
        >
          {saving ? "Completing…" : "Complete ✓"}
        </button>
      </div>
    </form>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show, ToastComponent } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completeModal, setCompleteModal] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await getOrder(id);
      setOrder(r.data);
    } catch {
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkPacking = async () => {
    await updateOrderStatus(id, "packing_completed");
    await load();
    show("Packing completed");
  };

  const handleSendProcess = async (step, payload) => {
    await sendToProcess(id, step, payload);
    await load();
    show(`Sent to ${step}`);
  };

  const handleCompleteStep = async (step, dispatchId) => {
    await completeProcessStep(id, step, dispatchId);
    await load();
    show("Step completed");
  };

  const handleCompleteOrder = async (form) => {
    await completeOrder(id, form);
    setCompleteModal(false);
    await load();
    show("Order completed");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (!order) return null;

  const totalQty =
    order.sarees?.reduce((s, x) => s + x.quantity, 0) || 0;

  const allProcessDone = PROCESS_STEPS.every((step) =>
    (order[step] || []).every((d) => d.status === "completed")
  );

  const canComplete =
    order.status === "packing_completed" &&
    allProcessDone &&
    !order.is_locked;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {ToastComponent}

      {/* HEADER */}
      <div className="flex justify-between mb-6">

        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 mb-1"
          >
            ← Back
          </button>

          <h1 className="text-2xl font-bold">{order.client_name}</h1>

          <div className="flex gap-2 mt-2">
            <Badge type={order.status} />
            <Badge type={order.order_type} />
          </div>
        </div>

        {!order.is_locked && (
          <div className="flex gap-2">
            {order.status === "order_pending" && (
              <button
                onClick={handleMarkPacking}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow"
              >
                📦 Packing
              </button>
            )}

            {canComplete && (
              <button
                onClick={() => setCompleteModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-xl shadow"
              >
                ✅ Complete
              </button>
            )}
          </div>
        )}
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* INFO */}
        <div className="bg-white/80 backdrop-blur border rounded-2xl p-4 shadow-md">
          <h2 className="font-semibold mb-3">Order Info</h2>

          <div className="space-y-2 text-sm">
            <p>Client: {order.client_name}</p>
            <p>Type: {order.order_type}</p>
            <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
            {order.invoice_number && <p>Invoice: {order.invoice_number}</p>}
          </div>
        </div>

        {/* STATUS */}
        <div className="bg-white/80 backdrop-blur border rounded-2xl p-4 shadow-md">
          <h2 className="font-semibold mb-3">Progress</h2>

          <div className="space-y-2 text-sm">
            <p>✔ Order Created</p>
            <p>✔ Packing</p>
            <p>✔ Completed</p>
          </div>
        </div>

        {/* SAREES */}
        <div className="md:col-span-2 bg-white/80 backdrop-blur border rounded-2xl p-4 shadow-md">
          <div className="flex justify-between mb-3">
            <h2 className="font-semibold">Sarees</h2>
            <span>{totalQty} pcs</span>
          </div>

          <div className="space-y-2">
            {order.sarees?.map((s, i) => (
              <div
                key={i}
                className="grid grid-cols-3 text-sm border-b pb-2"
              >
                <span>{s.saree_type}</span>
                <span>₹{s.price}</span>
                <span>{s.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PROCESS */}
        <div className="md:col-span-2 space-y-3">
          <h2 className="text-sm text-gray-500">Workflow</h2>

          {PROCESS_STEPS.map((step) => (
            <div
              key={step}
              className="bg-white/80 backdrop-blur border rounded-2xl p-4 shadow-sm hover:shadow-md transition"
            >
              <ProcessStepCard
                step={step}
                dispatches={order[step] || []}
                stepStatus={order[`${step}_status`] || "pending"}
                orderSarees={order.sarees || []}
                locked={order.is_locked}
                onSend={handleSendProcess}
                onComplete={handleCompleteStep}
              />
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      <Modal
        open={completeModal}
        onClose={() => setCompleteModal(false)}
        title="Complete Order"
      >
        <CompleteOrderModal
          order={order}
          onComplete={handleCompleteOrder}
          onClose={() => setCompleteModal(false)}
        />
      </Modal>
    </div>
  );
}