// core-ui/admin-components/types.ts
export type Status = "Pending" | "Approved" | "Removed";
export type Role = "Brgy. Officials" | "Services";

export interface User {
  id: number;
  fullName: string;
  email: string;
  contact: string;
  details: string;
  status: Status;
  role: Role;
}
