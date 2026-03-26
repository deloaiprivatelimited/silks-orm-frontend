import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../utils/api";
import { Spinner, Badge } from "../components/UI";

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then((r) => setOrders(r.data))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "order_pending").length,
    completed: orders.filter((o) => o.status === "completed").length,
    inProcess: orders.filter((o) =>
      ["gum", "polishing", "blouse_work"].some(
        (s) => o[s]?.status === "in_process"
      )
    ).length,
  };

  const recent = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6);

  const StatCard = ({ label, value }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border flex flex-col">
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      {loading ? (
        <div className="h-6 w-10 bg-gray-200 rounded mt-2 animate-pulse" />
      ) : (
        <p className="text-2xl font-semibold mt-1">{value}</p>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Overview of your saree business
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Orders" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="In Process" value={stats.inProcess} />
        <StatCard label="Completed" value={stats.completed} />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Link
          to="/orders/new"
          className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition"
        >
          <p className="text-lg font-medium">+ New Order</p>
          <p className="text-sm text-gray-500 mt-1">
            Create a new saree order
          </p>
        </Link>

        <Link
          to="/clients"
          className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition"
        >
          <p className="text-lg font-medium">👤 Manage Clients</p>
          <p className="text-sm text-gray-500 mt-1">
            View and edit client list
          </p>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border rounded-xl shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-medium">Recent Orders</h2>
          <Link to="/orders" className="text-sm text-orange-600 hover:text-orange-700 transition">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No orders yet
          </div>
        ) : (
          <div className="divide-y">
            {recent.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {order.client_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Badge type={order.order_type} />
                  <Badge type={order.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}