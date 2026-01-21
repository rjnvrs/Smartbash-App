"use client";
import InputField from "../../../../components/core-ui/register-components/InputField";
import FileUpload from "../../../../components/core-ui/register-components/FileUpload";
import { ChangeEvent } from "react";

interface OfficialsFormData {
  barangayName: string;
  contact: string;
  location: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface BrgyOfficialsFormProps {
  formData: OfficialsFormData;
  updateField: (field: keyof OfficialsFormData, value: string) => void;
  onFileChange: (file: File) => void;
}

export default function BrgyOfficialsForm({ formData, updateField, onFileChange }:BrgyOfficialsFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Barangay Name"
          placeholder="Enter barangay name"
          defaultValue={formData.barangayName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("barangayName", e.target.value)}
          required
        />
        <InputField
          label="Contact"
          placeholder="Enter contact"
          defaultValue={formData.contact}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("contact", e.target.value)}
          required
        />
      </div>

      <InputField
        label="Location"
        placeholder="Enter location"
        defaultValue={formData.location}
        onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("location", e.target.value)}
        required
      />

      <InputField
        type="email"
        label="Email"
        placeholder="Enter email"
        defaultValue={formData.email}
        onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("email", e.target.value)}
        required
      />

      <InputField
        type="password"
        label="Password"
        placeholder="Enter password"
        defaultValue={formData.password}
        onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("password", e.target.value)}
        required
      />

      <InputField
        type="password"
        label="Confirm Password"
        placeholder="Confirm password"
        defaultValue={formData.confirmPassword}
        onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("confirmPassword", e.target.value)}
        required
      />

      <FileUpload
        label="Upload Files"
        instructions={[
          "• Appointment Letter",
          "• Oath of Office",
          "• Barangay Resolution",
          "• Certificate of Incumbency",
          "• LGU Endorsement",
        ]}
        onFileChange={onFileChange}
      />
    </div>
  );
}
