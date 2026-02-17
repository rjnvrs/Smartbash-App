"use client";
import InputField from "../../../../components/core-ui/register-components/InputField";
import FileUpload from "../../../../components/core-ui/register-components/FileUpload";
import { ChangeEvent } from "react";
import { FormData } from "../hooks/useSignUpForm";

interface ServicesFormProps {
  formData: FormData;
  updateField: (field: keyof FormData, value: string) => void;
  onFileChange: (file: File) => void;
}

export default function ServicesForm({
  formData,
  updateField,
  onFileChange,
}: ServicesFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Name"
          placeholder="Enter your name"
          defaultValue={formData.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateField("name", e.target.value)
          }
          required
        />
        <InputField
          label="Location"
          placeholder="Enter location"
          defaultValue={formData.location}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            updateField("location", e.target.value)
          }
          required
        />
      </div>

      <InputField
        type="email"
        label="Email"
        placeholder="Enter email"
        defaultValue={formData.email}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          updateField("email", e.target.value)
        }
        required
      />

      <InputField
        label="Contact No."
        placeholder="Enter contact number"
        defaultValue={formData.contactNo}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          updateField("contactNo", e.target.value)
        }
      />

      <div className="grid gap-2">
        <label className="block text-sm font-medium text-gray-700">
          Service Type<span className="text-red-500 ml-1">*</span>
        </label>
        <select
          value={formData.serviceType || ""}
          onChange={(e) => updateField("serviceType", e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-green-500 h-12 text-md bg-white"
          required
        >
          <option value="">Select service type</option>
          <option value="Fire">Fire</option>
          <option value="Rescue">Flood/Rescue</option>
        </select>
      </div>

      <InputField
        type="password"
        label="Password"
        placeholder="Enter password"
        defaultValue={formData.password}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          updateField("password", e.target.value)
        }
        required
      />

      <InputField
        type="password"
        label="Confirm Password"
        placeholder="Confirm password"
        defaultValue={formData.confirmPassword}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          updateField("confirmPassword", e.target.value)
        }
        required
      />

      <FileUpload
        label="Upload Files"
        instructions={[
          "Appointment Letter",
          "Oath of Office",
          "Barangay Resolution",
          "Certificate of Incumbency",
          "LGU Endorsement",
        ]}
        onFileChange={onFileChange}
        required
      />
    </div>
  );
}
