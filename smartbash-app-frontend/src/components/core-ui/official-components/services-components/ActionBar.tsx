import { useState } from "react";
import SearchBar from "../SearchBar";
import CategoryFilter from "../CategoryFilter";
import StatusFilter from "../StatusFilter";
import ServiceModal, { ServiceFormData } from "./ServiceModal";
import DeleteModal from "./DeleteModal";
import { Service } from "@/app/dashboards/officials/services/page";
import { Edit2, Plus, SlidersHorizontal, Trash2 } from "lucide-react";

export type ServiceCategory = "All" | "Fire" | "Rescue";
export type ServiceStatus = "All" | "Active" | "Busy" | "Inactive" | "Pending";

interface ActionBarProps {
  selectedService: Service | null;
  setSelectedService: (service: Service | null) => void;

  onAdd: (service: Omit<Service, "id">) => void;
  onEdit: (service: Service) => void;
  onDelete: (id: number) => void;

  searchQuery: string;
  setSearchQuery: (value: string) => void;

  selectedCategory: ServiceCategory;
  setSelectedCategory: (value: ServiceCategory) => void;

  selectedStatus: ServiceStatus;
  setSelectedStatus: (value: ServiceStatus) => void;
}

const mapServiceToFormData = (
  service: Service
): Partial<ServiceFormData> => ({
  serviceType: service.type,
  serviceName: service.title,
  contact: service.phone,
  email: service.email,
  location: service.address,
  status: service.status,
});

export default function ActionBar({
  selectedService,
  setSelectedService,
  onAdd,
  onEdit,
  onDelete,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,     
  setSelectedStatus,    
}: ActionBarProps) {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const CATEGORY_OPTIONS: ServiceCategory[] = [
    "All",
    "Fire",
    "Rescue",
  ];

  const STATUS_OPTIONS: ServiceStatus[] = [
    "All",
    "Active",
    "Busy",
    "Inactive",
    "Pending",
  ];

  const handleSubmit = (data: ServiceFormData) => {
    if (modalMode === "add") {
      onAdd({
        title: data.serviceName,
        chief: "",
        phone: data.contact,
        email: data.email,
        address: data.location,
        type: data.serviceType as "Fire" | "Rescue",
        status: data.status,
        variant: data.serviceType === "Fire" ? "firetruck" : "rescue",
      });
    } else if (selectedService) {
      onEdit({
        ...selectedService,
        title: data.serviceName,
        phone: data.contact,
        email: data.email,
        address: data.location,
        status: data.status,
      });
    }

    setShowModal(false);
  };

  const handleDelete = () => {
    if (!selectedService) return;
    onDelete(selectedService.id);
    setShowDeleteModal(false);
    setSelectedService(null);
  };

  const handleClearFilters = () => {
    setSelectedCategory("All");
    setSelectedStatus("All");
  };

  const hasActiveFilters = selectedCategory !== "All" || selectedStatus !== "All";

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 relative">
        {/* SEARCH BAR */}
        <div className="flex-1 min-w-[200px]">
          <SearchBar
            onSearch={setSearchQuery}
          />
        </div>

        {/* FILTER BUTTON */}
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-11 h-11 rounded-xl border shadow-sm flex items-center justify-center transition-all ${
              showFilters || hasActiveFilters
                ? "bg-green-50 border-green-500 text-green-600"
                : "bg-white border-gray-200"
            }`}
          >
            <SlidersHorizontal className="w-5 h-5 text-gray-700 hover:text-gray-900 transition-colors" />

            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {/* DROPDOWN FILTER PANEL */}
          {showFilters && (
            <>
              {/* Backdrop for mobile */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowFilters(false)}
              />
              
              <div className="absolute top-full right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-20 overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">Filters</h3>
                    {hasActiveFilters && (
                      <button
                        onClick={handleClearFilters}
                        className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Content */}
                <div className="p-5 space-y-5">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Category
                    </label>
                    <CategoryFilter
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                      options={CATEGORY_OPTIONS}
                    />
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100"></div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Status
                    </label>
                    <StatusFilter
                      selectedStatus={selectedStatus}
                      onStatusChange={setSelectedStatus}
                      options={STATUS_OPTIONS}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full h-10 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* DELETE */}
        <button
          onClick={() => {
            if (!selectedService) return alert("Please select a service to delete");
            setShowDeleteModal(true);
          }}
          className="w-11 h-11 rounded-xl flex items-center border justify-center hover:bg-red-200 transition-colors"
        >
          <Trash2 className="w-5 h-5 text-gray-700 hover:text-red-600 transition-colors" />
        </button>

        {/* EDIT */}
        <button
          onClick={() => {
            if (!selectedService) return alert("Please select a service to edit");
            setModalMode("edit");
            setShowModal(true);
          }}
          className="px-5 h-11 rounded-xl border bg-white flex items-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <Edit2 className="w-4 h-4 text-gray-700 hover:text-blue-600 transition-colors" />
          Edit
        </button>

        {/* ADD */}
        <button
          onClick={() => {
            setSelectedService(null);
            setModalMode("add");
            setShowModal(true);
          }}
          className="px-6 h-11 rounded-xl bg-green-500 text-white flex items-center gap-2 hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4 text-gray-700 hover:text-green-600 transition-colors" />
          Add Service
        </button>
      </div>

      {/* MODALS */}
      {showModal && (
        <ServiceModal
          mode={modalMode}
          initialData={modalMode === "edit" && selectedService
             ?mapServiceToFormData(selectedService)
             :undefined
        }
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}

      {showDeleteModal && (
        <DeleteModal
          service={selectedService}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}