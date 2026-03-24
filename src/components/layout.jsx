import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Truck, Bell, Menu, X } from "lucide-react";

const Layout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: "form", label: "Service Intake", path: "/", icon: <ClipboardList size={20} /> },
    { id: "reports", label: "Fleet Reports", path: "/reports", icon: <LayoutDashboard size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-200">

      {/* 🔥 MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 🔥 SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white p-6 z-50 
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:flex flex-col shadow-2xl`}
      >
        {/* Top */}
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <Truck size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">FleetMaster</span>
          </div>

          {/* Close button (mobile) */}
          <button
            className="md:hidden text-slate-400"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="pt-6 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 text-sm text-slate-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Server: Connected</span>
          </div>
        </div>
      </aside>

      {/* 🔥 MAIN */}
      <main className="flex-1 md:ml-64 transition-all duration-300">

        {/* 🔥 HEADER */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">

          {/* LEFT */}
          <div className="flex items-center gap-3">
            {/* Hamburger */}
            <button
              className="md:hidden text-slate-600"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <h2 className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-widest">
              {location.pathname === "/" ? "Vehicle Intake" : "Analytics Dashboard"}
            </h2>
          </div>

          {/* RIGHT */}
          <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        {/* 🔥 CONTENT */}
        <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;