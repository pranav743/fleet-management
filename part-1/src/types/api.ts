export interface Vehicle {
  _id: string;
  make: string;
  vehicleModel: string;
  registrationNumber: string;
  type: string;
  status: "IDLE" | "MAINTENANCE" | "ACTIVE" | "IN_USE";
  ownerId: string;
  driverId?: string | null;
  availableForBooking?: boolean;
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

export interface TopVehicle {
  vehicleId: string;
  make: string;
  model: string;
  registrationNumber: string;
  bookingCount: number;
  totalRevenue: number;
}

export interface TripDuration {
  vehicleId: string;
  make: string;
  model: string;
  registrationNumber: string;
  totalTrips: number;
  avgDurationHours: number;
  totalDurationHours: number;
}

export interface OwnerAnalytics {
  totalVehicles: number;
  totalBookings: number;
  totalRevenue: number;
  completedTrips: number;
  activeTrips: number;
  topVehicles: TopVehicle[];
  tripDurations: TripDuration[];
}

export interface VehicleDriven {
  vehicleId: string;
  make: string;
  model: string;
  registrationNumber: string;
  tripCount: number;
  completedTrips: number;
}

export interface LongestTrip {
  tripId: string;
  vehicle: {
    make: string;
    model: string;
    registrationNumber: string;
  };
  durationHours: number;
  startTime: string;
  endTime: string;
  startOdometer: number;
  endOdometer: number;
}

export interface DriverAnalytics {
  totalTrips: number;
  completedTrips: number;
  activeTrips: number;
  totalVehiclesDriven: number;
  longestTrip: LongestTrip | null;
  drivingStats: {
    totalDrivingHours: number;
    averageTripHours: number;
  };
  vehiclesDriven: VehicleDriven[];
}
