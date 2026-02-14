"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function ResidentSettingsPage() {
  const router = useRouter();

  const defaultProfile =
    "https://ui-avatars.com/api/?name=Resident&background=E5E7EB&color=111827&size=256";

  const [activeTab, setActiveTab] = useState("info");
  const [profileImage, setProfileImage] = useState(defaultProfile);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    location: "",
    age: "",
    gender: "",
    email: "",
    contact: "",
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  /* ================= LOAD SAVED DATA ================= */
  useEffect(() => {
    const savedImage = localStorage.getItem("residentProfileImage");
    const savedName = localStorage.getItem("residentFullName");

    if (savedImage && savedImage !== "null") {
      setProfileImage(savedImage);
    }

    if (savedName) {
      const parts = savedName.split(" ");

      setFormData((prev) => ({
        ...prev,
        firstName: parts[0] || "",
        middleName: parts.length === 3 ? parts[1] : "",
        lastName:
          parts.length === 3
            ? parts[2]
            : parts.length === 2
            ? parts[1]
            : "",
      }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const image = reader.result as string;

      setProfileImage(image);
      localStorage.setItem("residentProfileImage", image);

      window.dispatchEvent(new Event("profileUpdated"));

      toast.success("Profile image updated!");
    };

    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error("First name and Last name are required");
      return;
    }

    const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`
      .replace(/\s+/g, " ")
      .trim();

    localStorage.setItem("residentFullName", fullName);
    localStorage.setItem("residentProfileImage", profileImage);

    window.dispatchEvent(new Event("profileUpdated"));

    toast.success("Changes saved successfully!");
  };

  const handlePasswordSave = () => {
    if (!passwordData.current || !passwordData.newPass || !passwordData.confirm) {
      toast.error("Please fill all password fields");
      return;
    }

    if (passwordData.newPass !== passwordData.confirm) {
      toast.error("Passwords do not match!");
      return;
    }

    toast.success("Password updated successfully!");

    setPasswordData({
      current: "",
      newPass: "",
      confirm: "",
    });
  };

  const handleDiscard = () => {
    toast("Changes discarded", { icon: "↩️" });
    router.refresh();
  };

  const fullName =
    formData.firstName || formData.lastName
      ? `${formData.firstName} ${formData.middleName} ${formData.lastName}`
          .replace(/\s+/g, " ")
          .trim()
      : "Full name";

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center py-8 px-6">
      <Toaster position="top-right" />

      <div className="w-full max-w-6xl flex gap-6 min-h-[700px]">

        {/* LEFT SIDEBAR */}
        <div className="w-80 bg-white rounded-2xl shadow-md p-8 flex flex-col items-center">

          <button
            onClick={() => router.push("/dashboards/residents")}
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
            {fullName}
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
              Personal Information
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

          {activeTab === "info" && (
            <>
              <h2 className="text-2xl font-semibold mb-12">
                Personal Information
              </h2>

              {/* PROFILE CENTER */}
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

                <p className="mt-6 text-xl font-medium">{fullName}</p>
              </div>

              {/* ROW 1 */}
              <div className="flex gap-8 mb-8">
                <Input label="Firstname" name="firstName" value={formData.firstName} onChange={handleChange} />
                <Input label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} />
                <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
              </div>

              {/* ROW 2 */}
              <div className="flex gap-8 mb-8 items-end">
                <Input label="Location" name="location" value={formData.location} onChange={handleChange} />
                <Input label="Age" name="age" value={formData.age} onChange={handleChange} />
                <Input label="Gender" name="gender" value={formData.gender} onChange={handleChange} />
              </div>

              {/* ROW 3 */}
              <div className="flex gap-8 mb-8">
                <Input label="Email" name="email" value={formData.email} onChange={handleChange} />
                <Input label="Contact No." name="contact" value={formData.contact} onChange={handleChange} />
              </div>

              <div className="flex justify-center gap-8 mt-16">
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
            </>
          )}

          {activeTab === "password" && (
            <>
              <h2 className="text-2xl font-semibold mb-12">
                Change Password
              </h2>

              <div className="w-full max-w-2xl mx-auto grid gap-6">
                <input
                  type="password"
                  name="current"
                  value={passwordData.current}
                  onChange={handlePasswordChange}
                  placeholder="Current Password"
                  className="border rounded-xl px-4 py-3"
                />

                <input
                  type="password"
                  name="newPass"
                  value={passwordData.newPass}
                  onChange={handlePasswordChange}
                  placeholder="New Password"
                  className="border rounded-xl px-4 py-3"
                />

                <input
                  type="password"
                  name="confirm"
                  value={passwordData.confirm}
                  onChange={handlePasswordChange}
                  placeholder="Confirm Password"
                  className="border rounded-xl px-4 py-3"
                />

                <button
                  onClick={handlePasswordSave}
                  className="bg-green-600 text-white py-3 rounded-xl mt-6"
                >
                  Update Password
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex-1">
      <label className="text-sm text-gray-600">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded-xl px-4 py-3 mt-2"
      />
    </div>
  );
}
