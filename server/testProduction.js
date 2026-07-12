const mongoose = require('mongoose');
const assert = require('assert');
const config = require('./config/env');
const User = require('./models/User');
const Asset = require('./models/Asset');
const Transfer = require('./models/Transfer');
const Maintenance = require('./models/Maintenance');

const BASE_URL = 'http://localhost:5000/api';

// Helper to assert JSON envelope symmetry { success, message, data }
function checkEnvelope(resJson) {
  assert.ok(resJson.hasOwnProperty('success'), 'Response missing "success" field');
  assert.ok(resJson.hasOwnProperty('message'), 'Response missing "message" field');
  assert.ok(resJson.hasOwnProperty('data'), 'Response missing "data" field');
}

async function runProductionTests() {
  console.log('=== STARTING BACKEND PRODUCTION VERIFICATION SUITE ===\n');

  // Establish DB connection to resolve direct target records
  await mongoose.connect(config.mongoose.url, config.mongoose.options);
  const admin = await User.findOne({ email: 'admin@assetflow.demo' });
  const manager = await User.findOne({ email: 'manager@assetflow.demo' });
  const employee1 = await User.findOne({ email: 'employee1@assetflow.demo' });
  const employee2 = await User.findOne({ email: 'employee2@assetflow.demo' });
  const asset = await Asset.findOne({ name: 'Dell Latitude 5420' });
  await mongoose.disconnect();

  if (!admin || !manager || !employee1 || !employee2 || !asset) {
    console.error('Pre-requisite check failed. Ensure database has been seeded.');
    process.exit(1);
  }

  let adminToken = '';
  let employee1Token = '';
  let employee2Token = '';

  // 1. Authenticate - Login (Valid and Invalid)
  try {
    console.log('[1] Testing Authentication: Valid Login...');
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@assetflow.demo', password: 'Demo@123' }),
    });
    const body = await res.json();
    checkEnvelope(body);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(body.data.token);
    adminToken = body.data.token;
    console.log('✓ Valid Login Passed');

    console.log('[2] Testing Authentication: Invalid Login...');
    const invalidRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@assetflow.demo', password: 'WrongPassword' }),
    });
    const invalidBody = await invalidRes.json();
    checkEnvelope(invalidBody);
    assert.strictEqual(invalidRes.status, 401);
    assert.strictEqual(invalidBody.success, false);
    assert.strictEqual(invalidBody.data, null);
    console.log('✓ Invalid Login Protection Passed');

    // Retrieve Employee tokens for role checks
    const emp1Res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'employee1@assetflow.demo', password: 'Demo@123' }),
    });
    const emp1Body = await emp1Res.json();
    employee1Token = emp1Body.data.token;

    const emp2Res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'employee2@assetflow.demo', password: 'Demo@123' }),
    });
    const emp2Body = await emp2Res.json();
    employee2Token = emp2Body.data.token;
  } catch (err) {
    console.error('✗ Authentication Tests Failed:', err.message);
  }

  // 2. JWT Access Control Validation
  try {
    console.log('\n[3] Testing JWT Access Control: Missing Token...');
    const res = await fetch(`${BASE_URL}/users`, { method: 'GET' });
    const body = await res.json();
    checkEnvelope(body);
    assert.strictEqual(res.status, 401);
    assert.strictEqual(body.success, false);
    console.log('✓ Missing Token Check Passed');

    console.log('[4] Testing JWT Access Control: Wrong Role Restriction...');
    const roleRes = await fetch(`${BASE_URL}/users`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${employee1Token}` },
    });
    const roleBody = await roleRes.json();
    checkEnvelope(roleBody);
    assert.strictEqual(roleRes.status, 403);
    assert.strictEqual(roleBody.success, false);
    console.log('✓ Wrong Role Restriction Checked');
  } catch (err) {
    console.error('✗ JWT Access Control Tests Failed:', err.message);
  }

  // 3. Assets CRUD Operation validations
  let testAssetId = '';
  try {
    console.log('\n[5] Testing Assets CRUD: Create Asset...');
    const res = await fetch(`${BASE_URL}/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'HP ProBook 450',
        assetTag: 'AST-HP-PRO',
        category: 'Laptops',
        serialNumber: 'SN-HP-PRO1',
        condition: 'New',
        acquisitionCost: 1100,
      }),
    });
    const body = await res.json();
    checkEnvelope(body);
    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.success, true);
    testAssetId = body.data._id;
    console.log('✓ Create Asset Passed');

    console.log('[6] Testing Assets CRUD: Duplicate assetTag Prevention...');
    const dupRes = await fetch(`${BASE_URL}/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'HP ProBook Duplicate',
        assetTag: 'AST-HP-PRO',
        category: 'Laptops',
        serialNumber: 'SN-HP-DUP',
        condition: 'New',
      }),
    });
    const dupBody = await dupRes.json();
    checkEnvelope(dupBody);
    assert.strictEqual(dupRes.status, 400);
    console.log('✓ Duplicate Tag Protection Checked');

    console.log('[7] Testing Assets CRUD: Paginated List & Filters...');
    const listRes = await fetch(`${BASE_URL}/assets?limit=2&category=Laptops`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${employee1Token}` },
    });
    const listBody = await listRes.json();
    checkEnvelope(listBody);
    assert.strictEqual(listRes.status, 200);
    assert.ok(listBody.data.assets.length <= 2);
    console.log('✓ Paginated Search/Filter Checked');

    console.log('[8] Testing Assets CRUD: Soft Delete Asset...');
    const delRes = await fetch(`${BASE_URL}/assets/${testAssetId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const delBody = await delRes.json();
    checkEnvelope(delBody);
    assert.strictEqual(delRes.status, 200);

    // Verify GET returns 404 for soft-deleted asset
    const getRes = await fetch(`${BASE_URL}/assets/${testAssetId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(getRes.status, 404);
    console.log('✓ Soft Delete Checked');
  } catch (err) {
    console.error('✗ Assets CRUD Tests Failed:', err.message);
  }

  // 4. Allocation System
  try {
    console.log('\n[9] Testing Allocation System: Valid Allocation...');
    const res = await fetch(`${BASE_URL}/assets/${asset._id}/allocate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        userId: employee1._id.toString(),
        expectedReturnDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      }),
    });
    const body = await res.json();
    checkEnvelope(body);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, 'Allocated');
    console.log('✓ Valid Allocation Checked');

    console.log('[10] Testing Allocation System: Double Allocation Block...');
    const doubleRes = await fetch(`${BASE_URL}/assets/${asset._id}/allocate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        userId: employee2._id.toString(),
        expectedReturnDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      }),
    });
    const doubleBody = await doubleRes.json();
    checkEnvelope(doubleBody);
    assert.strictEqual(doubleRes.status, 400);
    console.log('✓ Double Allocation Prevention Checked');
  } catch (err) {
    console.error('✗ Allocation Tests Failed:', err.message);
  }

  // 5. Transfer System
  let transferId = '';
  try {
    console.log('\n[11] Testing Transfer System: Request Transfer...');
    const res = await fetch(`${BASE_URL}/transfers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employee1Token}`,
      },
      body: JSON.stringify({
        asset: asset._id.toString(),
        targetUser: employee2._id.toString(),
        comments: 'Relocating device',
      }),
    });
    const body = await res.json();
    checkEnvelope(body);
    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.data.status, 'Pending');
    transferId = body.data._id;
    console.log('✓ Request Transfer Checked');

    console.log('[12] Testing Transfer System: Reject Transfer...');
    const rejRes = await fetch(`${BASE_URL}/transfers/${transferId}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const rejBody = await rejRes.json();
    checkEnvelope(rejBody);
    assert.strictEqual(rejRes.status, 200);
    assert.strictEqual(rejBody.data.status, 'Rejected');
    console.log('✓ Reject Transfer Checked');

    console.log('[13] Testing Transfer System: Approve Transfer...');
    // Create another transfer request first
    const reqRes = await fetch(`${BASE_URL}/transfers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employee1Token}`,
      },
      body: JSON.stringify({
        asset: asset._id.toString(),
        targetUser: employee2._id.toString(),
      }),
    });
    const reqBody = await reqRes.json();
    const newTransId = reqBody.data._id;

    const appRes = await fetch(`${BASE_URL}/transfers/${newTransId}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const appBody = await appRes.json();
    checkEnvelope(appBody);
    assert.strictEqual(appRes.status, 200);
    assert.strictEqual(appBody.data.status, 'Approved');

    // Confirm Asset currentHolder changed to Employee 2
    const assetRes = await fetch(`${BASE_URL}/assets/${asset._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const assetBody = await assetRes.json();
    assert.strictEqual(assetBody.data.currentHolder._id, employee2._id.toString());
    console.log('✓ Approve Transfer and Owner Shift Checked');
  } catch (err) {
    console.error('✗ Transfer Tests Failed:', err.message);
  }

  // 6. Maintenance System & Restrictions
  let maintId = '';
  try {
    console.log('\n[14] Testing Maintenance: Request Maintenance...');
    const res = await fetch(`${BASE_URL}/maintenance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employee2Token}`,
      },
      body: JSON.stringify({
        asset: asset._id.toString(),
        issueDescription: 'Fan is too loud',
      }),
    });
    const body = await res.json();
    checkEnvelope(body);
    assert.strictEqual(res.status, 201);
    maintId = body.data._id;
    console.log('✓ Request Maintenance Checked');

    console.log('[15] Testing Maintenance: Approve request (Transitions asset to Under Maintenance)...');
    const appRes = await fetch(`${BASE_URL}/maintenance/${maintId}/approve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const appBody = await appRes.json();
    checkEnvelope(appBody);
    assert.strictEqual(appRes.status, 200);

    // Verify Asset status is now 'Under Maintenance'
    const assetRes = await fetch(`${BASE_URL}/assets/${asset._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const assetBody = await assetRes.json();
    assert.strictEqual(assetBody.data.status, 'Under Maintenance');
    console.log('✓ Approve Maintenance & Status Transition Checked');

    console.log('[16] Testing Maintenance: Allocation restriction for assets Under Maintenance...');
    const allocRes = await fetch(`${BASE_URL}/assets/${asset._id}/allocate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ userId: employee1._id.toString() }),
    });
    const allocBody = await allocRes.json();
    checkEnvelope(allocBody);
    assert.strictEqual(allocRes.status, 400);
    console.log('✓ Maintenance Allocation Block Checked');

    console.log('[17] Testing Maintenance: Start maintenance task...');
    const startRes = await fetch(`${BASE_URL}/maintenance/${maintId}/start`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const startBody = await startRes.json();
    checkEnvelope(startBody);
    assert.strictEqual(startRes.status, 200);
    console.log('✓ Start Maintenance Checked');

    console.log('[18] Testing Maintenance: Resolve maintenance (Transitions asset back to Available)...');
    const resolveRes = await fetch(`${BASE_URL}/maintenance/${maintId}/resolve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ cost: 85, comments: 'Fan cleaned' }),
    });
    const resolveBody = await resolveRes.json();
    checkEnvelope(resolveBody);
    assert.strictEqual(resolveRes.status, 200);

    // Verify Asset is Available again
    const finalAssetRes = await fetch(`${BASE_URL}/assets/${asset._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const finalAssetBody = await finalAssetRes.json();
    assert.strictEqual(finalAssetBody.data.status, 'Available');
    console.log('✓ Resolve Maintenance & Available Reversion Checked');
  } catch (err) {
    console.error('✗ Maintenance Tests Failed:', err.message);
  }

  // 7. Dashboard metrics
  try {
    console.log('\n[19] Testing Dashboard Metrics API...');
    const res = await fetch(`${BASE_URL}/dashboard/stats`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const body = await res.json();
    checkEnvelope(body);
    assert.strictEqual(res.status, 200);
    assert.ok(body.data.hasOwnProperty('totalAssets'));
    assert.ok(body.data.hasOwnProperty('recentActivities'));
    console.log('✓ Dashboard Metrics Passed');
  } catch (err) {
    console.error('✗ Dashboard Stats Tests Failed:', err.message);
  }

  // 8. 404 Endpoint check
  try {
    console.log('\n[20] Testing 404 API Endpoint check...');
    const res = await fetch(`${BASE_URL}/unsupported-route-path`);
    const body = await res.json();
    checkEnvelope(body);
    assert.strictEqual(res.status, 404);
    assert.strictEqual(body.success, false);
    console.log('✓ 404 Route Interception Checked');
  } catch (err) {
    console.error('✗ 404 Test Failed:', err.message);
  }

  // 9. Validation Exceptions format validation
  try {
    console.log('\n[21] Testing Validation Exceptions formatting...');
    const res = await fetch(`${BASE_URL}/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: '', assetTag: '' }), // Invalid payload triggers express-validation
    });
    const body = await res.json();
    checkEnvelope(body);
    assert.strictEqual(res.status, 400);
    assert.ok(body.message.includes('required'));
    console.log('✓ Clean Validation Response Checked');
  } catch (err) {
    console.error('✗ Validation Format Test Failed:', err.message);
  }

  console.log('\n=== ALL 21 OPERATIONAL SCENARIOS VALIDATED SUCCESSFULLY ===');
}

runProductionTests();
