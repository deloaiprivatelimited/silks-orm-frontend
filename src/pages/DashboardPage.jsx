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

  const StatCard = ({ label, value, color }) => (
    <div className="bg-white/80 backdrop-blur border rounded-2xl p-5 shadow-md hover:shadow-lg transition">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      {loading ? (
        <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
      ) : (
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-600 text-sm">
          Overview of your saree business
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Orders" value={stats.total} color="text-gray-900" />
        <StatCard label="Pending" value={stats.pending} color="text-orange-600" />
        <StatCard label="In Process" value={stats.inProcess} color="text-blue-600" />
        <StatCard label="Completed" value={stats.completed} color="text-green-600" />
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">

        <Link
          to="/orders/new"
          className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5 rounded-2xl shadow-md hover:shadow-lg transition"
        >
          <p className="text-lg font-semibold">+ New Order</p>
          <p className="text-sm opacity-90 mt-1">
            Create a new saree order
          </p>
        </Link>

        <Link
          to="/clients"
          className="group bg-white border rounded-2xl p-5 shadow-md hover:shadow-lg transition"
        >
          <p className="text-lg font-semibold">👤 Clients</p>
          <p className="text-sm text-gray-500 mt-1">
            Manage your client list
          </p>
        </Link>

      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white/80 backdrop-blur border rounded-2xl shadow-md">

        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold">Recent Orders</h2>

          <Link
            to="/orders"
            className="text-sm text-orange-600 hover:text-orange-700"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-500">
            <div className="text-4xl mb-2">📦</div>
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="divide-y">

            {recent.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
              >

                <div>
                  <p className="font-medium text-sm">
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