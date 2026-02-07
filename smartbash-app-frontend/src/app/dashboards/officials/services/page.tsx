"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../../../components/core-ui/official-components/Sidebar";
import StatCard from "../../../../components/core-ui/official-components/services-components/StatCard";
import ActionBar from "@/components/core-ui/official-components/services-components/ActionBar";
import ServiceCard from "@/components/core-ui/official-components/services-components/ServiceCard";
import { ServiceStatus, ServiceCategory } from "@/components/core-ui/official-components/services-components/ActionBar";
import { apiFetch } from "@/lib/api";

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
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>("All");
  const [selectedStatus, setSelectedStatus] = useState<ServiceStatus | "All">("All");

  const loadServices = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await apiFetch("/auth/officials/services/", { method: "GET" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load services");
      const list: Service[] = (data.services || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        chief: s.chief || "",
        phone: s.phone || "",
        email: s.email || "",
        address: s.address || "",
        type: s.type === "Fire" ? "Fire" : "Rescue",
        status: s.status,
        variant: s.type === "Fire" ? "firetruck" : "rescue",
      }));
      setServices(list);
    } catch (err: any) {
      setError(err.message || "Failed to load services");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleAddService = async (newService: Omit<Service, "id">) => {
    try {
      const res = await apiFetch("/auth/officials/services/create/", {
        method: "POST",
        body: JSON.stringify({
          title: newService.title,
          phone: newService.phone,
          email: newService.email,
          address: newService.address,
          type: newService.type,
          status: newService.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Create failed");
      await loadServices();
    } catch (err: any) {
      setError(err.message || "Create failed");
    }
  };

  const handleEditService = async (updatedService: Service) => {
    try {
      const res = await apiFetch("/auth/officials/services/update/", {
        method: "POST",
        body: JSON.stringify({
          id: updatedService.id,
          title: updatedService.title,
          phone: updatedService.phone,
          email: updatedService.email,
          address: updatedService.address,
          type: updatedService.type,
          status: updatedService.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      await loadServices();
    } catch (err: any) {
      setError(err.message || "Update failed");
    }
  };

  const handleDeleteService = async (id: number) => {
    try {
      const res = await apiFetch("/auth/officials/services/delete/", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      await loadServices();
      setSelectedService(null);
    } catch (err: any) {
      setError(err.message || "Delete failed");
    }
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
          <StatCard
            title="Fire Services"
            count={services.filter((s) => s.type === "Fire").length}
            variant="fire"
          />
          <StatCard
            title="Flood Rescue Teams"
            count={services.filter((s) => s.type === "Rescue").length}
            variant="flood"
          />
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {isLoading && (
          <div className="text-sm text-gray-500">Loading services...</div>
        )}

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


