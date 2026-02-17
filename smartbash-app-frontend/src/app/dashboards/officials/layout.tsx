// app/dashboards/officials/layout.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function OfficialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "BrgyOfficials") {
    redirect("/login");
  }

  return <>{children}</>;
}
