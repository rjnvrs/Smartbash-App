"use client";

import { useState } from "react";
import Sidebar from "../../../../components/core-ui/official-components/Sidebar";
import StatCard from "../../../../components/core-ui/official-components/services-components/StatCard";
import ActionBar from "@/components/core-ui/official-components/services-components/ActionBar";
import ServiceCard from "@/components/core-ui/official-components/services-components/ServiceCard";
import { ServiceStatus, ServiceCategory } from "@/components/core-ui/official-components/services-components/ActionBar";

export type ServiceVariant = "firetruck" | "rescue";

export interface Service {
  id: number;
  title: string;
  chief: string;
  phone: string;
  email: string;
  address: string;
  type: "Fire" | "Rescue";
  status: ServiceStatus;
  variant: ServiceVariant;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([
    {
      id: 1,
      title: "Cebu City Fire Station",
      chief: "Chief Juan Dela Cruz",
      phone: "+63 917 123 4567",
      email: "firestation@cebu.gov.ph",
      address: "123 Osmeña Boulevard, Cebu City",
      type: "Fire",
      status: "Active",
      variant: "firetruck",
    },
    {
      id: 2,
      title: "Cebu City Rescue Unit",
      chief: "Chief Josh Dela Cruz",
      phone: "+63 917 123 4567",
      email: "floodunit@cebu.gov.ph",
      address: "123 Osmeña Boulevard, Cebu City",
      type: "Rescue",
      status: "Busy",
      variant: "rescue",
    },
  ]);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>("All");
  const [selectedStatus, setSelectedStatus] = useState<ServiceStatus | "All">("All");

  const handleAddService = (newService: Omit<Service, "id">) => {
    const nextId = services.length ? Math.max(...services.map(s => s.id)) + 1 : 1;
    setServices([...services, { ...newService, id: nextId }]);
  };

  const handleEditService = (updatedService: Service) => {
    setServices(
      services.map((s) => (s.id === updatedService.id ? updatedService : s))
    );
  };

  const handleDeleteService = (id: number) => {
    setServices(services.filter((s) => s.id !== id));
    setSelectedService(null);
  };

  // Filter services based on search, category, and status
  const filteredServices = services.filter((service) => {
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      service.title.toLowerCase().includes(query) ||
      service.chief.toLowerCase().includes(query) ||
      service.type.toLowerCase().includes(query) ||
      service.address.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === "All" || service.type === selectedCategory;

    const matchesStatus =
      selectedStatus === "All" || service.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar />

      <main className="flex-1 px-10 py-8 space-y-8">
        {/* HEADER */}
      <div className="flex flex-col items-center text-center md:items-end md:text-right w-full">
        <h1 className="text-[28px] font-semibold">Service Management</h1>
        <p className="text-gray-500">
          Register and manage emergency response services
        </p>
      </div>
        {/* NOTE */}
        <div className="bg-[#FFF3F3] border border-[#FFD6D6] rounded-2xl px-6 py-4 text-sm">
          <strong>Note: Automated Alert System</strong>
          <p className="mt-1">
            Services registered here will be automatically contacted when
            incident reports reach urgency thresholds.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard title="Fire Services" count={54} variant="fire" />
          <StatCard title="Flood Rescue Teams" count={54} variant="flood" />
        </div>

        {/* ACTION BAR */}
        <ActionBar
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          onAdd={handleAddService}
          onEdit={handleEditService}
          onDelete={handleDeleteService}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />

        {/* SERVICES */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Registered services</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  {...service}
                  isSelected={selectedService?.id === service.id}
                  onClick={() => setSelectedService(service)}
                />
              ))
            ) : (
              <div className="text-gray-500 col-span-2 text-center">
                No services found
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
