"use client";

import { ArrowUpRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";

interface StatCardsProps {
  totalReports: number;
  fireReports: number;
  floodReports: number;
  onCardClick?: (card: "all" | "fire" | "flood") => void;
}

export default function StatCards({
  totalReports,
  fireReports,
  floodReports,
  onCardClick,
}: StatCardsProps) {
  const stats = [
    {
      title: "Total Reports",
      value: String(totalReports),
      highlight: true,
      key: "all" as const,
    },
    {
      title: "Fire Reports",
      value: String(fireReports),
      key: "fire" as const,
    },
    {
      title: "Flood Reports",
      value: String(floodReports),
      key: "flood" as const,
    },
  ];

  const handleClick = (key: "all" | "fire" | "flood") => {
    onCardClick?.(key);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {stats.map((s) => (
        <Card
          key={s.title}
          onClick={() => handleClick(s.key)}
          className={`group cursor-pointer ${
            s.highlight
              ? "bg-green-700 text-white shadow-lg shadow-green-900/30"
              : "bg-white shadow-md"
          } rounded-2xl p-4 sm:p-5 transition hover:shadow-xl`}
        >
          {/* TOP ROW */}
          <CardHeader className="flex items-center justify-between gap-3 p-0">
            <CardTitle
              className={
                s.highlight
                  ? "text-white font-medium"
                  : "font-medium text-gray-800"
              }
            >
              {s.title}
            </CardTitle>

            {/* ICON + TOOLTIP */}
            <CardAction className="relative shrink-0 p-0">
              <div
                className={
                  s.highlight
                    ? "h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center border border-white/40"
                    : "h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center border border-gray-300"
                }
              >
                <ArrowUpRight
                  className={`transition-transform duration-300 ${
                    s.highlight
                      ? "h-6 w-6 sm:h-7 sm:w-7"
                      : "h-5 w-5 sm:h-6 sm:w-6"
                  } group-hover:rotate-45`}
                />
              </div>

              {/* TOOLTIP */}
              <div className="absolute -top-9 right-1/2 translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition text-xs bg-gray-900 text-white px-2 py-1 rounded hidden sm:block">
                View details
              </div>
            </CardAction>
          </CardHeader>

          {/* VALUE */}
          <CardContent className="p-0">
            <h2
              className={
                s.highlight
                  ? "text-2xl sm:text-3xl font-bold mt-5 text-white"
                  : "text-2xl sm:text-3xl font-bold mt-5 text-gray-900"
              }
            >
              {s.value}
            </h2>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
