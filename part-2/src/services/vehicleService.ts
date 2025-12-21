import api from '@/lib/axios';

export type VehicleStatus = 'IDLE' | 'IN_TRANSIT' | 'MAINTENANCE';
export type VehicleType = 'SUV' | 'SEDAN' | 'TRUCK' | 'VAN';

export interface Vehicle {
  _id: string;
  make: string;
  vehicleModel: string;
  status: VehicleStatus;
  type: VehicleType;
  registrationNumber: string;
  year: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopVehicle {
  vehicleId: string;
  make: string;
  model: string;
  registrationNumber: string;
  year: number;
  ownerEmail: string;
  totalBookings: number;
  totalRevenue: number;
  completedTrips: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetVehiclesParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'make' | 'vehicleModel' | 'year' | 'status' | 'type';
  order?: 'asc' | 'desc';
  status?: VehicleStatus;
  type?: VehicleType;
  make?: string;
  model?: string;
  registrationNumber?: string;
  year?: number;
}

export interface GetTopVehiclesParams {
  page?: number;
  limit?: number;
  sortBy?: 'totalRevenue' | 'totalBookings' | 'completedTrips';
  order?: 'asc' | 'desc';
  make?: string;
  model?: string;
  registrationNumber?: string;
  minRevenue?: number;
  minBookings?: number;
}

export interface GetVehiclesResponse {
  status: string;
  results: number;
  pagination: PaginationInfo;
  data: {
    vehicles: Vehicle[];
  };
}

export interface GetTopVehiclesResponse {
  status: string;
  results: number;
  pagination: PaginationInfo;
  data: {
    vehicles: TopVehicle[];
  };
}

export const vehicleService = {
  getVehicles: async (params: GetVehiclesParams = {}): Promise<GetVehiclesResponse> => {
    const response = await api.get('/vehicles', { params });
    return response.data;
  },

  getTopVehicles: async (params: GetTopVehiclesParams = {}): Promise<GetTopVehiclesResponse> => {
    const response = await api.get('/analytics/top-vehicles', { params });
    return response.data;
  },

  deleteVehicle: async (id: string): Promise<void> => {
    await api.delete(`/vehicles/${id}`);
  },
};
