import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Truck, Bell, Menu, X } from "lucide-react";

const Layout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: "form", label: "Service Intake", path: "/", icon: <ClipboardList size={20} /> },
    { id: "reports", label: "Fleet Intelligence", path: "/reports", icon: <LayoutDashboard size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">

      {/* 🔥 MOBILE OVERLAY */}
      {/* Adds a smooth fade-in backdrop when the sidebar is open on phones */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 🔥 SIDEBAR (TT Xpress Dark Theme) */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#22212f] text-white p-6 z-50 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"} 
        md:translate-x-0 md:flex flex-col border-r border-slate-800/50`}
      >
        {/* Top: Logo & Branding */}
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-xl shadow-lg shadow-red-600/30">
              <Truck size={22} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-widest text-white">TT XPRESS</span>
          </div>

          {/* Close button (mobile) */}
          <button
            className="md:hidden text-slate-400 hover:text-white transition-colors p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 space-y-2.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/25 translate-x-1"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <div className={`${isActive ? "text-white" : "text-slate-500"}`}>
                  {item.icon}
                </div>
                <span className="font-bold text-sm tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Server Status */}
        <div className="pt-6 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-300">System Online</span>
              <span className="text-[10px] text-slate-500">Secure Connection</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 🔥 MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 transition-all duration-300 flex flex-col min-h-screen">

        {/* 🔥 HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30">

          {/* LEFT: Mobile Hamburger & Page Title */}
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-slate-600 hover:text-red-600 transition-colors p-1"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={26} />
            </button>

            <h2 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">
              {location.pathname === "/" ? "Vehicle Intake Portal" : "Analytics Dashboard"}
            </h2>
          </div>

          {/* RIGHT: Notifications & User */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50">
              <Bell size={20} />
              {/* Notification Dot */}
              <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            {/* Dummy User Avatar for SaaS feel */}
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm border-2 border-white shadow-sm">
                AD
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">Admin Desk</span>
                <span className="text-[10px] text-slate-500">Service Manager</span>
              </div>
            </div>
          </div>
        </header>

        {/* 🔥 DYNAMIC PAGE CONTENT */}
        {/* Removed max-w constraints so the Dashboard and Form dictate their own widths perfectly */}
        <div className="flex-1 p-0">
          <Outlet />
        </div>
        
      </main>
    </div>
  );
};

export default Layout;  
