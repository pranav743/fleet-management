import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from './config/db';
import './config/redis'; // Ensure Redis connects
import { DatabaseSeeder, DEFAULT_CONFIG } from './seed';

const PORT = process.env.PORT || 5000;

const initializeServer = async () => {
  try {
    await connectDB();
    
    if (process.env.NODE_ENV === 'development' && process.env.RUN_SEED === 'true') {
      console.log('\n🌱 Running database seeder...');
      const seeder = new DatabaseSeeder(DEFAULT_CONFIG, true); // Skip connection management
      await seeder.run();
      console.log('✅ Seeding completed\n');
    }
    
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    process.on('unhandledRejection', (err: Error) => {
      console.log('UNHANDLED REJECTION! 💥 Shutting down...');
      console.log(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle Uncaught Exceptions
    process.on('uncaughtException', (err: Error) => {
      console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      console.log(err.name, err.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

initializeServer();
