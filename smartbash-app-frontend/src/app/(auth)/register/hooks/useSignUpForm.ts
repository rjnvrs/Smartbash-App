"use client";

import { useState, ChangeEvent } from "react";
import { validateForm } from "../utils/validation";
import { signupUser } from "@/lib/api";

type Role = "Resident" | "Services" | "BrgyOfficials";

export interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  contactNo: string;
  password: string;
  confirmPassword: string;
  age: string;
  gender: string;
  name: string;
  location: string;
  barangayName: string;
  contact: string;
  serviceType: string;
  proofofAuthority?: File | null;
}

export function useSignUpForm() {
  const [role, setRole] = useState<Role>("Resident");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [files, setFiles] = useState<File | null>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    contactNo: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
    name: "",
    location: "",
    barangayName: "",
    contact: "",
    serviceType: "",
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = (newRole: Role) => {
    setRole(newRole);
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      contactNo: "",
      password: "",
      confirmPassword: "",
      age: "",
      gender: "",
      name: "",
      location: "",
      barangayName: "",
      contact: "",
      serviceType: "",
    });
    setFiles(null);
  };

 const submit = async () => {
  setErrorMessage("");
  setSuccessMessage("");

  const error = validateForm(role, formData, files);
  if (error) return setErrorMessage(error);

  setIsLoading(true);

  try {
    const form = new FormData();

    form.append("role", role);
    form.append("email", formData.email);
    form.append("password", formData.password);

    // Resident fields
    form.append("firstName", formData.firstName || "");
    form.append("middleName", formData.middleName || "");
    form.append("lastName", formData.lastName || "");
    form.append("contactNo", formData.contactNo || "");
    form.append("age", formData.age || "");
    form.append("gender", formData.gender || "");
    form.append("location", formData.location || "");

    // Service / Official fields
    form.append("name", formData.name || "");
    form.append("barangayName", formData.barangayName || "");
    form.append("contact", formData.contact || "");
    form.append("serviceType", formData.serviceType || "");

    if (files) {
      form.append("proofofAuthority", files);
    }

    const res = await signupUser(form); // signupUser will handle FormData
    const createdId = res?.created_id ?? "n/a";
    const roleInfo = res?.role ? ` (${res.role})` : "";
    setSuccessMessage(`Registration successful${roleInfo}. ID: ${createdId}`);

    setTimeout(() => {
      const notice =
        role === "Resident"
          ? "Registration submitted. Please wait for officials approval."
          : "Registration submitted. Please wait for admin approval.";
      window.location.href = `/login?message=${encodeURIComponent(notice)}`;
    }, 2000);
  } catch (err: any) {
    setErrorMessage(err.message || "Registration failed");
  } finally {
    setIsLoading(false);
  }
};

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files[0]);
    }
  };

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  return {
    role,
    formData,
    isLoading,
    errorMessage,
    successMessage,
    files,
    setFiles,
    updateField,
    resetForm,
    submit,
    handleFileChange,
    clearMessages,
  };
}
