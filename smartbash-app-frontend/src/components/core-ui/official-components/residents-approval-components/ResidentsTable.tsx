"use client";

import ResidentRow, { ResidentData, ResidentStatus } from "./ResidentRow";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";

interface ResidentsTableProps {
  data: ResidentData[];
  onUpdateStatus?: (id: number, newStatus: ResidentStatus) => void;
}

export default function ResidentsTable({
  data = [],
  onUpdateStatus,
}: ResidentsTableProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">

      {/* ✅ MOBILE VIEW (STACKED CARDS) */}
      <div className="space-y-4 md:hidden">
        {data.map((row) => (
          <ResidentRow
            key={row.id}
            data={row}
            onUpdateStatus={onUpdateStatus}
            mobile
          />
        ))}
      </div>

      {/* ✅ DESKTOP VIEW (TABLE) */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>Contact No.</TableHead>
              <TableHead>Gender / Age</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((row) => (
              <ResidentRow
                key={row.id}
                data={row}
                onUpdateStatus={onUpdateStatus}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
