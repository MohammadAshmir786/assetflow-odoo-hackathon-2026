const mongoose = require('mongoose');
const config = require('../config/env');
const Asset = require('../models/Asset');
const Activity = require('../models/Activity');

const seedAssets = async () => {
  try {
    console.log('Connecting to database for asset seeding...');
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    console.log('Database connected.');

    // Clear existing assets and activities
    console.log('Clearing existing assets and activities...');
    await Asset.deleteMany();
    await Activity.deleteMany();
    console.log('Cleared existing assets and activities.');

    // Define sample assets in multiple statuses
    const assets = [
      {
        name: 'Dell Latitude 5420',
        serialNumber: 'SN-DELL-12345',
        status: 'Available',
      },
      {
        name: 'MacBook Pro 16',
        serialNumber: 'SN-MAC-67890',
        status: 'Available',
      },
      {
        name: 'Logitech MX Master 3S',
        serialNumber: 'SN-LOGI-11223',
        status: 'Available',
      },
      {
        name: 'iPad Pro 11',
        serialNumber: 'SN-IPAD-44556',
        status: 'Under Maintenance',
      },
      {
        name: 'Jabra Evolve 65',
        serialNumber: 'SN-JABRA-77889',
        status: 'Lost',
      },
      {
        name: 'iPhone XS',
        serialNumber: 'SN-IPHONE-99000',
        status: 'Retired',
      },
      {
        name: 'ThinkPad X1 Carbon',
        serialNumber: 'SN-THINK-44332',
        status: 'Pending Transfer',
      },
    ];

    console.log('Inserting sample assets...');
    await Asset.create(assets);
    console.log('Sample assets inserted successfully.');

    await mongoose.disconnect();
    console.log('Asset seeder completed. Database disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Asset seeder execution failed:', error);
    process.exit(1);
  }
};

seedAssets();
