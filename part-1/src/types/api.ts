export interface Vehicle {
  _id: string;
  make: string;
  vehicleModel: string;
  registrationNumber: string;
  type: string;
  status: "IDLE" | "MAINTENANCE" | "ACTIVE" | "IN_USE";
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  _id: string;
  customerId: string;
  vehicleId: Vehicle | string;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
}

export interface Trip {
  _id: string;
  bookingId: Booking | string;
  driverId: string;
  vehicleId: Vehicle | string;
  status: "ASSIGNED" | "STARTED" | "COMPLETED";
  startOdometer?: number;
  startTime?: string;
}

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
