import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NavItem = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${
        isActive
          ? "bg-orange-100 text-orange-600"
          : "text-gray-600 hover:bg-orange-50"
      }`
    }
  >
    <span>{icon}</span>
    <span>{label}</span>
  </NavLink>
);

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen">

      {/* Sidebar */}
      <div
        className={`fixed inset-0 z-40 ${
          sidebarOpen ? "block" : "hidden"
        } md:static md:block`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />

        <aside className="relative w-56 bg-white h-full border-r z-50 p-3">

          <div className="mb-4 font-semibold">Saree Studio</div>

          <nav className="space-y-1">
            <NavItem to="/dashboard" icon="📊" label="Dashboard" onClick={() => setSidebarOpen(false)} />
            <NavItem to="/clients" icon="👤" label="Clients" onClick={() => setSidebarOpen(false)} />
            <NavItem to="/orders" icon="📦" label="Orders" onClick={() => setSidebarOpen(false)} />
            <NavItem to="/vendors" icon="🏭" label="Vendors" onClick={() => setSidebarOpen(false)} />
          </nav>

          <div className="mt-6 space-y-2">
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded"
            >
              Logout
            </button>
          </div>
        </aside>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">

        {/* Top bar (mobile) */}
        <div className="md:hidden flex items-center p-3 border-b bg-white">
          <button onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <span className="ml-3 font-medium">Saree Studio</span>
        </div>

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}