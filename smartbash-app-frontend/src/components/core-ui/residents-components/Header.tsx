"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaSignOutAlt } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const defaultProfile =
    "https://ui-avatars.com/api/?name=User&background=E5E7EB&color=111827&size=256";

  const [profileImage, setProfileImage] = useState(defaultProfile);
  const [fullName, setFullName] = useState("User");

  /* ================= LOAD PROFILE ================= */
  useEffect(() => {
    const loadProfile = () => {
      const savedImage = localStorage.getItem("residentProfileImage");
      const savedName = localStorage.getItem("residentFullName");

      if (savedImage && savedImage !== "null") {
        setProfileImage(savedImage);
      }

      if (savedName && savedName.trim() !== "") {
        setFullName(savedName);
      }
    };

    loadProfile();

    window.addEventListener("profileUpdated", loadProfile);

    return () => {
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

          {/* CLICKABLE PROFILE */}
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

            <span className="text-sm text-gray-700">
              {fullName}
            </span>
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
