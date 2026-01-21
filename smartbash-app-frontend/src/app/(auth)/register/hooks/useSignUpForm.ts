"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { validateForm } from "../utils/validation";

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
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const error = validateForm(role, formData);
    if (error) return setErrorMessage(error);

    setIsLoading(true);

    try {
      const { confirmPassword, ...payload } = {
        role,
        ...formData,
        files: files?.name,
      };

      const res = await fetch("http://127.0.0.1:8000/api/auth/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setSuccessMessage("Registration successful!");

      setTimeout(() => {
        window.location.href = "/signin";
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
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
  };
}
