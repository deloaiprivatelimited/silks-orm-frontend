import React, { useEffect, useState, useCallback } from "react";
import { getVendors, createVendor, updateVendor, deleteVendor } from "../../utils/api";
import { Modal, Spinner, ConfirmDialog, Badge, useToast } from "../../components/UI";

const PROCESS_TYPES = ["gum", "polishing", "blouse_work"];

function VendorForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    process_type: initial.process_type || "gum",
    phone: initial.phone || "",
    address: initial.address || "",
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setErr("Name is required");

    setSaving(true);
    setErr("");

    try {
      await onSave(form);
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
        placeholder="Vendor name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <select
        className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
        value={form.process_type}
        onChange={(e) => setForm({ ...form, process_type: e.target.value })}
      >
        {PROCESS_TYPES.map((t) => (
          <option key={t} value={t}>
            {t.replace("_", " ")}
          </option>
        ))}
      </select>

      <input
        className="w-full border rounded-xl px-3 py-2 text-sm"
        placeholder="Phone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />

      <textarea
        className="w-full border rounded-xl px-3 py-2 text-sm"
        rows={2}
        placeholder="Address"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />

      {err && <p className="text-red-500 text-sm">{err}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} type="button" className="px-4 py-2 text-sm">
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow hover:shadow-lg transition"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [modal, setModal] = useState(null);
  const { show, ToastComponent } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getVendors(filterType);
      setVendors(r.data);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (form) => {
    await createVendor(form);
    setModal(null);
    show("Vendor created");
    load();
  };

  const handleUpdate = async (form) => {
    await updateVendor(modal.edit.id, form);
    setModal(null);
    show("Vendor updated");
    load();
  };

  const handleDelete = async () => {
    await deleteVendor(modal.delete.id);
    setModal(null);
    show("Vendor deleted", "error");
    load();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {ToastComponent}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
          <p className="text-gray-600 text-sm">
            Manage your vendor network
          </p>
        </div>

        <button
          onClick={() => setModal("create")}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition"
        >
          + Add Vendor
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["", ...PROCESS_TYPES].map((t) => (
          <button
            key={t || "all"}
            onClick={() => setFilterType(t)}
            className={`px-4 py-1.5 rounded-xl text-sm transition ${
              filterType === t
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {t ? t.replace("_", " ") : "All"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white/80 backdrop-blur border rounded-2xl shadow-md p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : vendors.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-500">
            <div className="text-5xl mb-3">📦</div>
            <p className="font-medium">No vendors yet</p>
            <p className="text-sm">Add your first vendor to get started</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((v) => (
              <div
                key={v.id}
                className="p-4 border rounded-2xl bg-white shadow-sm hover:shadow-md transition duration-200 hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{v.name}</p>
                    <p className="text-sm text-gray-600">
                      📞 {v.phone || "No phone"}
                    </p>
                  </div>
                  <Badge type={v.process_type} />
                </div>

                <p className="text-xs text-gray-400 mb-4 truncate">
                  {v.address || "No address"}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setModal({ edit: v })}
                    className="flex-1 text-sm py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() => setModal({ delete: v })}
                    className="flex-1 text-sm py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal open={modal === "create"} onClose={() => setModal(null)} title="New Vendor">
        <VendorForm onSave={handleCreate} onCancel={() => setModal(null)} />
      </Modal>

      <Modal open={!!modal?.edit} onClose={() => setModal(null)} title="Edit Vendor">
        {modal?.edit && (
          <VendorForm
            initial={modal.edit}
            onSave={handleUpdate}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!modal?.delete}
        onClose={() => setModal(null)}
        onConfirm={handleDelete}
        title="Delete Vendor"
        message={`Delete "${modal?.delete?.name}"?`}
        danger
      />
    </div>
  );
}