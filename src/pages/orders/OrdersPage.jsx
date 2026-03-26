import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../../utils/api";
import { Spinner, Badge } from "../../components/UI";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "order_pending", label: "Pending" },
  { value: "packing_completed", label: "Packing Done" },
  { value: "completed", label: "Completed" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.client_name = search.trim();
      const r = await getOrders(params);
      setOrders(r.data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-gray-600 text-sm">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Link
          to="/orders/new"
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition"
        >
          + New Order
        </Link>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">

        {/* Status */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-1.5 text-sm rounded-xl transition ${
                statusFilter === f.value
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          className="w-full sm:max-w-xs border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
          placeholder="🔍 Search client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Content Container */}
      <div className="bg-white/80 backdrop-blur border rounded-2xl shadow-md p-4">

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-500">
            <div className="text-5xl mb-3">📦</div>
            <p className="font-medium">No orders found</p>
            <p className="text-sm">Try changing filters or create a new order</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {orders.map((order) => {
              const totalQty =
                order.sarees?.reduce((s, x) => s + x.quantity, 0) || 0;

              return (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="p-4 border rounded-2xl bg-white shadow-sm hover:shadow-md transition duration-200 hover:scale-[1.02]"
                >

                  {/* Top */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {order.client_name}
                      </p>

                      {order.reference_name && (
                        <p className="text-xs text-gray-500">
                          Ref: {order.reference_name}
                        </p>
                      )}
                    </div>

                    <Badge type={order.status} />
                  </div>

                  {/* Meta */}
                  <div className="text-xs text-gray-500 mb-3">
                    📅{" "}
                    {new Date(order.created_at).toLocaleDateString("en-IN")}
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 font-medium">
                      {totalQty} pcs
                    </span>

                    <span className="text-xs text-gray-400">
                      View →
                    </span>
                  </div>
                </Link>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
}