"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "../../ui/SearchBar";
import { Bell } from "lucide-react";

interface TopbarProps {
  onSearch?: (value: string) => void;
}

export default function Topbar({ onSearch }: TopbarProps) {
  const router = useRouter();

  const defaultProfile =
    "https://ui-avatars.com/api/?name=Official&background=E5E7EB&color=111827&size=256";

  const [searchValue, setSearchValue] = useState("");
  const [profileImage, setProfileImage] = useState(defaultProfile);
  const [brgyName, setBrgyName] = useState("Barangay Official");

  // ✅ ADDED EMAIL STATE
  const [email, setEmail] = useState("official@gmail.com");

  /* ================= SEARCH ================= */
  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  /* ================= NAVIGATE ================= */
  const goToSettings = () => {
    router.push("/dashboards/officials/settings");
  };

  /* ================= LOAD + LISTEN ================= */
  useEffect(() => {
    const loadProfile = () => {
      const savedImage = localStorage.getItem("profileImage");
      const savedName = localStorage.getItem("brgyName");
      const savedEmail = localStorage.getItem("brgyEmail"); // ✅ ADDED

      if (savedImage) setProfileImage(savedImage);
      if (savedName) setBrgyName(savedName);
      if (savedEmail) setEmail(savedEmail); // ✅ ADDED
    };

    // Load on mount
    loadProfile();

    // Listen for changes
    window.addEventListener("profileUpdated", loadProfile);

    return () => {
      window.removeEventListener("profileUpdated", loadProfile);
    };
  }, []);

  return (
    <div className="mt-16">
      <div className="flex flex-wrap items-center justify-between px-4 py-4 bg-white border-b gap-4">

        {/* SEARCH */}
        <div className="flex-1 min-w-[250px] lg:max-w-xl">
          <SearchBar value={searchValue} onSearch={handleSearch} />
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3">

          {/* BELL */}
          <button className="h-10 w-10 border rounded-md flex items-center justify-center hover:bg-gray-100 transition">
            <Bell className="h-5 w-5 opacity-70" />
          </button>

          {/* PROFILE CLICKABLE AREA */}
          <div
            onClick={goToSettings}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition"
          >
            {/* PROFILE IMAGE */}
            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-300">
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            {/* TEXT INFO */}
            <div className="text-sm hidden sm:block leading-tight">
              <div className="font-medium truncate max-w-[140px]">
                {brgyName}
              </div>
              <div className="text-gray-500 text-xs truncate max-w-[140px]">
                {email} {/* ✅ NOW DYNAMIC */}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
