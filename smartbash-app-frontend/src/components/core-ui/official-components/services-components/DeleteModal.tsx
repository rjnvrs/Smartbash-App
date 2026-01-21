"use client"

export interface Service {
  id: number;
  title: string;
}

interface DeleteModalProps {
  service: Service | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
}

export default function DeleteModal({ service, onClose, onConfirm }: DeleteModalProps) {
  if (!service) return null; // Prevent null access

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Delete Service</h2>
        <p className="mb-6">
          Are you sure you want to delete <strong>{service.title}</strong>?
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => onConfirm(service.id)}
            className="flex-1 bg-red-500 text-white h-12 rounded-lg hover:bg-red-600"
          >
            Yes, Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 h-12 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
