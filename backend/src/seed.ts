import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User, { UserRole } from './models/User';
import Vehicle, { VehicleType, VehicleStatus } from './models/Vehicle';
import Booking, { BookingStatus } from './models/Booking';
import Trip, { TripStatus } from './models/Trip';

dotenv.config();

// ===========================
// SEEDER CONFIGURATION
// ===========================
interface SeederConfig {
  users: {
    admins: number;
    owners: number;
    drivers: number;
    customers: number;
  };
  vehicles: {
    perOwner: number;
    maintenanceRatio: number; // 0-1 (percentage of vehicles in maintenance)
  };
  bookings: {
    total: number;
    cancelledRatio: number; // 0-1
    completedRatio: number; // 0-1
    confirmedRatio: number; // 0-1
    // pending will be the rest
  };
  trips: {
    assignedRatio: number; // 0-1
    startedRatio: number; // 0-1
    // completed will be the rest
  };
  dateRange: {
    pastMonths: number; // How many months back to generate data
    futureMonths: number; // How many months forward for future bookings
  };
}

const DEFAULT_CONFIG: SeederConfig = {
  users: {
    admins: 1,
    owners: 10,
    drivers: 30,
    customers: 100,
  },
  vehicles: {
    perOwner: 5,
    maintenanceRatio: 0.1, // 10% in maintenance
  },
  bookings: {
    total: 500,
    cancelledRatio: 0.15, // 15% cancelled
    completedRatio: 0.60, // 60% completed
    confirmedRatio: 0.15, // 15% confirmed
    // 10% will be pending
  },
  trips: {
    assignedRatio: 0.1, // 10% just assigned
    startedRatio: 0.2, // 20% in progress
    // 70% completed
  },
  dateRange: {
    pastMonths: 6,
    futureMonths: 2,
  },
};

// ===========================
// UTILITY FUNCTIONS
// ===========================

const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandomBoolean = (probability: number = 0.5): boolean => {
  return Math.random() < probability;
};

// ===========================
// DATA GENERATORS
// ===========================

class DataGenerator {
  private firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Sai', 'Vihaan', 'Rohan', 'Ishaan',
    'Reyansh', 'Arnav', 'Shaurya', 'Atharva', 'Advik', 'Pranav', 'Ayush',
    'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Kiara', 'Ishita', 'Navya', 'Priya',
    'Anushka', 'Riya', 'Aanya', 'Sara', 'Kavya', 'Pari', 'Shanaya'
  ];

  private lastNames = [
    'Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Shah', 'Reddy', 'Rao',
    'Desai', 'Mehta', 'Joshi', 'Verma', 'Nair', 'Iyer', 'Menon', 'Agarwal',
    'Kapoor', 'Malhotra', 'Bansal', 'Chopra', 'Shetty', 'Kulkarni', 'Jain',
    'Bhat', 'Pandey', 'Thakur', 'Saxena', 'Mishra', 'Pillai', 'Yadav'
  ];

  private carMakes = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia',
    'Volkswagen', 'Mercedes-Benz', 'BMW', 'Tesla', 'Audi', 'Mazda', 'Subaru'
  ];

  private carModels: { [key: string]: string[] } = {
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', 'Sienna'],
    'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey', 'Ridgeline'],
    'Ford': ['F-150', 'Explorer', 'Escape', 'Transit', 'Mustang', 'Edge'],
    'Chevrolet': ['Silverado', 'Equinox', 'Tahoe', 'Traverse', 'Suburban', 'Colorado'],
    'Nissan': ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Frontier', 'NV'],
    'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Kona'],
    'Kia': ['Optima', 'Forte', 'Sportage', 'Sorento', 'Telluride', 'Carnival'],
    'Volkswagen': ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'ID.4', 'Transporter'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'GLE', 'GLS', 'Sprinter', 'S-Class'],
    'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'X7', '7 Series'],
    'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y'],
    'Audi': ['A4', 'A6', 'Q5', 'Q7', 'Q8', 'A8'],
    'Mazda': ['Mazda3', 'Mazda6', 'CX-5', 'CX-9', 'CX-30', 'MX-5'],
    'Subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'Ascent', 'Crosstrek'],
  };

  generateEmail(firstName: string, lastName: string, role: string, index: number): string {
    const sanitizedFirst = firstName.toLowerCase();
    const sanitizedLast = lastName.toLowerCase();
    return `${sanitizedFirst}.${sanitizedLast}.${role.toLowerCase().slice(0,2)}${index}@fleet.com`;
  }

  generateName(): { firstName: string; lastName: string } {
    return {
      firstName: getRandomElement(this.firstNames),
      lastName: getRandomElement(this.lastNames),
    };
  }

  generateRegistrationNumber(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    let reg = '';
    // Format: AB12CD3456
    for (let i = 0; i < 2; i++) reg += letters[Math.floor(Math.random() * letters.length)];
    for (let i = 0; i < 2; i++) reg += numbers[Math.floor(Math.random() * numbers.length)];
    for (let i = 0; i < 2; i++) reg += letters[Math.floor(Math.random() * letters.length)];
    for (let i = 0; i < 4; i++) reg += numbers[Math.floor(Math.random() * numbers.length)];
    
    return reg;
  }

  generateVehicle(make?: string): { make: string; model: string; type: VehicleType } {
    const selectedMake = make || getRandomElement(this.carMakes);
    const model = getRandomElement(this.carModels[selectedMake]);
    
    // Determine type based on model name
    let type: VehicleType;
    if (model.includes('F-150') || model.includes('Silverado') || model.includes('Tacoma') || 
        model.includes('Frontier') || model.includes('Colorado') || model.includes('Ridgeline')) {
      type = VehicleType.TRUCK;
    } else if (model.includes('Transit') || model.includes('Sienna') || model.includes('Odyssey') || 
               model.includes('Carnival') || model.includes('Sprinter') || model.includes('NV') ||
               model.includes('Transporter')) {
      type = VehicleType.VAN;
    } else if (model.includes('RAV4') || model.includes('Explorer') || model.includes('Tahoe') ||
               model.includes('X3') || model.includes('X5') || model.includes('X7') ||
               model.includes('GLE') || model.includes('GLS') || model.includes('Q5') ||
               model.includes('Q7') || model.includes('Q8')) {
      type = VehicleType.SUV;
    } else {
      type = VehicleType.SEDAN;
    }
    
    return { make: selectedMake, model, type };
  }
}

// ===========================
// SEEDER CLASS
// ===========================

class DatabaseSeeder {
  private config: SeederConfig;
  private generator: DataGenerator;
  private userIds: {
    admins: mongoose.Types.ObjectId[];
    owners: mongoose.Types.ObjectId[];
    drivers: mongoose.Types.ObjectId[];
    customers: mongoose.Types.ObjectId[];
  };
  private vehicleIds: mongoose.Types.ObjectId[];
  
  private skipConnection: boolean;

  constructor(config: SeederConfig = DEFAULT_CONFIG, skipConnection: boolean = false) {
    this.config = config;
    this.generator = new DataGenerator();
    this.userIds = { admins: [], owners: [], drivers: [], customers: [] };
    this.vehicleIds = [];
    this.skipConnection = skipConnection;
  }

  async connect(): Promise<void> {
    try {
      await mongoose.connect(process.env.MONGO_URI as string);
      console.log('✓ MongoDB Connected at ', process.env.MONGO_URI);
    } catch (error) {
      console.error('✗ MongoDB Connection Error:', (error as Error).message);
      process.exit(1);
    }
  }

  async clearDatabase(): Promise<void> {
    console.log('\n🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      Booking.deleteMany({}),
      Trip.deleteMany({}),
    ]);
    console.log('✓ Database cleared');
  }

  async seedUsers(): Promise<void> {
    console.log('\n👥 Seeding Users...');
    
    const hashedPassword = await bcrypt.hash('password', 10);
    const users: any[] = [];

    // Create single Admin account (fixed)
    users.push({
      email: 'admin@fleet.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    // Create Owners
    for (let i = 0; i < this.config.users.owners; i++) {
      const { firstName, lastName } = this.generator.generateName();
      users.push({
        email: this.generator.generateEmail(firstName, lastName, 'owner', i + 1),
        password: hashedPassword,
        role: UserRole.OWNER,
      });
    }

    // Create Drivers
    for (let i = 0; i < this.config.users.drivers; i++) {
      const { firstName, lastName } = this.generator.generateName();
      users.push({
        email: this.generator.generateEmail(firstName, lastName, 'driver', i + 1),
        password: hashedPassword,
        role: UserRole.DRIVER,
      });
    }

    // Create Customers
    for (let i = 0; i < this.config.users.customers; i++) {
      const { firstName, lastName } = this.generator.generateName();
      users.push({
        email: this.generator.generateEmail(firstName, lastName, 'customer', i + 1),
        password: hashedPassword,
        role: UserRole.CUSTOMER,
      });
    }

    const createdUsers = await User.insertMany(users);
    
    // Categorize user IDs by role
    createdUsers.forEach(user => {
      switch (user.role) {
        case UserRole.ADMIN:
          this.userIds.admins.push(user._id);
          break;
        case UserRole.OWNER:
          this.userIds.owners.push(user._id);
          break;
        case UserRole.DRIVER:
          this.userIds.drivers.push(user._id);
          break;
        case UserRole.CUSTOMER:
          this.userIds.customers.push(user._id);
          break;
      }
    });

    console.log(`✓ Created ${createdUsers.length} users`);
    console.log(`  - ${this.userIds.admins.length} Admins`);
    console.log(`  - ${this.userIds.owners.length} Owners`);
    console.log(`  - ${this.userIds.drivers.length} Drivers`);
    console.log(`  - ${this.userIds.customers.length} Customers`);
  }

  async seedVehicles(): Promise<void> {
    console.log('\n🚗 Seeding Vehicles...');
    
    const vehicles: any[] = [];
    const registrationNumbers = new Set<string>();

    for (const ownerId of this.userIds.owners) {
      const vehicleCount = getRandomInt(
        Math.max(1, this.config.vehicles.perOwner - 2),
        this.config.vehicles.perOwner + 2
      );

      for (let i = 0; i < vehicleCount; i++) {
        const { make, model, type } = this.generator.generateVehicle();
        
        // Ensure unique registration number
        let registrationNumber: string;
        do {
          registrationNumber = this.generator.generateRegistrationNumber();
        } while (registrationNumbers.has(registrationNumber));
        registrationNumbers.add(registrationNumber);

        // Determine status
        let status = VehicleStatus.IDLE;
        if (getRandomBoolean(this.config.vehicles.maintenanceRatio)) {
          status = VehicleStatus.MAINTENANCE;
        }

        // Assign driver (some vehicles may not have drivers)
        const driverId = getRandomBoolean(0.7) ? getRandomElement(this.userIds.drivers) : undefined;

        vehicles.push({
          ownerId,
          driverId,
          make,
          vehicleModel: model,
          registrationNumber,
          type,
          status,
        });
      }
    }

    const createdVehicles = await Vehicle.insertMany(vehicles);
    this.vehicleIds = createdVehicles.map(v => v._id);

    console.log(`✓ Created ${createdVehicles.length} vehicles`);
    
    // Count by type
    const typeCounts = createdVehicles.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  - ${count} ${type}s`);
    });
  }

  async seedBookings(): Promise<void> {
    console.log('\n📅 Seeding Bookings...');
    
    const bookings: any[] = [];
    const now = new Date();
    const pastDate = new Date(now);
    pastDate.setMonth(pastDate.getMonth() - this.config.dateRange.pastMonths);
    const futureDate = new Date(now);
    futureDate.setMonth(futureDate.getMonth() + this.config.dateRange.futureMonths);

    // Calculate counts for each status
    const total = this.config.bookings.total;
    const cancelled = Math.floor(total * this.config.bookings.cancelledRatio);
    const completed = Math.floor(total * this.config.bookings.completedRatio);
    const confirmed = Math.floor(total * this.config.bookings.confirmedRatio);
    const pending = total - cancelled - completed - confirmed;

    // Get only idle vehicles for new bookings
    const availableVehicles = await Vehicle.find({ 
      status: { $in: [VehicleStatus.IDLE, VehicleStatus.IN_TRANSIT] } 
    });

    let bookingIndex = 0;

    // Helper function to create booking
    const createBooking = (status: BookingStatus, isPast: boolean = false) => {
      const customerId = getRandomElement(this.userIds.customers);
      const vehicleId = getRandomElement(availableVehicles)._id;
      
      let startDate: Date;
      let endDate: Date;
      
      if (isPast) {
        startDate = getRandomDate(pastDate, now);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + getRandomInt(1, 14)); // 1-14 days rental
      } else {
        // Future or current bookings
        startDate = getRandomDate(now, futureDate);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + getRandomInt(1, 14));
      }
      
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const dailyRate = getRandomInt(50, 300); // $50-$300 per day
      const totalCost = days * dailyRate;

      return {
        customerId,
        vehicleId,
        startDate,
        endDate,
        totalCost,
        status,
      };
    };

    // Create completed bookings (all in the past)
    for (let i = 0; i < completed; i++) {
      bookings.push(createBooking(BookingStatus.COMPLETED, true));
    }

    // Create cancelled bookings (mix of past and future)
    for (let i = 0; i < cancelled; i++) {
      bookings.push(createBooking(BookingStatus.CANCELLED, getRandomBoolean(0.6)));
    }

    // Create confirmed bookings (mostly future)
    for (let i = 0; i < confirmed; i++) {
      bookings.push(createBooking(BookingStatus.CONFIRMED, getRandomBoolean(0.2)));
    }

    // Create pending bookings (all future or current)
    for (let i = 0; i < pending; i++) {
      bookings.push(createBooking(BookingStatus.PENDING, false));
    }

    const createdBookings = await Booking.insertMany(bookings);

    console.log(`✓ Created ${createdBookings.length} bookings`);
    console.log(`  - ${pending} Pending`);
    console.log(`  - ${confirmed} Confirmed`);
    console.log(`  - ${completed} Completed`);
    console.log(`  - ${cancelled} Cancelled`);

    // Update vehicle statuses based on active bookings
    await this.updateVehicleStatuses(createdBookings);

    return;
  }

  async updateVehicleStatuses(bookings: any[]): Promise<void> {
    const now = new Date();
    
    // Find active bookings (confirmed or completed, and current date is within booking period)
    const activeBookings = bookings.filter(b => 
      (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.COMPLETED) &&
      b.startDate <= now &&
      b.endDate >= now
    );

    // Update vehicles to IN_TRANSIT for active bookings
    for (const booking of activeBookings) {
      await Vehicle.findByIdAndUpdate(booking.vehicleId, {
        status: VehicleStatus.IN_TRANSIT,
      });
    }

    console.log(`✓ Updated ${activeBookings.length} vehicles to IN_TRANSIT status`);
  }

  async seedTrips(): Promise<void> {
    console.log('\n🚕 Seeding Trips...');
    
    // Get confirmed and completed bookings to create trips
    const eligibleBookings = await Booking.find({
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
    });

    if (eligibleBookings.length === 0) {
      console.log('✓ No eligible bookings for trips');
      return;
    }

    const trips: any[] = [];
    const now = new Date();

    // Calculate counts for each status
    const total = eligibleBookings.length;
    const assigned = Math.floor(total * this.config.trips.assignedRatio);
    const started = Math.floor(total * this.config.trips.startedRatio);
    const completed = total - assigned - started;

    let statusCounts = { assigned: 0, started: 0, completed: 0 };

    for (const booking of eligibleBookings) {
      const vehicle = await Vehicle.findById(booking.vehicleId);
      if (!vehicle) continue;

      // Determine trip status based on booking status and dates
      let tripStatus: TripStatus;
      let startOdometer: number | undefined;
      let endOdometer: number | undefined;
      let startTime: Date | undefined;
      let endTime: Date | undefined;

      const bookingStarted = booking.startDate <= now;
      const bookingEnded = booking.endDate <= now;

      if (booking.status === BookingStatus.COMPLETED || bookingEnded) {
        tripStatus = TripStatus.COMPLETED;
        startOdometer = getRandomInt(10000, 100000);
        endOdometer = startOdometer + getRandomInt(50, 500); // 50-500 km trip
        startTime = booking.startDate;
        endTime = booking.endDate;
        statusCounts.completed++;
      } else if (bookingStarted && statusCounts.started < started) {
        tripStatus = TripStatus.STARTED;
        startOdometer = getRandomInt(10000, 100000);
        startTime = booking.startDate;
        statusCounts.started++;
      } else {
        tripStatus = TripStatus.ASSIGNED;
        statusCounts.assigned++;
      }

      // Get driver - either from vehicle or random
      const driverId = vehicle.driverId || getRandomElement(this.userIds.drivers);

      trips.push({
        bookingId: booking._id,
        driverId,
        vehicleId: booking.vehicleId,
        status: tripStatus,
        startOdometer,
        endOdometer,
        startTime,
        endTime,
      });
    }

    const createdTrips = await Trip.insertMany(trips);

    console.log(`✓ Created ${createdTrips.length} trips`);
    console.log(`  - ${statusCounts.assigned} Assigned`);
    console.log(`  - ${statusCounts.started} Started`);
    console.log(`  - ${statusCounts.completed} Completed`);
  }

  async generateReport(): Promise<void> {
    console.log('\n📊 Database Seeding Report');
    console.log('═══════════════════════════════════════');
    
    const userCount = await User.countDocuments();
    const vehicleCount = await Vehicle.countDocuments();
    const bookingCount = await Booking.countDocuments();
    const tripCount = await Trip.countDocuments();

    console.log(`\nTotal Records: ${userCount + vehicleCount + bookingCount + tripCount}`);
    console.log(`  • Users: ${userCount}`);
    console.log(`  • Vehicles: ${vehicleCount}`);
    console.log(`  • Bookings: ${bookingCount}`);
    console.log(`  • Trips: ${tripCount}`);

    // Detailed breakdowns
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    console.log('\nUsers by Role:');
    usersByRole.forEach(r => console.log(`  • ${r._id}: ${r.count}`));

    const vehiclesByStatus = await Vehicle.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('\nVehicles by Status:');
    vehiclesByStatus.forEach(v => console.log(`  • ${v._id}: ${v.count}`));

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('\nBookings by Status:');
    bookingsByStatus.forEach(b => console.log(`  • ${b._id}: ${b.count}`));

    const tripsByStatus = await Trip.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('\nTrips by Status:');
    tripsByStatus.forEach(t => console.log(`  • ${t._id}: ${t.count}`));

    console.log('\n═══════════════════════════════════════');
    console.log('✓ Seeding completed successfully!\n');
  }

  async run(): Promise<void> {
    try {
      if (!this.skipConnection) {
        await this.connect();
      }
      await this.clearDatabase();
      await this.seedUsers();
      await this.seedVehicles();
      await this.seedBookings();
      await this.seedTrips();
      await this.generateReport();
    } catch (error) {
      console.error('✗ Seeding failed:', error);
      throw error;
    } finally {
      if (!this.skipConnection) {
        await mongoose.connection.close();
        console.log('✓ Database connection closed');
      }
    }
  }
}

// ===========================
// CLI EXECUTION
// ===========================

const parseArgs = (): SeederConfig => {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];

    switch (key) {
      case '--owners':
        config.users.owners = parseInt(value);
        break;
      case '--drivers':
        config.users.drivers = parseInt(value);
        break;
      case '--customers':
        config.users.customers = parseInt(value);
        break;
      case '--vehicles-per-owner':
        config.vehicles.perOwner = parseInt(value);
        break;
      case '--maintenance-ratio':
        config.vehicles.maintenanceRatio = parseFloat(value);
        break;
      case '--total-bookings':
        config.bookings.total = parseInt(value);
        break;
      case '--cancelled-ratio':
        config.bookings.cancelledRatio = parseFloat(value);
        break;
      case '--completed-ratio':
        config.bookings.completedRatio = parseFloat(value);
        break;
      case '--confirmed-ratio':
        config.bookings.confirmedRatio = parseFloat(value);
        break;
      case '--past-months':
        config.dateRange.pastMonths = parseInt(value);
        break;
      case '--future-months':
        config.dateRange.futureMonths = parseInt(value);
        break;
      case '--help':
        console.log(`
Fleet Management Database Seeder
═══════════════════════════════════════

Usage: npm run seed [options]

Options:
  --owners <number>              Number of vehicle owners (default: 10)
  --drivers <number>             Number of drivers (default: 30)
  --customers <number>           Number of customers (default: 100)
  --vehicles-per-owner <number>  Vehicles per owner (default: 5)
  --maintenance-ratio <decimal>  Ratio of vehicles in maintenance (default: 0.1)
  --total-bookings <number>      Total bookings to create (default: 500)
  --cancelled-ratio <decimal>    Ratio of cancelled bookings (default: 0.15)
  --completed-ratio <decimal>    Ratio of completed bookings (default: 0.60)
  --confirmed-ratio <decimal>    Ratio of confirmed bookings (default: 0.15)
  --past-months <number>         Months of historical data (default: 6)
  --future-months <number>       Months of future bookings (default: 2)
  --help                         Show this help message

Examples:
  npm run seed
  npm run seed -- --customers 200 --total-bookings 1000
  npm run seed -- --owners 20 --drivers 50 --vehicles-per-owner 3

Note: All users will have password "password"
      Admin account: admin@fleet.com / password
        `);
        process.exit(0);
    }
  }

  return config;
};

// Main execution
if (require.main === module) {
  const config = parseArgs();
  
  console.log('\n🌱 Fleet Management Database Seeder');
  console.log('═══════════════════════════════════════');
  console.log('Configuration:');
  console.log(JSON.stringify(config, null, 2));
  console.log('═══════════════════════════════════════\n');

  const seeder = new DatabaseSeeder(config);
  seeder.run()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

export { DatabaseSeeder, SeederConfig, DEFAULT_CONFIG };
