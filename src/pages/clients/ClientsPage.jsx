import React, { useEffect, useState, useCallback } from "react";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from "../../utils/api";
import {
  Modal,
  Spinner,
  EmptyState,
  PageHeader,
  ConfirmDialog,
  useToast,
} from "../../components/UI";

function ClientForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || "",
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
      <div>
        <label className="label">
          Name <span className="text-ruby-400">*</span>
        </label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Client name"
          autoFocus
        />
      </div>
      <div>
        <label className="label">Phone</label>
        <input
          className="input"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+91 98765 43210"
        />
      </div>
      <div>
        <label className="label">Address</label>
        <textarea
          className="input resize-none"
          rows={2}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Address"
        />
      </div>
      {err && <p className="text-ruby-400 text-sm">{err}</p>}
      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save Client"}
        </button>
      </div>
    </form>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | 'create' | {edit: client} | {delete: client}
  const { show, ToastComponent } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getClients(search);
      setClients(r.data);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleCreate = async (form) => {
    await createClient(form);
    setModal(null);
    show("Client created");
    load();
  };

  const handleUpdate = async (form) => {
    await updateClient(modal.edit.id, form);
    setModal(null);
    show("Client updated");
    load();
  };

  const handleDelete = async () => {
    await deleteClient(modal.delete.id);
    setModal(null);
    show("Client deleted", "error");
    load();
  };

return (
  <div className="p-4 md:p-6 max-w-5xl mx-auto">
    {ToastComponent}

    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-xl font-semibold">Clients</h1>
        <p className="text-sm text-gray-500">
          {clients.length} client{clients.length !== 1 ? "s" : ""}
        </p>
      </div>
      <button
        onClick={() => setModal("create")}
        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm transition"
      >
        + Add
      </button>
    </div>

    {/* Search */}
    <div className="mb-4">
      <input
        className="w-full max-w-sm border rounded-lg px-3 py-2 text-sm"
        placeholder="Search clients…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>

    {/* List */}
    <div className="bg-white border rounded-xl shadow-sm">
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No clients found
        </div>
      ) : (
        <div className="divide-y">
          {clients.map((c) => (
            <div
              key={c.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
            >
              <div className="flex-1">
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-gray-500">
                  {c.phone || "No phone"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {c.address || "No address"}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setModal({ edit: c })}
                  className="text-sm px-3 py-1 border rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => setModal({ delete: c })}
                  className="text-sm px-3 py-1 border rounded text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Modals (keep same) */}
    <Modal open={modal === "create"} onClose={() => setModal(null)} title="New Client">
      <ClientForm onSave={handleCreate} onCancel={() => setModal(null)} />
    </Modal>

    <Modal open={!!modal?.edit} onClose={() => setModal(null)} title="Edit Client">
      {modal?.edit && (
        <ClientForm
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
      title="Delete Client"
      message={`Delete "${modal?.delete?.name}"?`}
      danger
    />
  </div>
);
}