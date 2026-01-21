export type Report = {
  type: "fire" | "flood";
  status: "completed" | "waiting" | "inprogress";
  description: string;
  location: string;
  images: string[];
  createdAt: string;
};

export const saveReport = (report: Report) => {
  const existing = JSON.parse(localStorage.getItem("reports") || "[]");
  existing.unshift(report);
  localStorage.setItem("reports", JSON.stringify(existing));
};

export const getReports = (): Report[] => {
  return JSON.parse(localStorage.getItem("reports") || "[]");
};
