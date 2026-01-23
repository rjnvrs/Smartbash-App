"use client";

import { LogOut, Bell, User, Settings, CheckCircle, XCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminHeader() {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    router.push("/login");
  };

  const notifications = [
    {
      id: 1,
      title: "New Approval Request",
      description: "Donita Rose Seguerra is waiting for approval",
      time: "2 minutes ago",
      type: "pending",
      unread: true,
    },
    {
      id: 2,
      title: "Account Approved",
      description: "Juan Dela Cruz has been approved",
      time: "1 hour ago",
      type: "approved",
      unread: true,
    },
    {
      id: 3,
      title: "Account Removed",
      description: "Maria Santos has been removed",
      time: "3 hours ago",
      type: "removed",
      unread: false,
    },
    {
      id: 4,
      title: "New Registration",
      description: "Pedro Martinez registered as Service Provider",
      time: "5 hours ago",
      type: "pending",
      unread: false,
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "pending":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "removed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "pending":
        return "bg-orange-50 border-l-orange-500";
      case "approved":
        return "bg-green-50 border-l-green-500";
      case "removed":
        return "bg-red-50 border-l-red-500";
      default:
        return "bg-gray-50 border-l-gray-500";
    }
  };

  return (
    <>
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 text-gray-800 px-6 md:px-8 py-5 md:py-6 flex items-center shadow-sm relative">
        <div className="flex-1 flex items-center gap-3">
          <div className="hidden md:flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Smartbash Admin</h1>
            <p className="text-sm text-gray-700">
              Signed in as <span className="text-blue-600">John Doe</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-xs rounded-full flex items-center justify-center text-white">
                {notifications.filter(n => n.unread).length}
              </span>
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-40 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <span className="text-sm text-blue-600 cursor-pointer hover:underline">
                      Mark all as read
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    You have {notifications.filter(n => n.unread).length} unread notifications
                  </p>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${getNotificationColor(notification.type)} border-l-4`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            {notification.unread && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                          <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={() => router.push("/admin/approvals")}
                    className="w-full py-2.5 text-center text-blue-600 hover:text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="hidden md:block">
              <span className="text-sm font-medium text-gray-900">John Doe</span>
              <p className="text-xs text-gray-500">john.doe@smartbash.com</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="hidden md:flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg text-sm text-white transition-all duration-200 font-medium shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Click outside to close notifications */}
        {showNotifications && (
          <div 
            className="fixed inset-0 z-30"
            onClick={() => setShowNotifications(false)}
          />
        )}
      </header>
    </>
  );
}