const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

const isValidFile = (file?: File | null) => {
  if (!file) return { valid: false, message: "Proof of authority is required" };

  const lowerName = file.name.toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const hasValidType =
    !file.type || ALLOWED_FILE_TYPES.includes(file.type.toLowerCase());

  if (!hasValidExt && !hasValidType) {
    return {
      valid: false,
      message: "Invalid file type. Use PDF or JPG/PNG images only.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      message: "File too large. Maximum size is 5MB.",
    };
  }

  return { valid: true, message: "" };
};

export const validateForm = (role: string, formData: any, file?: File | null) => {
  if (role === "Resident") {
    if (!formData.firstName || !formData.lastName || !formData.email)
      return "Please fill all resident fields";
    if (!formData.location) return "Please select your barangay";
  }

  if (role === "Services") {
    if (!formData.name || !formData.location || !formData.email || !formData.serviceType)
      return "Please fill all services fields";
  }

  if (role === "BrgyOfficials") {
    if (!formData.barangayName || !formData.location || !formData.email)
      return "Please fill all official fields";
  }

  if (formData.password !== formData.confirmPassword)
    return "Passwords do not match";

  const fileCheck = isValidFile(file);
  if (!fileCheck.valid) return fileCheck.message;

  return null;
};
