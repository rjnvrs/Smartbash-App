"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function SettingsPage() {
  const router = useRouter();

  const defaultProfile =
    "https://ui-avatars.com/api/?name=Profile&background=E5E7EB&color=111827&size=256";

  const [activeTab, setActiveTab] = useState("info");

  const [profileImage, setProfileImage] = useState<string>(
    typeof window !== "undefined"
      ? localStorage.getItem("profileImage") || defaultProfile
      : defaultProfile
  );

  const [formData, setFormData] = useState({
    brgyName:
      typeof window !== "undefined"
        ? localStorage.getItem("brgyName") || "karl"
        : "karl",
    location: "",
    email:
      typeof window !== "undefined"
        ? localStorage.getItem("brgyEmail") || "brgy@gmail.com"
        : "brgy@gmail.com",
    contact: "",
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const image = reader.result as string;
      setProfileImage(image);
      localStorage.setItem("profileImage", image);
      window.dispatchEvent(new Event("profileUpdated"));
      toast.success("Profile image updated!");
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  /* ✅ UPDATED SAVE FUNCTION */
  const handleSave = () => {
    localStorage.setItem("brgyName", formData.brgyName);
    localStorage.setItem("brgyEmail", formData.email);

    window.dispatchEvent(new Event("profileUpdated"));

    toast.success("Changes saved successfully!");
  };

  const handlePasswordSave = () => {
    if (passwordData.newPass !== passwordData.confirm) {
      toast.error("Passwords do not match!");
      return;
    }
    toast.success("Password updated successfully!");
  };

  const handleDiscard = () => {
    toast("Changes discarded", { icon: "↩️" });
    router.refresh();
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center py-8 px-6">
      <Toaster position="top-right" />

      <div className="w-full max-w-6xl flex gap-6 min-h-[700px]">

        {/* LEFT SIDEBAR */}
        <div className="w-80 bg-white rounded-2xl shadow-md p-8 flex flex-col items-center">
          <button
            onClick={() => router.push("/dashboards/officials")}
            className="mb-6 h-9 w-9 flex items-center justify-center rounded-full border hover:bg-gray-100 transition self-start"
          >
            ←
          </button>

          <h2 className="text-2xl font-semibold mb-8 self-start">
            Settings
          </h2>

          <div className="relative w-28 aspect-square rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-md mb-4">
            <img
              src={profileImage}
              alt="Profile"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          <p className="font-medium text-lg mb-8 text-center w-full truncate">
            {formData.brgyName}
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={() => setActiveTab("info")}
              className={`w-full py-3 rounded-xl text-left px-6 transition ${
                activeTab === "info"
                  ? "bg-gray-200 font-medium"
                  : "hover:bg-gray-100"
              }`}
            >
              Brgy Information
            </button>

            <button
              onClick={() => setActiveTab("password")}
              className={`w-full py-3 rounded-xl text-left px-6 transition ${
                activeTab === "password"
                  ? "bg-gray-200 font-medium"
                  : "hover:bg-gray-100"
              }`}
            >
              Password
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full py-3 rounded-xl text-left px-6 hover:bg-red-50 text-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 bg-white rounded-2xl shadow-md p-12 min-h-[700px]">

          {/* INFO TAB */}
          <div className={activeTab === "info" ? "block" : "hidden"}>
            <h2 className="text-2xl font-semibold mb-12">
              Barangay Information
            </h2>

            <div className="flex flex-col items-center mb-14">
              <div className="relative w-44 aspect-square rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg group">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  <span className="bg-green-600 text-white text-sm px-4 py-2 rounded-full shadow-md">
                    Upload
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              <p className="mt-6 text-xl font-medium">
                {formData.brgyName}
              </p>

              <p className="text-gray-500 text-sm">
                {formData.email}
              </p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-2 gap-10 mb-16">
              <div>
                <label className="text-sm text-gray-600">Name of Brgy.</label>
                <input
                  name="brgyName"
                  value={formData.brgyName}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 mt-2"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Location</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 mt-2"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 mt-2"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Contact No.</label>
                <input
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 mt-2"
                />
              </div>
            </div>

            <div className="flex justify-center gap-8 mt-20">
              <button
                onClick={handleDiscard}
                className="px-10 py-3 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
              >
                Discard Changes
              </button>

              <button
                onClick={handleSave}
                className="px-10 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* PASSWORD TAB */}
          <div className={activeTab === "password" ? "block" : "hidden"}>
            <h2 className="text-2xl font-semibold mb-12">
              Change Password
            </h2>

            <div className="w-full max-w-2xl mx-auto grid gap-6">
              <input
                type="password"
                name="current"
                placeholder="Current Password"
                value={passwordData.current}
                onChange={handlePasswordChange}
                className="border rounded-xl px-4 py-3"
              />

              <input
                type="password"
                name="newPass"
                placeholder="New Password"
                value={passwordData.newPass}
                onChange={handlePasswordChange}
                className="border rounded-xl px-4 py-3"
              />

              <input
                type="password"
                name="confirm"
                placeholder="Confirm New Password"
                value={passwordData.confirm}
                onChange={handlePasswordChange}
                className="border rounded-xl px-4 py-3"
              />

              <button
                onClick={handlePasswordSave}
                className="bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition mt-6"
              >
                Update Password
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
