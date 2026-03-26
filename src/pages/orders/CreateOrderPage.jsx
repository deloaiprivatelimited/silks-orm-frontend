import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getClients, createOrder } from "../../utils/api";
import { Spinner } from "../../components/UI";

const ORDER_TYPES = ["call", "whatsapp", "store_visit", "reference"];

export default function CreateOrderPage() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingClients, setLoadingClients] = useState(false);

  const [form, setForm] = useState({
    client_id: "",
    order_type: "call",
    reference_name: "",
    sarees: [{ saree_type: "", price: "", quantity: 1 }],
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setLoadingClients(true);
    getClients(search)
      .then((r) => setClients(r.data))
      .finally(() => setLoadingClients(false));
  }, [search]);

  const selectedClient = clients.find(c => c.id === form.client_id);

  const addSaree = () =>
    setForm({
      ...form,
      sarees: [...form.sarees, { saree_type: "", price: "", quantity: 1 }],
    });

  const updateSaree = (i, field, value) => {
    const updated = [...form.sarees];
    updated[i][field] = value;
    setForm({ ...form, sarees: updated });
  };

  const removeSaree = (i) =>
    setForm({
      ...form,
      sarees: form.sarees.filter((_, idx) => idx !== i),
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.client_id) return setErr("Select a client");

    setSaving(true);
    try {
      const res = await createOrder(form);
      navigate(`/orders/${res.data.id}`);
    } catch (e) {
      setErr("Failed to create order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* HEADER */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold tracking-tight">
          Create Order
        </h1>

        <p className="text-gray-600 text-sm">
          Add client and order details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* CLIENT */}
        <div className="bg-white/80 backdrop-blur border rounded-2xl p-5 shadow-md">

          <h2 className="font-semibold mb-3">Client</h2>

          <input
            className="w-full border rounded-xl px-3 py-2 mb-3 focus:ring-2 focus:ring-orange-400 outline-none"
            placeholder="Search client..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setForm({ ...form, client_id: "" });
            }}
          />

          {selectedClient ? (
            <div className="flex justify-between items-center bg-orange-50 border border-orange-200 rounded-xl p-3">
              <div>
                <p className="font-medium">{selectedClient.name}</p>
                <p className="text-xs text-gray-500">
                  {selectedClient.phone}
                </p>
              </div>

              <button
                onClick={() => setForm({ ...form, client_id: "" })}
                type="button"
                className="text-sm text-orange-600"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="border rounded-xl max-h-48 overflow-y-auto">
              {loadingClients ? (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" />
                </div>
              ) : (
                clients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, client_id: c.id })
                    }
                    className="w-full text-left px-3 py-2 hover:bg-gray-50"
                  >
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-gray-500">
                      {c.phone}
                    </p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* ORDER TYPE */}
        <div className="bg-white/80 backdrop-blur border rounded-2xl p-5 shadow-md">

          <h2 className="font-semibold mb-3">Order Type</h2>

          <div className="flex gap-2 flex-wrap">
            {ORDER_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, order_type: t })}
                className={`px-4 py-1.5 rounded-xl text-sm capitalize transition ${
                  form.order_type === t
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {t.replace("_", " ")}
              </button>
            ))}
          </div>

          <input
            className="w-full mt-3 border rounded-xl px-3 py-2 text-sm"
            placeholder="Reference name"
            value={form.reference_name}
            onChange={(e) =>
              setForm({ ...form, reference_name: e.target.value })
            }
          />
        </div>

        {/* SAREES */}
        <div className="bg-white/80 backdrop-blur border rounded-2xl p-5 shadow-md">

          <div className="flex justify-between mb-4">
            <h2 className="font-semibold">Sarees</h2>

            <button
              type="button"
              onClick={addSaree}
              className="text-sm text-orange-600"
            >
              + Add
            </button>
          </div>

          <div className="space-y-3">
            {form.sarees.map((s, i) => (
              <div
                key={i}
                className="grid grid-cols-4 gap-2 items-center bg-gray-50 p-3 rounded-xl"
              >
                <input
                  placeholder="Type"
                  className="border rounded-lg px-2 py-1 text-sm col-span-2"
                  value={s.saree_type}
                  onChange={(e) =>
                    updateSaree(i, "saree_type", e.target.value)
                  }
                />

                <input
                  type="number"
                  placeholder="₹"
                  className="border rounded-lg px-2 py-1 text-sm"
                  value={s.price}
                  onChange={(e) =>
                    updateSaree(i, "price", e.target.value)
                  }
                />

                <input
                  type="number"
                  className="border rounded-lg px-2 py-1 text-sm"
                  value={s.quantity}
                  onChange={(e) =>
                    updateSaree(i, "quantity", e.target.value)
                  }
                />

                {form.sarees.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSaree(i)}
                    className="text-red-500 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 text-right text-sm text-gray-600">
            Total:{" "}
            <span className="font-semibold">
              {form.sarees.reduce(
                (s, x) => s + (parseInt(x.quantity) || 0),
                0
              )} pcs
            </span>
          </div>
        </div>

        {/* ERROR */}
        {err && (
          <div className="text-red-600 text-sm">{err}</div>
        )}

        {/* ACTIONS */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-2 rounded-xl bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow"
          >
            {saving ? "Creating…" : "Create Order"}
          </button>
        </div>

      </form>
    </div>
  );
}