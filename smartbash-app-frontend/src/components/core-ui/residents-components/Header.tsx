"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaSignOutAlt } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { clearAuthTokens } from "@/lib/auth.client";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const defaultProfile =
    "https://ui-avatars.com/api/?name=User&background=E5E7EB&color=111827&size=256";

  const [profileImage, setProfileImage] = useState(defaultProfile);
  const [fullName, setFullName] = useState("User");

  const loadProfile = async () => {
    try {
      const res = await apiFetch("/auth/residents/profile/", { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error();
      const profile = data?.profile || {};
      const name = [profile.firstName, profile.middleName, profile.lastName]
        .filter((v: string) => typeof v === "string" && v.trim().length > 0)
        .join(" ")
        .trim();
      setFullName(name || "Resident");
      if (profile.avatarUrl) {
        setProfileImage(profile.avatarUrl);
      } else {
        setProfileImage(
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            name || "Resident"
          )}&background=E5E7EB&color=111827&size=256`
        );
      }
    } catch {
      setFullName("Resident");
      setProfileImage(defaultProfile);
    }
  };

  useEffect(() => {
    void loadProfile();
    const onProfileUpdated = () => {
      void loadProfile();
    };
    window.addEventListener("profileUpdated", onProfileUpdated);
    return () => {
      window.removeEventListener("profileUpdated", onProfileUpdated);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout/", { method: "POST" });
    } catch {
      // ignore
    } finally {
      clearAuthTokens();
      router.replace("/login");
    }
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
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            <span className="text-sm text-gray-700">{fullName}</span>
          </div>

          <button
            onClick={() => void handleLogout()}
            className="flex items-center gap-2 border px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>

        <nav className="flex gap-10 mt-6">
          <Link
            href="/dashboards/residents"
            className={tabClass(pathname === "/dashboards/residents")}
          >
            Report Incidents
          </Link>

          <Link
            href="/dashboards/residents/reports"
            className={tabClass(
              pathname.startsWith("/dashboards/residents/reports")
            )}
          >
            Reports
          </Link>

          <Link
            href="/dashboards/residents/news-feed"
            className={tabClass(
              pathname.startsWith("/dashboards/residents/news-feed")
            )}
          >
            News Feed
          </Link>
        </nav>
      </div>
    </header>
  );
}
