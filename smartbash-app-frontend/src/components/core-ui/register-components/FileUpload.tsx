"use client";
import {useState, ChangeEvent} from "react";

interface FileUploadProps {
  label: string;
  instructions?: string[];
  onFileChange?: (file: File) => void;
}

export default function FileUpload({ label, instructions, onFileChange }: FileUploadProps) {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      // Pass file to parent component
      if (onFileChange) {
        onFileChange(file);
      }
    }
  };

  return (
    <div>
      <label className="block mb-2 font-medium text-sm text-gray-700">
        {label} (Required)
      </label>
      <div className="border border-gray-300 rounded-md p-6 bg-gray-50">
        <div className="text-sm text-gray-600 mb-4 space-y-2">
          {instructions?.map((item, index) => (
            <p key={index} className="leading-relaxed">
              {item}
            </p>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <label className="cursor-pointer bg-white border border-gray-300 px-6 py-2 rounded-md hover:bg-gray-50 transition">
            <span className="text-sm font-medium text-gray-700">
              Click to upload
            </span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
        {fileName && (
          <p className="text-sm text-gray-600 mt-2">Selected: {fileName}</p>
        )}
      </div>
    </div>
  );
}