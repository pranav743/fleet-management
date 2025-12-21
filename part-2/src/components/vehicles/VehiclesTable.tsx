import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, TrendingUp, DollarSign, Calendar, Package } from "lucide-react";
import type { Vehicle, TopVehicle } from "@/services/vehicleService";
import { memo } from "react";

interface VehiclesTableProps {
  vehicles: Vehicle[];
  onDelete: (vehicle: Vehicle) => void;
}

interface TopVehiclesTableProps {
  vehicles: TopVehicle[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'IDLE':
      return 'bg-green-500/10 text-green-700 dark:text-green-400';
    case 'IN_TRANSIT':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    case 'MAINTENANCE':
      return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'SEDAN':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
    case 'SUV':
      return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400';
    case 'TRUCK':
      return 'bg-red-500/10 text-red-700 dark:text-red-400';
    case 'VAN':
      return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
  }
};

export const VehiclesTable = memo(function VehiclesTable({ vehicles, onDelete }: VehiclesTableProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (vehicles.length === 0) {
    return (
      <div className="rounded-md border bg-card">
        <div className="p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No vehicles found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Registration</TableHead>
            <TableHead>Make & Model</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle._id}>
              <TableCell className="font-mono font-semibold">{vehicle.registrationNumber}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{vehicle.make}</span>
                  <span className="text-sm text-muted-foreground">{vehicle.vehicleModel}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{vehicle.year}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeColor(vehicle.type)}`}>
                  {vehicle.type}
                </span>
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(vehicle.createdAt)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onDelete(vehicle)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

export const TopVehiclesTable = memo(function TopVehiclesTable({ vehicles }: TopVehiclesTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (vehicles.length === 0) {
    return (
      <div className="rounded-md border bg-card">
        <div className="p-12 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No top vehicles data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Registration</TableHead>
            <TableHead>Make & Model</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="text-right">Total Revenue</TableHead>
            <TableHead className="text-right">Bookings</TableHead>
            <TableHead className="text-right">Completed Trips</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle, index) => (
            <TableRow key={vehicle.vehicleId}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {index < 3 && (
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                      index === 1 ? 'bg-gray-400/20 text-gray-700 dark:text-gray-400' :
                      'bg-orange-500/20 text-orange-700 dark:text-orange-400'
                    }`}>
                      {index + 1}
                    </div>
                  )}
                  <span className="font-mono font-semibold">{vehicle.registrationNumber}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{vehicle.make}</span>
                  <span className="text-sm text-muted-foreground">{vehicle.model}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {vehicle.year}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{vehicle.ownerEmail}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1 font-semibold text-green-600 dark:text-green-400">
                  <DollarSign className="h-4 w-4" />
                  {formatCurrency(vehicle.totalRevenue)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                  {vehicle.totalBookings}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-400">
                  {vehicle.completedTrips}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});
