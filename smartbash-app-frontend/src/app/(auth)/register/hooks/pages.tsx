"use client";

import { useSignUpForm } from "./useSignUpForm";
import ResidentsForm from "../sections/ResidentsForm";

export default function RegisterPage() {
  const {
    formData,
    updateField,
    submit,
    handleFileChange,
    isLoading,
    errorMessage,
    successMessage,
  } = useSignUpForm();

  const handleFileChangeWrapper = (file: File) => {
    handleFileChange({ target: { files: [file] } } as any);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-3xl space-y-6">
        <ResidentsForm
          formData={formData}
          updateField={updateField}
          onFileChange={handleFileChangeWrapper}
          isLoading={isLoading}
        />

        {errorMessage && (
          <p className="text-red-600 text-sm">{errorMessage}</p>
        )}

        {successMessage && (
          <p className="text-green-600 text-sm">{successMessage}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-md"
        >
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}