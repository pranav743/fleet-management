import Booking, { BookingStatus } from '../models/Booking';
import Trip, { TripStatus } from '../models/Trip';
import Vehicle, { VehicleStatus } from '../models/Vehicle';
import { IUser, UserRole } from '../models/User';
import mongoose from 'mongoose';

export const getDashboardStats = async (user: IUser) => {
  // If owner, return owner-specific analytics
  if (user.role === UserRole.OWNER) {
    return getOwnerAnalytics(user);
  }

  // If driver, return driver-specific analytics
  if (user.role === UserRole.DRIVER) {
    return getDriverAnalytics(user);
  }

  // Admin analytics (backward compatible)
  // Total Revenue
  const revenueStats = await Booking.aggregate([
    { $match: { status: { $ne: BookingStatus.CANCELLED } } },
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
  const totalBookings = await Booking.countDocuments({ status: { $ne: BookingStatus.CANCELLED } });
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

export const getOwnerAnalytics = async (user: IUser) => {
  // Get all vehicles owned by this owner
  const ownerVehicles = await Vehicle.find({ ownerId: user._id });
  const vehicleIds = ownerVehicles.map(v => v._id);

  if (vehicleIds.length === 0) {
    return {
      totalVehicles: 0,
      totalBookings: 0,
      totalRevenue: 0,
      completedTrips: 0,
      activeTrips: 0,
      topVehicles: [],
      tripDurations: [],
    };
  }

  // Total bookings for owner's vehicles
  const totalBookings = await Booking.countDocuments({
    vehicleId: { $in: vehicleIds },
    status: { $ne: BookingStatus.CANCELLED },
  });

  // Total revenue from bookings
  const revenueStats = await Booking.aggregate([
    { 
      $match: { 
        vehicleId: { $in: vehicleIds },
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] }
      } 
    },
    { $group: { _id: null, totalRevenue: { $sum: '$totalCost' } } },
  ]);
  const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

  // Completed and active trips
  const completedTrips = await Trip.countDocuments({
    vehicleId: { $in: vehicleIds },
    status: TripStatus.COMPLETED,
  });

  const activeTrips = await Trip.countDocuments({
    vehicleId: { $in: vehicleIds },
    status: { $in: [TripStatus.STARTED] },
  });

  // Top 3 most booked vehicles
  const topVehiclesData = await Booking.aggregate([
    { $match: { vehicleId: { $in: vehicleIds }, status: { $ne: BookingStatus.CANCELLED } } },
    { $group: { _id: '$vehicleId', bookingCount: { $sum: 1 }, totalRevenue: { $sum: '$totalCost' } } },
    { $sort: { bookingCount: -1 } },
    { $limit: 3 },
    {
      $lookup: {
        from: 'vehicles',
        localField: '_id',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    { $unwind: '$vehicle' },
    {
      $project: {
        vehicleId: '$_id',
        make: '$vehicle.make',
        model: '$vehicle.vehicleModel',
        registrationNumber: '$vehicle.registrationNumber',
        bookingCount: 1,
        totalRevenue: 1,
      },
    },
  ]);

  // Trip durations for each vehicle
  const tripDurationsData = await Trip.aggregate([
    { 
      $match: { 
        vehicleId: { $in: vehicleIds },
        status: TripStatus.COMPLETED,
        startTime: { $exists: true },
        endTime: { $exists: true },
      } 
    },
    {
      $group: {
        _id: '$vehicleId',
        totalTrips: { $sum: 1 },
        avgDuration: {
          $avg: {
            $divide: [
              { $subtract: ['$endTime', '$startTime'] },
              1000 * 60 * 60, // Convert to hours
            ],
          },
        },
        totalDuration: {
          $sum: {
            $divide: [
              { $subtract: ['$endTime', '$startTime'] },
              1000 * 60 * 60, // Convert to hours
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'vehicles',
        localField: '_id',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    { $unwind: '$vehicle' },
    {
      $project: {
        vehicleId: '$_id',
        make: '$vehicle.make',
        model: '$vehicle.vehicleModel',
        registrationNumber: '$vehicle.registrationNumber',
        totalTrips: 1,
        avgDurationHours: { $round: ['$avgDuration', 2] },
        totalDurationHours: { $round: ['$totalDuration', 2] },
      },
    },
    { $sort: { totalDurationHours: -1 } },
  ]);

  return {
    totalVehicles: ownerVehicles.length,
    totalBookings,
    totalRevenue,
    completedTrips,
    activeTrips,
    topVehicles: topVehiclesData,
    tripDurations: tripDurationsData,
  };
};

export const getDriverAnalytics = async (user: IUser) => {
  // Get all trips for this driver
  const totalTrips = await Trip.countDocuments({ driverId: user._id });
  
  const completedTrips = await Trip.countDocuments({
    driverId: user._id,
    status: TripStatus.COMPLETED,
  });

  const activeTrips = await Trip.countDocuments({
    driverId: user._id,
    status: { $in: [TripStatus.ASSIGNED, TripStatus.STARTED] },
  });

  // Get number of unique vehicles driven
  const vehiclesDriven = await Trip.distinct('vehicleId', { driverId: user._id });
  const totalVehiclesDriven = vehiclesDriven.length;

  // Get longest trip
  const longestTripData = await Trip.aggregate([
    {
      $match: {
        driverId: user._id,
        status: TripStatus.COMPLETED,
        startTime: { $exists: true },
        endTime: { $exists: true },
      },
    },
    {
      $addFields: {
        durationHours: {
          $divide: [
            { $subtract: ['$endTime', '$startTime'] },
            1000 * 60 * 60, // Convert to hours
          ],
        },
      },
    },
    { $sort: { durationHours: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicleId',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    { $unwind: '$vehicle' },
    {
      $lookup: {
        from: 'bookings',
        localField: 'bookingId',
        foreignField: '_id',
        as: 'booking',
      },
    },
    { $unwind: '$booking' },
    {
      $project: {
        tripId: '$_id',
        vehicle: {
          make: '$vehicle.make',
          model: '$vehicle.vehicleModel',
          registrationNumber: '$vehicle.registrationNumber',
        },
        durationHours: { $round: ['$durationHours', 2] },
        startTime: 1,
        endTime: 1,
        startOdometer: 1,
        endOdometer: 1,
      },
    },
  ]);

  // Get total driving hours
  const drivingHoursData = await Trip.aggregate([
    {
      $match: {
        driverId: user._id,
        status: TripStatus.COMPLETED,
        startTime: { $exists: true },
        endTime: { $exists: true },
      },
    },
    {
      $group: {
        _id: null,
        totalHours: {
          $sum: {
            $divide: [
              { $subtract: ['$endTime', '$startTime'] },
              1000 * 60 * 60,
            ],
          },
        },
        avgHours: {
          $avg: {
            $divide: [
              { $subtract: ['$endTime', '$startTime'] },
              1000 * 60 * 60,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalDrivingHours: { $round: ['$totalHours', 2] },
        averageTripHours: { $round: ['$avgHours', 2] },
      },
    },
  ]);

  // Get vehicles driven with trip counts
  const vehiclesData = await Trip.aggregate([
    { $match: { driverId: user._id } },
    {
      $group: {
        _id: '$vehicleId',
        tripCount: { $sum: 1 },
        completedTrips: {
          $sum: {
            $cond: [{ $eq: ['$status', TripStatus.COMPLETED] }, 1, 0],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'vehicles',
        localField: '_id',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    { $unwind: '$vehicle' },
    {
      $project: {
        vehicleId: '$_id',
        make: '$vehicle.make',
        model: '$vehicle.vehicleModel',
        registrationNumber: '$vehicle.registrationNumber',
        tripCount: 1,
        completedTrips: 1,
      },
    },
    { $sort: { tripCount: -1 } },
  ]);

  return {
    totalTrips,
    completedTrips,
    activeTrips,
    totalVehiclesDriven,
    longestTrip: longestTripData.length > 0 ? longestTripData[0] : null,
    drivingStats: drivingHoursData.length > 0 ? drivingHoursData[0] : {
      totalDrivingHours: 0,
      averageTripHours: 0,
    },
    vehiclesDriven: vehiclesData,
  };
};

export const getTopRevenueOwners = async (query: any = {}) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || 'totalRevenue';
  const order = query.order === 'asc' ? 1 : -1;

  const pipeline: any[] = [
    {
      $lookup: {
        from: 'bookings',
        localField: '_id',
        foreignField: 'vehicleId',
        as: 'bookings',
      },
    },
    { $unwind: { path: '$bookings', preserveNullAndEmptyArrays: true } },
    {
      $match: {
        'bookings.status': { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
      },
    },
    {
      $group: {
        _id: '$ownerId',
        totalRevenue: { $sum: '$bookings.totalCost' },
        totalBookings: { $sum: 1 },
        vehicleCount: { $addToSet: '$_id' },
      },
    },
    {
      $addFields: {
        vehicleCount: { $size: '$vehicleCount' },
      },
    },
  ];

  if (query.minRevenue) {
    pipeline.push({
      $match: {
        totalRevenue: { $gte: parseFloat(query.minRevenue) },
      },
    });
  }

  if (query.minBookings) {
    pipeline.push({
      $match: {
        totalBookings: { $gte: parseInt(query.minBookings) },
      },
    });
  }

  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await Vehicle.aggregate(countPipeline);
  const totalItems = countResult.length > 0 ? countResult[0].total : 0;

  pipeline.push(
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'owner',
      },
    },
    { $unwind: '$owner' },
  );

  if (query.email) {
    pipeline.push({
      $match: {
        'owner.email': { $regex: query.email, $options: 'i' },
      },
    });
  }

  const sortField: any = {};
  sortField[sortBy] = order;
  pipeline.push(
    { $sort: sortField },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        ownerId: '$_id',
        email: '$owner.email',
        totalRevenue: 1,
        totalBookings: 1,
        vehicleCount: 1,
      },
    },
  );

  const topOwners = await Vehicle.aggregate(pipeline);

  return {
    owners: topOwners,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(totalItems / limit),
      hasPrevPage: page > 1,
    },
  };
};

export const getTopVehicles = async (query: any = {}) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || 'totalRevenue';
  const order = query.order === 'asc' ? 1 : -1;

  const pipeline: any[] = [
    {
      $match: {
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
      },
    },
    {
      $group: {
        _id: '$vehicleId',
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$totalCost' },
      },
    },
  ];

  if (query.minRevenue) {
    pipeline.push({
      $match: {
        totalRevenue: { $gte: parseFloat(query.minRevenue) },
      },
    });
  }

  if (query.minBookings) {
    pipeline.push({
      $match: {
        totalBookings: { $gte: parseInt(query.minBookings) },
      },
    });
  }

  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await Booking.aggregate(countPipeline);
  const totalItems = countResult.length > 0 ? countResult[0].total : 0;

  pipeline.push(
    {
      $lookup: {
        from: 'vehicles',
        localField: '_id',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    { $unwind: '$vehicle' },
    {
      $lookup: {
        from: 'users',
        localField: 'vehicle.ownerId',
        foreignField: '_id',
        as: 'owner',
      },
    },
    { $unwind: '$owner' },
    {
      $lookup: {
        from: 'trips',
        localField: '_id',
        foreignField: 'vehicleId',
        as: 'trips',
      },
    },
    {
      $addFields: {
        completedTrips: {
          $size: {
            $filter: {
              input: '$trips',
              as: 'trip',
              cond: { $eq: ['$$trip.status', TripStatus.COMPLETED] },
            },
          },
        },
      },
    },
  );

  if (query.make) {
    pipeline.push({
      $match: {
        'vehicle.make': { $regex: query.make, $options: 'i' },
      },
    });
  }

  if (query.model) {
    pipeline.push({
      $match: {
        'vehicle.vehicleModel': { $regex: query.model, $options: 'i' },
      },
    });
  }

  if (query.registrationNumber) {
    pipeline.push({
      $match: {
        'vehicle.registrationNumber': { $regex: query.registrationNumber, $options: 'i' },
      },
    });
  }

  const sortField: any = {};
  sortField[sortBy] = order;
  pipeline.push(
    { $sort: sortField },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        vehicleId: '$_id',
        make: '$vehicle.make',
        model: '$vehicle.vehicleModel',
        registrationNumber: '$vehicle.registrationNumber',
        year: '$vehicle.year',
        ownerEmail: '$owner.email',
        totalBookings: 1,
        totalRevenue: 1,
        completedTrips: 1,
      },
    },
  );

  const topVehicles = await Booking.aggregate(pipeline);

  return {
    vehicles: topVehicles,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(totalItems / limit),
      hasPrevPage: page > 1,
    },
  };
};

export const getTopCustomers = async (query: any = {}) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || 'totalTrips';
  const order = query.order === 'asc' ? 1 : -1;

  const pipeline: any[] = [
    {
      $lookup: {
        from: 'bookings',
        localField: 'bookingId',
        foreignField: '_id',
        as: 'booking',
      },
    },
    { $unwind: '$booking' },
    {
      $group: {
        _id: '$booking.customerId',
        totalTrips: { $sum: 1 },
        completedTrips: {
          $sum: {
            $cond: [{ $eq: ['$status', TripStatus.COMPLETED] }, 1, 0],
          },
        },
        totalSpent: { $sum: '$booking.totalCost' },
        vehiclesUsed: { $addToSet: '$vehicleId' },
      },
    },
    {
      $addFields: {
        uniqueVehiclesUsed: { $size: '$vehiclesUsed' },
      },
    },
  ];

  if (query.minTrips) {
    pipeline.push({
      $match: {
        totalTrips: { $gte: parseInt(query.minTrips) },
      },
    });
  }

  if (query.minSpent) {
    pipeline.push({
      $match: {
        totalSpent: { $gte: parseFloat(query.minSpent) },
      },
    });
  }

  const countPipeline = [...pipeline, { $count: 'total' }];
  const countResult = await Trip.aggregate(countPipeline);
  const totalItems = countResult.length > 0 ? countResult[0].total : 0;

  pipeline.push(
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'customer',
      },
    },
    { $unwind: '$customer' },
  );

  if (query.email) {
    pipeline.push({
      $match: {
        'customer.email': { $regex: query.email, $options: 'i' },
      },
    });
  }

  const sortField: any = {};
  sortField[sortBy] = order;
  pipeline.push(
    { $sort: sortField },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        customerId: '$_id',
        email: '$customer.email',
        totalTrips: 1,
        completedTrips: 1,
        totalSpent: 1,
        uniqueVehiclesUsed: 1,
      },
    },
  );

  const topCustomers = await Trip.aggregate(pipeline);

  return {
    customers: topCustomers,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(totalItems / limit),
      hasPrevPage: page > 1,
    },
  };
};
