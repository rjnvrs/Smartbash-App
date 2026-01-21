"use client";

import { Flame, Waves } from "lucide-react";
import { JSX } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export type StatVariant = "fire" | "flood";

interface StatCardProps {
  title: string;
  count: number;
  variant: StatVariant;
}

export default function StatCard({ title, count, variant }: StatCardProps) {
  const styles =
    variant === "fire"
      ? "border-red-500"
      : "border-blue-500";

  const iconsMap: Record<string, JSX.Element> = {
    fire: <Flame className="w-6 h-6 text-red-500" />,
    flood: <Waves className="w-6 h-6 text-blue-500" />,
  };

  const icon = iconsMap[variant] || <Flame className="w-6 h-6 text-gray-400" />;

  return (
    <Card className={`border-l-4 ${styles} shadow-sm`}>
      <CardContent className="flex justify-between items-center px-7 py-6">
        <div>
          <CardTitle className="text-gray-600 text-sm">{title}</CardTitle>
          <h3 className="text-4xl font-bold mt-1">{count}</h3>
        </div>

        {icon}
      </CardContent>
    </Card>
  );
}
