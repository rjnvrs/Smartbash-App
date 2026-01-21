export type Role = "Resident" | "Services" | "BrgyOfficials";

export interface FormData {
  // For Resident
  firstName?: string;
  lastName?: string;

  // For Services
  name?: string;
  location?: string;

  // For BrgyOfficials
  barangayName?: string;
  contact?: string;

  // Common fields
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function validateForm(role: Role, data: FormData): string | null {
  const baseChecks = () => {
    if (!data.email) return "Email is required";
    if (!data.password) return "Password is required";
    if (data.password !== data.confirmPassword)
      return "Passwords do not match";
    return null;
  };

  if (role === "Resident") {
    if (!data.firstName) return "First name is required";
    if (!data.lastName) return "Last name is required";
    return baseChecks();
  }

  if (role === "Services") {
    if (!data.name) return "Name is required";
    if (!data.location) return "Location is required";
    return baseChecks();
  }

  if (role === "BrgyOfficials") {
    if (!data.barangayName) return "Barangay name is required";
    if (!data.contact) return "Contact is required";
    if (!data.location) return "Location is required";
    return baseChecks();
  }

  return null;
}
