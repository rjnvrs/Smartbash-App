"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "../../ui/SearchBar";
import { Bell } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface TopbarProps {
  onSearch?: (value: string) => void;
}

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  status: string;
  createdAt: string;
};

export default function Topbar({ onSearch }: TopbarProps) {
  const router = useRouter();

  const [searchValue, setSearchValue] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [brgyName, setBrgyName] = useState("Barangay Official");
  const [email, setEmail] = useState("official@gmail.com");
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [openNotifications, setOpenNotifications] = useState(false);

  const fallbackAvatar = useMemo(() => {
    const label = (brgyName || email || "Official").trim();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=E5E7EB&color=111827&size=256`;
  }, [brgyName, email]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const goToSettings = () => {
    router.push("/dashboards/officials/settings");
  };

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const res = await apiFetch("/auth/officials/profile/", { method: "GET" });
        const data = await res.json();
        if (!res.ok) return;
        const profile = data?.profile || {};
        const profileEmail = (profile.email || "").trim().toLowerCase();
        const key = profileEmail ? `officialProfileImage:${profileEmail}` : "officialProfileImage";
        const savedImage = localStorage.getItem(key);
        if (!cancelled) {
          setBrgyName(profile.name || "Barangay Official");
          setEmail(profile.email || "official@gmail.com");
          setProfileImage(savedImage || "");
        }
      } catch {
        // keep defaults
      }
    };

    const loadNotifications = async () => {
      try {
        const res = await apiFetch("/auth/officials/notifications/", { method: "GET" });
        const data = await res.json();
        if (!res.ok) return;
        if (!cancelled) {
          setUnreadCount(data?.unreadCount || 0);
          setNotifications(data?.notifications || []);
        }
      } catch {
        // ignore polling errors
      }
    };

    loadProfile();
    loadNotifications();

    const onProfileUpdate = () => loadProfile();
    window.addEventListener("profileUpdated", onProfileUpdate);

    const timer = setInterval(() => {
      loadProfile();
      loadNotifications();
    }, 8000);

    return () => {
      cancelled = true;
      window.removeEventListener("profileUpdated", onProfileUpdate);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="mt-16">
      <div className="flex flex-wrap items-center justify-between px-4 py-4 bg-white border-b gap-4">
        <div className="flex-1 min-w-[250px] lg:max-w-xl">
          <SearchBar value={searchValue} onSearch={handleSearch} />
        </div>

        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => setOpenNotifications((prev) => !prev)}
            className="h-10 w-10 border rounded-md flex items-center justify-center hover:bg-gray-100 transition relative"
          >
            <Bell className="h-5 w-5 opacity-70" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] leading-5 text-center font-semibold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {openNotifications && (
            <div className="absolute right-0 top-12 z-50 w-96 max-h-96 overflow-auto bg-white border rounded-xl shadow-lg">
              <div className="px-4 py-3 border-b font-semibold">Notifications</div>
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-sm text-gray-500">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 border-b last:border-b-0">
                    <div className="text-sm font-medium">{n.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{n.message}</div>
                    <div className="text-[11px] text-gray-500 mt-1">
                      {n.status}  -  {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div
            onClick={goToSettings}
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition"
          >
            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-300">
              <img src={profileImage || fallbackAvatar} alt="Profile" className="w-full h-full object-cover" />
            </div>

            <div className="text-sm hidden sm:block leading-tight">
              <div className="font-medium truncate max-w-[160px]">{brgyName}</div>
              <div className="text-gray-500 text-xs truncate max-w-[180px]">{email}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

