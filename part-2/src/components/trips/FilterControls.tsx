import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { memo, useState } from "react";

interface FilterControlsProps {
  onFilterChange: (filters: BookingFilters) => void;
}

export interface BookingFilters {
  status?: string;
  registrationNumber?: string;
  vehicleId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

export const FilterControls = memo(function FilterControls({ onFilterChange }: FilterControlsProps) {
  const [filters, setFilters] = useState<BookingFilters>({});
  const [searchTerm, setSearchTerm] = useState("");

  const handleFilterUpdate = (key: keyof BookingFilters, value: string | undefined) => {
    const newFilters = { ...filters };
    
    if (value === undefined || value === "" || value === "all") {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
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

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium">Status</label>
          <Select 
            value={filters.status || "all"} 
            onValueChange={(value) => handleFilterUpdate("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Start Date</label>
          <Input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => handleFilterUpdate("startDate", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">End Date</label>
          <Input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => handleFilterUpdate("endDate", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
});
