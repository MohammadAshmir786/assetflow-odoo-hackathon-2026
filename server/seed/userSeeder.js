const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    // Connect to database
    console.log('Connecting to database for seeding...');
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    console.log('Database connected successfully.');

    // Clear existing users
    console.log('Clearing existing users...');
    await User.deleteMany();
    console.log('Existing users cleared.');

    // Define users data
    const users = [
      {
        name: 'Admin User',
        email: 'admin@assetflow.demo',
        password: 'Demo@123',
        role: 'admin',
      },
      {
        name: 'Asset Manager',
        email: 'manager@assetflow.demo',
        password: 'Demo@123',
        role: 'asset_manager',
      },
      {
        name: 'Employee One',
        email: 'employee1@assetflow.demo',
        password: 'Demo@123',
        role: 'employee',
      },
      {
        name: 'Employee Two',
        email: 'employee2@assetflow.demo',
        password: 'Demo@123',
        role: 'employee',
      },
    ];

    // Seed database
    console.log('Inserting default users...');
    // User.create triggers the Mongoose pre-save hook for password hashing.
    await User.create(users);
    console.log('Default users inserted successfully.');

    // Disconnect
    await mongoose.disconnect();
    console.log('Seeder completed. Database disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Seeder execution failed:', error);
    process.exit(1);
  }
};

seedUsers();
