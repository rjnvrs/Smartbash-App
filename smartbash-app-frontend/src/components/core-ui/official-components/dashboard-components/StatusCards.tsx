"use client";

import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

export default function StatusCards() {
  const statuses = [
    {
      title: "Pending",
      count: 12,
      subtitle: "reports awaiting response",
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border border-orange-200",
      icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    },
    {
      title: "In Progress",
      count: 3,
      subtitle: "reports being addressed",
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border border-blue-200",
      icon: <TrendingUp className="h-5 w-5 text-blue-500" />
    },
    {
      title: "Resolved",
      count: 5,
      subtitle: "reports completed",
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border border-green-200",
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {statuses.map((s) => (
        <div
          key={s.title}
          className={`${s.bg} ${s.border} rounded-xl p-4 flex items-start gap-3`}
        >
          {/* ICON */}
          <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center shrink-0">
            {s.icon}
          </div>

          {/* TEXT */}
          <div className="min-w-0">
            <div className={`font-medium ${s.text}`}>{s.title}</div>
            <div className="text-sm text-gray-500 leading-snug">
              <span className={`font-semibold ${s.text}`}>{s.count}</span>{" "}
              {s.subtitle}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
