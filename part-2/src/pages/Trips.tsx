import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { useBookings } from "@/hooks/useBookings";
import { CancelBookingDialog } from "@/components/trips/CancelBookingDialog";
import { TripsTable } from "@/components/trips/TripsTable";
import { PaginationControls } from "@/components/drivers/PaginationControls";
import { FilterControls, type BookingFilters } from "@/components/trips/FilterControls";
import type { Booking, GetBookingsParams } from "@/services/bookingService";

export default function Trips() {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [bookingParams, setBookingParams] = useState<GetBookingsParams>({
    page: 1,
    limit: 10,
  });

  const { 
    bookings, 
    pagination, 
    isLoading, 
    error, 
    refetch, 
    setParams: updateBookingParams 
  } = useBookings(bookingParams);

  const handleFilterChange = useCallback((filters: BookingFilters) => {
    setBookingParams(prev => ({
      ...prev,
      ...filters,
      page: 1,
    }));
    updateBookingParams(prev => ({
      ...prev,
      ...filters,
      page: 1,
    }));
  }, [updateBookingParams]);

  const handlePageChange = useCallback((page: number) => {
    setBookingParams(prev => ({ ...prev, page }));
    updateBookingParams(prev => ({ ...prev, page }));
  }, [updateBookingParams]);

  const handleLimitChange = useCallback((limit: number) => {
    setBookingParams(prev => ({ ...prev, limit, page: 1 }));
    updateBookingParams(prev => ({ ...prev, limit, page: 1 }));
  }, [updateBookingParams]);

  const handleCancelClick = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  }, []);

  const stats = useMemo(() => {
    const total = pagination?.totalItems || 0;
    const ongoing = bookings.filter(b => b.status === "CONFIRMED" || b.status === "PENDING").length;
    const completed = bookings.filter(b => b.status === "COMPLETED").length;
    return { total, ongoing, completed };
  }, [bookings, pagination]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Trips</h2>
        <p className="text-muted-foreground">Track and manage trips</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Trips</CardTitle>
            <CardDescription>All time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ongoing</CardTitle>
            <CardDescription>In progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ongoing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
            <CardDescription>Finished trips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <FilterControls onFilterChange={handleFilterChange} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {bookings.length} of {pagination?.totalItems || 0} bookings
            </p>
            <Select
              value={String(bookingParams.limit)}
              onValueChange={(value) => handleLimitChange(Number(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <TripsTable bookings={bookings} onCancel={handleCancelClick} />
          
          {pagination && pagination.totalPages > 1 && (
            <PaginationControls pagination={pagination} onPageChange={handlePageChange} />
          )}
        </div>
      )}

      <CancelBookingDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        bookingId={selectedBooking?._id || null}
        onSuccess={refetch}
      />
    </div>
  );
}

