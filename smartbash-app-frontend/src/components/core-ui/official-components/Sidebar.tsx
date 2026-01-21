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
} from "lucide-react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/officials" },
    { name: "Incident Map", icon: MapPin, href: "/officials/incident-map" },
    { name: "All Reports", icon: FileText, href: "/officials/all-reports" },
    { name: "AI Assistant", icon: Bot, href: "/officials/ai-assistant" },
    { name: "Services", icon: Briefcase, href: "/officials/services" },
    { name: "Residents Approval", icon: Users, href: "/officials/residents-approval" },
  ];

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:relative z-50
          h-screen bg-white border-r px-5 py-8 flex flex-col
          transition-all duration-300
          ${collapsed ? "md:w-20" : "md:w-64"}
          w-64
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* TOP LOGO + TOGGLE */}
        <div className="mb-20 flex items-center justify-between">
          {!collapsed && (
            <img
              src="/logo.png"
              alt="Logo"
              className="h-14 w-auto object-contain"
            />
          )}

          <button
            onClick={() =>
              window.innerWidth < 768
                ? setMobileOpen(false)
                : setCollapsed(!collapsed)
            }
            className={`h-9 w-9 border rounded-xl flex items-center justify-center hover:bg-gray-100 transition ${
              collapsed ? "mx-auto" : ""
            }`}
          >
            <PanelLeft
              className={`h-5 w-5 transition-transform ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* MENU */}
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
                    className={`h-6 w-6 transition ${
                      active
                        ? "text-green-700"
                        : "text-gray-500 group-hover:text-gray-900"
                    }`}
                  />

                  {!collapsed && (
                    <span
                      className={`font-medium ${
                        active
                          ? "text-green-700"
                          : "text-gray-600 group-hover:text-gray-900"
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

        {/* LOGOUT */}
        <Link href="/" className="block mt-auto">
          <button className="w-full border rounded-xl py-3 text-base text-gray-600 hover:bg-gray-100 transition">
            {!collapsed ? "Logout" : "⎋"}
          </button>
        </Link>
      </aside>

      {/* MOBILE OPEN BUTTON */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-30 md:hidden bg-white border rounded-xl h-10 w-10 flex items-center justify-center"
      >
        ☰
      </button>
    </>
  );
}
