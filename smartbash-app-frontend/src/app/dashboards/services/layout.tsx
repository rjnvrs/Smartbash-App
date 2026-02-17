import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "Services") {
    redirect("/login");
  }

  return <>{children}</>;
}
