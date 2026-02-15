"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  FileText,
  Bot,
  Briefcase,
  Users,
  PanelLeft,
  Settings,
  Menu,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboards/officials" },
    { name: "Incident Map", icon: MapPin, href: "/dashboards/officials/incident-map" },
    { name: "All Reports", icon: FileText, href: "/dashboards/officials/all-reports" },
    { name: "AI Assistant", icon: Bot, href: "/dashboards/officials/ai-assistant" },
    { name: "Services", icon: Briefcase, href: "/dashboards/officials/services" },
    { name: "Residents Approval", icon: Users, href: "/dashboards/officials/residents-approval" },
    { name: "Settings", icon: Settings, href: "/dashboards/officials/settings" },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[1900] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:relative z-[2000]
          h-screen bg-white border-r px-5 py-8 flex flex-col
          transition-all duration-300
          ${collapsed ? "md:w-20 w-20" : "md:w-64 w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="mb-20 flex items-center justify-between">
          {!collapsed && <img src="/logo.png" alt="Logo" className="h-14 w-auto object-contain" />}

          <button
            onClick={() => (window.innerWidth < 768 ? setMobileOpen(false) : setCollapsed(!collapsed))}
            className={`h-9 w-9 border rounded-xl flex items-center justify-center hover:bg-gray-100 transition ${
              collapsed ? "mx-auto" : ""
            }`}
          >
            <PanelLeft className={`h-5 w-5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="space-y-8 text-base text-gray-700 flex-1">
          {menu.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} onClick={() => setMobileOpen(false)}>
                <div
                  className={`group flex items-center gap-5 cursor-pointer px-4 py-3.5 rounded-xl transition ${
                    active ? "bg-green-50" : "hover:bg-gray-50"
                  } ${collapsed ? "justify-center px-3" : ""}`}
                >
                  <item.icon
                    className={`h-6 w-6 min-h-6 min-w-6 transition ${
                      active ? "text-green-700" : "text-gray-500 group-hover:text-gray-900"
                    }`}
                  />

                  {!collapsed && (
                    <span
                      className={`font-medium ${
                        active ? "text-green-700" : "text-gray-600 group-hover:text-gray-900"
                      }`}
                    >
                      {item.name}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <Link href="/" className="block mt-auto">
          <button className="w-full border rounded-xl py-3 text-base text-gray-600 hover:bg-gray-100 transition flex items-center justify-center gap-2">
            {collapsed ? <LogOut className="h-4 w-4" /> : "Logout"}
          </button>
        </Link>
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-[1800] md:hidden bg-white border rounded-xl h-10 w-10 flex items-center justify-center"
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  );
}
