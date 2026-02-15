"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaSignOutAlt } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [profileImage, setProfileImage] = useState("");
  const [fullName, setFullName] = useState("User");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const res = await apiFetch("/auth/residents/profile/", { method: "GET" });
        const data = await res.json();
        if (res.ok) {
          const p = data?.profile || {};
          const name = `${p.firstName || ""} ${p.middleName || ""} ${p.lastName || ""}`
            .replace(/\s+/g, " ")
            .trim();
          const email = (p.email || "").trim().toLowerCase();
          const key = email ? `residentProfileImage:${email}` : "residentProfileImage";
          const savedImage = localStorage.getItem(key);

          if (!cancelled) {
            if (name) setFullName(name);
            setProfileImage(savedImage || "");
          }
        }
      } catch {
        // ignore and keep fallback
      }
    };

    loadProfile();
    window.addEventListener("profileUpdated", loadProfile);

    return () => {
      cancelled = true;
      window.removeEventListener("profileUpdated", loadProfile);
    };
  }, []);

  const handleLogout = () => {
    router.push("/");
  };

  const tabClass = (active: boolean) =>
    `pb-2 font-medium ${
      active
        ? "border-b-2 border-green-600 text-green-700"
        : "text-gray-600 hover:text-black transition"
    }`;

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div
            onClick={() => router.push("/dashboards/residents/settings")}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-300">
              <img src={profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || "User")}&background=E5E7EB&color=111827&size=256`} alt="Profile" className="w-full h-full object-cover" />
            </div>

            <span className="text-sm text-gray-700">{fullName}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 border px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>

        <nav className="flex gap-10 mt-6">
          <Link href="/dashboards/residents" className={tabClass(pathname === "/dashboards/residents")}>
            Report Incidents
          </Link>

          <Link
            href="/dashboards/residents/reports"
            className={tabClass(pathname.startsWith("/dashboards/residents/reports"))}
          >
            Reports
          </Link>

          <Link
            href="/dashboards/residents/news-feed"
            className={tabClass(pathname.startsWith("/dashboards/residents/news-feed"))}
          >
            News Feed
          </Link>
        </nav>
      </div>
    </header>
  );
}
