"use client"

import { Truck, User } from "lucide-react";
import { JSX } from "react";

export type ServiceVariant = "firetruck" | "rescue";
export type ServiceStatus = "All" | "Active" | "Inactive" | "Busy" | "Pending";

interface ServiceCardProps {
  id: number;
  title: string;
  chief: string;
  phone: string;
  email: string;
  address: string;
  type: "Fire" | "Rescue";
  variant: ServiceVariant;
  status: ServiceStatus;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function ServiceCard({
  title,
  chief,
  phone,
  email,
  address,
  type,
  status,
  variant,
  onClick,
  isSelected,
}: ServiceCardProps) {
  const border = variant === "firetruck" ? "border-red-500" : "border-blue-500";

  const badge =
    variant === "firetruck"
      ? "bg-red-100 text-red-600"
      : "bg-blue-100 text-blue-600";

  const statusBadge =
    status === "Active"
      ? "bg-green-100 text-green-600"
      : "bg-orange-100 text-orange-600";

  const icon: Record<string, JSX.Element> = {
    firetruck: <Truck className="w-6 h-6 text-red-500" />,
    rescue: <Truck className="w-6 h-6 text-blue-500" />,
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 border-l-4 ${border} shadow-sm cursor-pointer ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3 items-center">
          {/* ICON + LABEL (stacked vertically) */}
          <div className="flex flex-col items-center gap-1">
            {icon[variant] || <User className="w-6 h-6 text-gray-400" />}
            <span className="text-xs font-medium">
              {variant === "firetruck" ? "Fire Station" : "Rescue Unit"}
            </span>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{chief}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <span className={`text-xs px-3 py-1 rounded-full ${badge}`}>{type}</span>
          <span className={`text-xs px-3 py-1 rounded-full ${statusBadge}`}>{status}</span>
        </div>
      </div>

      {/* DETAILS */}
      <div className="text-sm text-gray-600 space-y-3">
        <div className="flex items-center gap-3">
          <img src="/services_icons/phone.png" className="w-4 h-4" />
          <span>{phone}</span>
        </div>

        <div className="flex items-center gap-3">
          <img src="/services_icons/email.png" className="w-4 h-4" />
          <span>{email}</span>
        </div>

        <div className="flex items-center gap-3">
          <img src="/services_icons/location.png" className="w-4 h-4" />
          <span>{address}</span>
        </div>
      </div>
    </div>
  );
}
