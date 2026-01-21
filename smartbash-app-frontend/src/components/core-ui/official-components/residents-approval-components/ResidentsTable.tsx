import ResidentRow, { ResidentData, ResidentStatus } from "./ResidentRow";

interface ResidentsTableProps {
  data: ResidentData[];
  onUpdateStatus?: (id: number, newStatus: ResidentStatus) => void;
}

export default function ResidentsTable({ data = [], onUpdateStatus }: ResidentsTableProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {/* HEADER */}
      <div className="grid grid-cols-8 text-sm text-gray-500 px-4 py-3">
        <span>Full Name</span>
        <span>Email Address</span>
        <span>Contact No.</span>
        <span>Gender / Age</span>
        <span className="col-span-2">Details</span>
        <span>Status</span>
        <span>Action</span>
      </div>

      <div className="space-y-3">
        {data.map((row, i) => (
          <ResidentRow key={i} data={row} onUpdateStatus={onUpdateStatus}/>
        ))}
      </div>
    </div>
  );
}
