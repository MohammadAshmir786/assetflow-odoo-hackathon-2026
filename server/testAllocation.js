const mongoose = require('mongoose');
const assert = require('assert');
const config = require('./config/env');
const User = require('./models/User');
const Asset = require('./models/Asset');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING ALLOCATION & DASHBOARD TESTS ---');

  // Connect to database to retrieve record IDs dynamically
  await mongoose.connect(config.mongoose.url, config.mongoose.options);

  const employeeUser = await User.findOne({ role: 'employee' });
  const availableAsset = await Asset.findOne({ name: 'Dell Latitude 5420' });
  const maintenanceAsset = await Asset.findOne({ name: 'iPad Pro 11' });

  await mongoose.disconnect(); // Exit database connection

  if (!employeeUser || !availableAsset || !maintenanceAsset) {
    console.error('Test setup failed. Verify database seeding has run.');
    process.exit(1);
  }

  // Authenticaton: Login as admin to retrieve token
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@assetflow.demo', password: 'Demo@123' }),
  });
  const loginBody = await loginRes.json();
  const token = loginBody.data.token;

  console.log('Logged in successfully as admin.');

  // A. Test Valid Allocation of Available Asset
  try {
    console.log('\n[A] Testing Valid Allocation...');
    const allocateRes = await fetch(`${BASE_URL}/assets/${availableAsset._id}/allocate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: employeeUser._id.toString(),
        expectedReturnDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
      }),
    });
    const allocateBody = await allocateRes.json();
    console.log(`Status: ${allocateRes.status}`);
    console.log('Response:', JSON.stringify(allocateBody));

    assert.strictEqual(allocateRes.status, 200);
    assert.strictEqual(allocateBody.success, true);
    assert.strictEqual(allocateBody.data.status, 'Allocated');
    assert.strictEqual(allocateBody.data.currentHolder, employeeUser._id.toString());
    console.log('✓ Valid Allocation Test Passed');
  } catch (err) {
    console.error('✗ Valid Allocation Test Failed:', err.message);
  }

  // B. Test Double Allocation Prevention
  try {
    console.log('\n[B] Testing Double Allocation Prevention...');
    const doubleRes = await fetch(`${BASE_URL}/assets/${availableAsset._id}/allocate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: employeeUser._id.toString(),
      }),
    });
    const doubleBody = await doubleRes.json();
    console.log(`Status: ${doubleRes.status}`);
    console.log('Response:', JSON.stringify(doubleBody));

    assert.strictEqual(doubleRes.status, 400);
    assert.strictEqual(doubleBody.success, false);
    assert.ok(doubleBody.message.includes('cannot be allocated'));
    console.log('✓ Double Allocation Prevention Test Passed');
  } catch (err) {
    console.error('✗ Double Allocation Prevention Test Failed:', err.message);
  }

  // C. Test restricted assets allocation prevention
  try {
    console.log('\n[C] Testing Maintenance Asset Allocation Prevention...');
    const maintenanceRes = await fetch(`${BASE_URL}/assets/${maintenanceAsset._id}/allocate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: employeeUser._id.toString(),
      }),
    });
    const maintenanceBody = await maintenanceRes.json();
    console.log(`Status: ${maintenanceRes.status}`);
    console.log('Response:', JSON.stringify(maintenanceBody));

    assert.strictEqual(maintenanceRes.status, 400);
    assert.strictEqual(maintenanceBody.success, false);
    assert.ok(maintenanceBody.message.includes('cannot be allocated'));
    console.log('✓ Maintenance Asset Allocation Prevention Test Passed');
  } catch (err) {
    console.error('✗ Maintenance Asset Allocation Prevention Test Failed:', err.message);
  }

  // D. Test Return Asset
  try {
    console.log('\n[D] Testing Return Asset...');
    const returnRes = await fetch(`${BASE_URL}/assets/${availableAsset._id}/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const returnBody = await returnRes.json();
    console.log(`Status: ${returnRes.status}`);
    console.log('Response:', JSON.stringify(returnBody));

    assert.strictEqual(returnRes.status, 200);
    assert.strictEqual(returnBody.success, true);
    assert.strictEqual(returnBody.data.status, 'Available');
    assert.strictEqual(returnBody.data.currentHolder, null);
    console.log('✓ Return Asset Test Passed');
  } catch (err) {
    console.error('✗ Return Asset Test Failed:', err.message);
  }

  // E. Test Dashboard statistics
  try {
    console.log('\n[E] Testing Dashboard Stats...');
    const statsRes = await fetch(`${BASE_URL}/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const statsBody = await statsRes.json();
    console.log(`Status: ${statsRes.status}`);
    console.log('Dashboard Data:', JSON.stringify(statsBody.data, null, 2));

    assert.strictEqual(statsRes.status, 200);
    assert.strictEqual(statsBody.success, true);
    assert.strictEqual(statsBody.data.totalAssets, 7);
    assert.strictEqual(statsBody.data.availableAssets, 3);
    assert.strictEqual(statsBody.data.underMaintenance, 1);
    assert.strictEqual(statsBody.data.pendingTransfers, 1);
    assert.ok(Array.isArray(statsBody.data.recentActivities));
    // It should have logged both allocation and return events (2 events)
    assert.ok(statsBody.data.recentActivities.length >= 2);
    console.log('✓ Dashboard Stats Test Passed');
  } catch (err) {
    console.error('✗ Dashboard Stats Test Failed:', err.message);
  }

  console.log('\n--- TESTS COMPLETED ---');
}

runTests();
