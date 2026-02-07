"use client"

import { ChevronDown } from "lucide-react";
import { useEffect, useState, ChangeEvent } from "react";

export type ServiceStatus = "All" | "Active" | "Inactive" | "Busy" | "Pending";

export interface ServiceFormData {
  serviceType: string;
  serviceName: string;
  contact: string;
  email: string;
  address: string;
  status: ServiceStatus;
}

export type ServiceModalMode = "add" | "edit";

interface ServiceModalProps {
  mode?: ServiceModalMode;
  initialData?: Partial<ServiceFormData>;
  onClose: () => void;
  onSubmit: (data: ServiceFormData) => void;
}

export default function ServiceModal({
  mode = "add", // "add" | "edit"
  initialData = {},
  onClose,
  onSubmit,
}: ServiceModalProps) {
  const [form, setForm] = useState<ServiceFormData>({
    serviceType: "",
    serviceName: "",
    contact: "",
    email: "",
    address: "",
    status: "Active",
  });

  /* PREFILL WHEN EDITING */
  useEffect(() => {
    if (mode === "edit") {
      setForm({
        serviceType: initialData.serviceType || "",
        serviceName: initialData.serviceName || "",
        contact: initialData.contact || "",
        email: initialData.email || "",
        address: initialData.address || "",
        status: initialData.status || "Active",
      });
    }
  }, [mode, initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.serviceType || !form.serviceName) {
      alert("Service Type and Service Name are required");
      return;
    }

    onSubmit(form);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TITLE */}
        <h2 className="text-xl font-semibold mb-6 pb-6 border-b border-gray-200">
          {mode === "add" ? "Add New Service" : "Edit Service"}
        </h2>

        <div className="space-y-5">
          {/* SERVICE TYPE + NAME */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900 mb-2">Service Type:</label>
              <input
                name="serviceType"
                value={form.serviceType}
                onChange={handleChange}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900 mb-2">Service Name:</label>
              <input
                name="serviceName"
                value={form.serviceName}
                onChange={handleChange}
                className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Contact:</label>
            <div className="flex gap-2">
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                className="flex-1 h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button className="w-11 h-11 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-xl text-gray-600">+</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Email Address:</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Address (Optional):</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Status:</label>
            <div className="relative">
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full h-11 px-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>Busy</option>
                <option>Pending</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={handleSubmit}
          className="w-full mt-6 h-12 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium flex items-center justify-center gap-2 transition-colors"
        >
          {mode === "add" && <span className="text-xl">+</span>}
          {mode === "add" ? "Add Service" : "Save Changes"}
        </button>

        {/* CANCEL */}
        <button
          onClick={onClose}
          className="w-full mt-3 h-12 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
