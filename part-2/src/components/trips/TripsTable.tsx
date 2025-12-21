import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import type { Booking } from "@/services/bookingService";
import { memo } from "react";
import { cn } from "@/lib/utils";

interface TripsTableProps {
  bookings: Booking[];
  onCancel: (booking: Booking) => void;
}

const statusColors = {
  PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  CONFIRMED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
  COMPLETED: "bg-green-500/10 text-green-500 border-green-500/20",
};

export const TripsTable = memo(function TripsTable({ bookings, onCancel }: TripsTableProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (bookings.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No trips found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking._id}>
              <TableCell className="font-medium">{booking.customerId.email}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{booking.vehicleId.make} {booking.vehicleId.vehicleModel}</span>
                  <span className="text-xs text-muted-foreground">{booking.vehicleId.registrationNumber}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(booking.startDate)}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(booking.endDate)}</TableCell>
              <TableCell className="font-medium">{formatCurrency(booking.totalCost)}</TableCell>
              <TableCell>
                <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", statusColors[booking.status])}>
                  {booking.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onCancel(booking)}
                  disabled={booking.status === "CANCELLED" || booking.status === "COMPLETED"}
                >
                  <XCircle className={cn("h-4 w-4", booking.status === "CANCELLED" || booking.status === "COMPLETED" ? "text-muted-foreground" : "text-destructive")} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});
