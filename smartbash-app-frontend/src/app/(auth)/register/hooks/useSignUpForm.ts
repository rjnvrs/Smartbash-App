"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
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
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("smartbash_register_form");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.role) setRole(parsed.role as Role);
      if (parsed?.formData) {
        setFormData((prev) => ({
          ...prev,
          ...parsed.formData,
          password: "",
          confirmPassword: "",
        }));
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sanitized = {
      ...formData,
      password: "",
      confirmPassword: "",
    };
    localStorage.setItem(
      "smartbash_register_form",
      JSON.stringify({ role, formData: sanitized })
    );
  }, [role, formData]);

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
    });
    setFiles(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("smartbash_register_form");
    }
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

    if (files) {
      form.append("proofofAuthority", files);
    }

    const res = await signupUser(form); // signupUser will handle FormData
    const createdId = res?.created_id ?? "n/a";
    const roleInfo = res?.role ? ` (${res.role})` : "";
    setSuccessMessage(`Registration successful${roleInfo}. ID: ${createdId}`);

    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("smartbash_register_form");
      }
      window.location.href = "/login";
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
