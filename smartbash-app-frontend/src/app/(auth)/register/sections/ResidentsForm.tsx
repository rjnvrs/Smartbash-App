"use client";

import { ChangeEvent } from "react";
import InputField from "../../../../components/core-ui/register-components/InputField";
import FileUpload from "../../../../components/core-ui/register-components/FileUpload";
import { FormData } from "../hooks/useSignUpForm";

interface ResidentFormProps {
  formData: FormData;
  updateField: (field: keyof FormData, value: any) => void; // value can be string, number, or File
  onFileChange: (field: keyof FormData, file: File) => void;
  isLoading: boolean;
}

export default function ResidentsForm({
  formData,
  updateField,
  onFileChange,
  isLoading,
}: ResidentFormProps) {
  // File handler
  const handleFileChange = (file: File) => {
    onFileChange("proofofAuthority", file);
};

  return (
    <div className="space-y-6">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField
          label="First Name"
          placeholder="Enter first name"
          value={formData.firstName}
          onChange={(e) => updateField("firstName", e.target.value)}
          required
          disabled={isLoading}
        />

        <InputField
          label="Middle Name"
          placeholder="Enter middle name"
          value={formData.middleName}
          onChange={(e) => updateField("middleName", e.target.value)}
          disabled={isLoading}
        />

        <InputField
          label="Last Name"
          placeholder="Enter last name"
          value={formData.lastName}
          onChange={(e) => updateField("lastName", e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {/* Contact Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          type="email"
          label="Email Address"
          placeholder="Enter email"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          required
          disabled={isLoading}
        />

        <InputField
          label="Contact No."
          placeholder="Enter contact number"
          value={formData.contactNo}
          onChange={(e) => updateField("contactNo", e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Password and Confirm Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          type="password"
          label="Password"
          placeholder="Enter password"
          value={formData.password}
          onChange={(e) => updateField("password", e.target.value)}
          required
          disabled={isLoading}
        />

        <InputField
          type="password"
          label="Confirm Password"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={(e) => updateField("confirmPassword", e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {/* Age and Gender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          type="number"
          label="Age"
          placeholder="Age"
          value={formData.age}
          onChange={(e) =>
            updateField("age", e.target.value ? Number(e.target.value) : "")
          }
          disabled={isLoading}
        />

        <select
          value={formData.gender}
          onChange={(e) => updateField("gender", e.target.value)}
          className="border rounded-md p-2"
          disabled={isLoading}
        >
          <option value="">Select Gender</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
        </select>
      </div>

      {/* File Upload */}
      <FileUpload
        label="Proof of Authority"
        instructions={[
          "For Residents 18 and above:",
          "Please upload a valid government-issued ID to verify your identity.",
          "For Residents under 18:",
          "Please upload a valid document of a parent or legal guardian.",
        ]}
        onFileChange={handleFileChange}
      />
    </div>
  );
}
