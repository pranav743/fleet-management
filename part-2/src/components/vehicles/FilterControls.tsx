import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { memo, useState } from "react";
import type { VehicleStatus, VehicleType } from "@/services/vehicleService";

interface FilterControlsProps {
  onFilterChange: (filters: VehicleFilters) => void;
  showTopVehicleFilters?: boolean;
}

export interface VehicleFilters {
  make?: string;
  model?: string;
  registrationNumber?: string;
  status?: VehicleStatus;
  type?: VehicleType;
  year?: number;
  minRevenue?: number;
  minBookings?: number;
}

export const FilterControls = memo(function FilterControls({ 
  onFilterChange, 
  showTopVehicleFilters = false 
}: FilterControlsProps) {
  const [filters, setFilters] = useState<VehicleFilters>({});
  const [searchTerm, setSearchTerm] = useState("");

  const handleFilterUpdate = (key: keyof VehicleFilters, value: string | number | undefined) => {
    const newFilters = { ...filters };
    
    if (value === undefined || value === "" || value === "all") {
      delete newFilters[key];
    } else {
      if (key === 'year' || key === 'minRevenue' || key === 'minBookings') {
        newFilters[key] = Number(value);
      } else {
        (newFilters as Record<string, string | number>)[key] = value;
      }
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const newFilters = { ...filters, registrationNumber: searchTerm.trim() };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm("");
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by registration number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSearch} variant="default">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          {hasActiveFilters && (
            <Button onClick={handleClearFilters} variant="outline">
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Make</label>
          <Input
            placeholder="e.g., Toyota"
            value={filters.make || ""}
            onChange={(e) => handleFilterUpdate("make", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Model</label>
          <Input
            placeholder="e.g., Camry"
            value={filters.model || ""}
            onChange={(e) => handleFilterUpdate("model", e.target.value)}
          />
        </div>

        {!showTopVehicleFilters && (
          <>
            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => handleFilterUpdate("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="IDLE">Idle</SelectItem>
                  <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Type</label>
              <Select
                value={filters.type || "all"}
                onValueChange={(value) => handleFilterUpdate("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="SEDAN">Sedan</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="TRUCK">Truck</SelectItem>
                  <SelectItem value="VAN">Van</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Year</label>
              <Input
                type="number"
                placeholder="e.g., 2023"
                value={filters.year || ""}
                onChange={(e) => handleFilterUpdate("year", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </>
        )}

        {showTopVehicleFilters && (
          <>
            <div>
              <label className="mb-2 block text-sm font-medium">Min Revenue</label>
              <Input
                type="number"
                placeholder="e.g., 5000"
                value={filters.minRevenue || ""}
                onChange={(e) => handleFilterUpdate("minRevenue", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Min Bookings</label>
              <Input
                type="number"
                placeholder="e.g., 10"
                value={filters.minBookings || ""}
                onChange={(e) => handleFilterUpdate("minBookings", e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>{Object.keys(filters).length} filter(s) applied</span>
        </div>
      )}
    </div>
  );
});
