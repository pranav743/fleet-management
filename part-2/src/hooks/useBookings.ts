import { useState, useCallback, useEffect } from "react";
import type { Booking, PaginationInfo, GetBookingsParams } from "@/services/bookingService";
import { bookingService } from "@/services/bookingService";

interface UseBookingsResult {
  bookings: Booking[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setParams: (params: GetBookingsParams | ((prev: GetBookingsParams) => GetBookingsParams)) => void;
}

export function useBookings(initialParams?: GetBookingsParams): UseBookingsResult {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<GetBookingsParams>(initialParams || {});

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingService.getBookings(params);
      setBookings(response.data.bookings);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    pagination,
    isLoading,
    error,
    refetch: fetchBookings,
    setParams,
  };
}
