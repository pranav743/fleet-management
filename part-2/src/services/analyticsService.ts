import api from '@/lib/axios';

export interface DashboardStats {
  totalRevenue: number;
  activeTrips: number;
  vehicleUtilization: {
    totalVehicles: number;
    activeVehicles: number;
    utilizationRate: number;
  };
  totalBookings: number;
  completedTrips: number;
}

export interface TopOwner {
  ownerId: string;
  email: string;
  totalRevenue: number;
  totalBookings: number;
  vehicleCount: number;
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

export interface TopCustomer {
  customerId: string;
  email: string;
  totalTrips: number;
  completedTrips: number;
  totalSpent: number;
  uniqueVehiclesUsed: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/analytics/dashboard');
  return response.data.data.stats;
};

export const getTopOwners = async (limit: number = 10): Promise<TopOwner[]> => {
  const response = await api.get('/analytics/top-owners', { params: { limit } });
  return response.data.data.owners;
};

export const getTopVehicles = async (limit: number = 10): Promise<TopVehicle[]> => {
  const response = await api.get('/analytics/top-vehicles', { params: { limit } });
  return response.data.data.vehicles;
};

export const getTopCustomers = async (limit: number = 10): Promise<TopCustomer[]> => {
  const response = await api.get('/analytics/top-customers', { params: { limit } });
  return response.data.data.customers;
};
