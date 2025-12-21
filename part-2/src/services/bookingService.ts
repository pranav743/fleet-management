import api from "@/lib/axios";

export interface Booking {
  _id: string;
  customerId: {
    _id: string;
    email: string;
    role: string;
  };
  vehicleId: {
    _id: string;
    make: string;
    vehicleModel: string;
    registrationNumber: string;
  };
  startDate: string;
  endDate: string;
  totalCost: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetBookingsResponse {
  status: string;
  results: number;
  pagination: PaginationInfo;
  data: {
    bookings: Booking[];
  };
}

export interface GetBookingsParams {
  page?: number;
  limit?: number;
  vehicleId?: string;
  customerId?: string;
  status?: string;
  registrationNumber?: string;
  startDate?: string;
  endDate?: string;
}

export const bookingService = {
  async getBookings(params?: GetBookingsParams): Promise<GetBookingsResponse> {
    const response = await api.get("/bookings", { params });
    return response.data;
  },

  async cancelBooking(id: string): Promise<{ status: string; message: string; data: { booking: Booking } }> {
    const response = await api.patch(`/bookings/${id}/cancel`);
    return response.data;
  },
};
