import Booking, { BookingStatus } from '../models/Booking';
import Trip, { TripStatus } from '../models/Trip';
import Vehicle, { VehicleStatus } from '../models/Vehicle';

export const getDashboardStats = async () => {
  // Total Revenue
  const revenueStats = await Booking.aggregate([
    { $match: { status: BookingStatus.CONFIRMED } }, // Or COMPLETED depending on business logic
    { $group: { _id: null, totalRevenue: { $sum: '$totalCost' } } },
  ]);
  const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

  // Active Trips
  const activeTrips = await Trip.countDocuments({ status: TripStatus.STARTED });

  // Vehicle Utilization
  const totalVehicles = await Vehicle.countDocuments();
  const activeVehicles = await Vehicle.countDocuments({ status: { $ne: VehicleStatus.IDLE } });
  const utilizationRate = totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;

  // Additional Stats (Optional)
  const totalBookings = await Booking.countDocuments();
  const completedTrips = await Trip.countDocuments({ status: TripStatus.COMPLETED });

  return {
    totalRevenue,
    activeTrips,
    vehicleUtilization: {
      totalVehicles,
      activeVehicles,
      utilizationRate: Math.round(utilizationRate * 100) / 100,
    },
    totalBookings,
    completedTrips,
  };
};
