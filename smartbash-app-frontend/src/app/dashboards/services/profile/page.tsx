"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, User, Lock, LogOut, Upload } from "lucide-react";

export default function ServiceProfilePage() {
  const router = useRouter();

  const defaultProfile =
    "https://ui-avatars.com/api/?name=Rescue+Team&background=DC2626&color=FFFFFF&size=256";

  const [activeTab, setActiveTab] = useState("info");
  const [profileImage, setProfileImage] = useState(defaultProfile);

  const [formData, setFormData] = useState({
    teamName: "",
    location: "",
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
    if (typeof window === "undefined") return; // SSR safety

    const savedImage = localStorage.getItem("servicesProfileImage");
    const savedTeamName = localStorage.getItem("servicesTeamName");
    const savedEmail = localStorage.getItem("servicesEmail");
    const savedLocation = localStorage.getItem("servicesLocation");
    const savedContact = localStorage.getItem("servicesContact");

    setProfileImage(savedImage || defaultProfile);

    setFormData({
      teamName: savedTeamName || "",
      location: savedLocation || "",
      email: savedEmail || "rescueteam@gmail.com",
      contact: savedContact || "",
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const image = reader.result as string;
      setProfileImage(image);
      localStorage.setItem("servicesProfileImage", image);
      window.dispatchEvent(new Event("profileUpdated"));
      toast.success("Profile image updated!");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!formData.teamName) return toast.error("Team name is required");

    localStorage.setItem("servicesTeamName", formData.teamName);
    localStorage.setItem("servicesEmail", formData.email);
    localStorage.setItem("servicesLocation", formData.location);
    localStorage.setItem("servicesContact", formData.contact);
    localStorage.setItem("servicesProfileImage", profileImage);

    window.dispatchEvent(new Event("profileUpdated"));
    toast.success("Changes saved successfully!");
  };

  const handlePasswordSave = () => {
    if (!passwordData.current || !passwordData.newPass || !passwordData.confirm)
      return toast.error("Please fill all password fields");

    if (passwordData.newPass !== passwordData.confirm)
      return toast.error("Passwords do not match!");

    toast.success("Password updated successfully!");
    setPasswordData({ current: "", newPass: "", confirm: "" });
  };

  const handleDiscard = () => {
    toast("Changes discarded", { icon: "↩️" });
    router.refresh();
  };

  return (
    <div className="bg-gray-100 min-h-screen flex justify-center py-6 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />

      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6 min-h-[700px]">

        {/* LEFT SIDEBAR */}
        <div className="w-full lg:w-80 bg-white rounded-2xl shadow-md p-6 sm:p-8 flex flex-col items-center lg:items-start">
          <button
            onClick={() => router.push("/dashboards/services")}
            className="mb-6 h-9 w-9 flex items-center justify-center rounded-full border hover:bg-gray-100 transition self-start"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-semibold mb-6 sm:mb-8 self-start">Profile</h2>

          <div className="relative w-28 aspect-square rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-md mb-4">
            <img src={profileImage} alt="Profile" className="absolute inset-0 w-full h-full object-cover" />
          </div>

          <p className="font-medium text-lg mb-6 sm:mb-8 text-center w-full truncate">
            {formData.teamName || "Rescue Team"}
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={() => setActiveTab("info")}
              className={`w-full py-3 rounded-xl text-left px-6 transition flex items-center gap-3 ${
                activeTab === "info" ? "bg-gray-200 font-medium" : "hover:bg-gray-100"
              }`}
            >
              <User className="w-5 h-5" /> Service Information
            </button>

            <button
              onClick={() => setActiveTab("password")}
              className={`w-full py-3 rounded-xl text-left px-6 transition flex items-center gap-3 ${
                activeTab === "password" ? "bg-gray-200 font-medium" : "hover:bg-gray-100"
              }`}
            >
              <Lock className="w-5 h-5" /> Password
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                router.push("/");
              }}
              className="w-full py-3 rounded-xl text-left px-6 hover:bg-red-50 text-red-600 flex items-center gap-3"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 bg-white rounded-2xl shadow-md p-6 sm:p-12 min-h-[700px]">
          {activeTab === "info" && (
            <>
              <h2 className="text-2xl font-semibold mb-8 sm:mb-12">Service Information</h2>

              {/* PROFILE CENTER */}
              <div className="flex flex-col items-center mb-8 sm:mb-14">
                <div className="relative w-36 sm:w-44 aspect-square rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg group">
                  <img src={profileImage} alt="Profile" className="absolute inset-0 w-full h-full object-cover" />

                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                    <span className="bg-green-600 text-white text-sm px-4 py-2 rounded-full shadow-md flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Upload
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>

                <p className="mt-4 sm:mt-6 text-xl font-medium">{formData.teamName || "Rescue Team"}</p>
                <p className="text-sm text-gray-500">{formData.email}</p>
              </div>

              {/* FORM FIELDS */}
              <div className="max-w-full sm:max-w-4xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
                  <InputField label="Team Name" name="teamName" value={formData.teamName} onChange={handleChange} />
                  <InputField label="Location" name="location" value={formData.location} onChange={handleChange} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
                  <InputField label="Email" name="email" value={formData.email} onChange={handleChange} />
                  <InputField label="Contact No." name="contact" value={formData.contact} onChange={handleChange} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mt-6 sm:mt-16">
                <button onClick={handleDiscard} className="px-10 py-3 bg-gray-200 rounded-xl hover:bg-gray-300 transition">
                  Discard Changes
                </button>

                <button onClick={handleSave} className="px-10 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                  Save Changes
                </button>
              </div>
            </>
          )}

          {activeTab === "password" && (
            <>
              <h2 className="text-2xl font-semibold mb-8 sm:mb-12 flex items-center gap-3">
                <Lock className="w-6 h-6" /> Password Information
              </h2>

              <div className="w-full max-w-full sm:max-w-2xl mx-auto space-y-4 sm:space-y-6">
                <PasswordField label="Current Password" name="current" value={passwordData.current} onChange={handlePasswordChange} />
                <PasswordField label="New Password" name="newPass" value={passwordData.newPass} onChange={handlePasswordChange} />
                <PasswordField label="Confirm Password" name="confirm" value={passwordData.confirm} onChange={handlePasswordChange} />

                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mt-4 sm:mt-12">
                  <button onClick={() => setPasswordData({ current: "", newPass: "", confirm: "" })} className="px-10 py-3 bg-gray-200 rounded-xl hover:bg-gray-300 transition">
                    Discard Changes
                  </button>

                  <button onClick={handlePasswordSave} className="px-10 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                    Save Changes
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input name={name} value={value} onChange={onChange} className="w-full border rounded-xl px-4 py-3" />
    </div>
  );
}

function PasswordField({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input type="password" name={name} value={value} onChange={onChange} placeholder={`Enter ${label.toLowerCase()}`} className="w-full border rounded-xl px-4 py-3" />
    </div>
  );
}
