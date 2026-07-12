const mongoose = require('mongoose');
const config = require('../config/env');
const Asset = require('../models/Asset');
const Activity = require('../models/Activity');
const { ASSET_STATUS, ASSET_CONDITION } = require('../utils/constants');

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

    // Define sample assets with full schema compliance
    const assets = [
      {
        name: 'Dell Latitude 5420',
        assetTag: 'AST-DELL-001',
        category: 'Laptops',
        serialNumber: 'SN-DELL-12345',
        condition: ASSET_CONDITION.GOOD,
        location: 'Main Office',
        status: ASSET_STATUS.AVAILABLE,
        acquisitionDate: new Date('2025-01-15'),
        acquisitionCost: 1200,
      },
      {
        name: 'MacBook Pro 16',
        assetTag: 'AST-MAC-002',
        category: 'Laptops',
        serialNumber: 'SN-MAC-67890',
        condition: ASSET_CONDITION.NEW,
        location: 'Main Office',
        status: ASSET_STATUS.AVAILABLE,
        acquisitionDate: new Date('2026-03-01'),
        acquisitionCost: 2500,
      },
      {
        name: 'Logitech MX Master 3S',
        assetTag: 'AST-LOGI-003',
        category: 'Accessories',
        serialNumber: 'SN-LOGI-11223',
        condition: ASSET_CONDITION.GOOD,
        location: 'Conference Room',
        status: ASSET_STATUS.AVAILABLE,
        acquisitionDate: new Date('2025-06-20'),
        acquisitionCost: 100,
      },
      {
        name: 'iPad Pro 11',
        assetTag: 'AST-IPAD-004',
        category: 'Tablets',
        serialNumber: 'SN-IPAD-44556',
        condition: ASSET_CONDITION.FAIR,
        location: 'Main Office',
        status: ASSET_STATUS.MAINTENANCE,
        acquisitionDate: new Date('2024-11-10'),
        acquisitionCost: 800,
      },
      {
        name: 'Jabra Evolve 65',
        assetTag: 'AST-JABRA-005',
        category: 'Accessories',
        serialNumber: 'SN-JABRA-77889',
        condition: ASSET_CONDITION.GOOD,
        location: 'Remote',
        status: ASSET_STATUS.LOST,
        acquisitionDate: new Date('2025-02-18'),
        acquisitionCost: 150,
      },
      {
        name: 'iPhone XS',
        assetTag: 'AST-IPHONE-006',
        category: 'Mobile',
        serialNumber: 'SN-IPHONE-99000',
        condition: ASSET_CONDITION.POOR,
        location: 'Warehouse',
        status: ASSET_STATUS.RETIRED,
        acquisitionDate: new Date('2021-08-05'),
        acquisitionCost: 999,
      },
      {
        name: 'ThinkPad X1 Carbon',
        assetTag: 'AST-THINK-007',
        category: 'Laptops',
        serialNumber: 'SN-THINK-44332',
        condition: ASSET_CONDITION.GOOD,
        location: 'Berlin Hub',
        status: ASSET_STATUS.PENDING_TRANSFER,
        acquisitionDate: new Date('2025-09-12'),
        acquisitionCost: 1800,
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
