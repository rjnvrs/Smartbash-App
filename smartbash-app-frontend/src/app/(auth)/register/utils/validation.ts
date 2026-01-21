export const validateForm = (role: string, formData: any) => {
  if (role === "Resident") {
    if (!formData.firstName || !formData.lastName || !formData.email)
      return "Please fill all resident fields";
  }

  if (role === "Services") {
    if (!formData.name || !formData.location || !formData.email)
      return "Please fill all services fields";
  }

  if (role === "BrgyOfficials") {
    if (!formData.barangayName || !formData.location || !formData.email)
      return "Please fill all official fields";
  }

  if (formData.password !== formData.confirmPassword)
    return "Passwords do not match";

  return null;
};
