# AssetFlow Backend Service

This directory contains the production-grade Backend API service for **AssetFlow** (Asset Management System), designed and built for the Odoo Hackathon.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Object modeling via Mongoose)
- **Security**: JWT & bcryptjs password hashing
- **Input Validation**: express-validator
- **Request Logging**: morgan
- **Environment config**: dotenv

---

## 1. Directory Structure

- `config/`: Setup for database links and environment variables.
- `controllers/`: Request mapper handlers mapping pathways to services.
- `middleware/`: Reusable middlewares (authentication, role authorization, 404 handler, global error interceptor).
- `models/`: Database schemas defining properties and query filters.
- `routes/`: Express endpoint pathways.
- `seed/`: Initial database scripts.
- `services/`: Encapsulated database operations and transition business logic.
- `validators/`: Express-validator schemas.
- `utils/`: Reusable helpers (`ApiResponse`, `ApiError`, `catchAsync`, central `constants`).

---

## 2. API Endpoint Matrix

All API responses are formatted symmetrically with a standard JSON envelope:
```json
{
  "success": true,
  "message": "Message description",
  "data": { ... }
}
```

### Authentication
- `POST /api/auth/login`: Authenticate and obtain JWT.

### Users
- `GET /api/users`: Retrieve all registered users (*restricted to admin, asset_manager*).

### Assets
- `GET /api/assets`: Paginated assets retrieval with search and status/category filters.
- `GET /api/assets/:id`: Fetch a single asset's details.
- `POST /api/assets`: Create a new asset (*restricted to admin, asset_manager*).
- `PUT /api/assets/:id`: Update fields on an asset (*restricted to admin, asset_manager*).
- `DELETE /api/assets/:id`: Soft delete an asset (*restricted to admin, asset_manager*).

### Allocation
- `POST /api/assets/:id/allocate`: Allocate an Available asset to a user (*restricted to admin, asset_manager*).
- `POST /api/assets/:id/return`: Return an Allocated asset back to inventory (*restricted to admin, asset_manager*).

### Transfers
- `GET /api/transfers`: Get all asset transfer request history.
- `POST /api/transfers`: Request a new transfer of an Allocated asset to another user.
- `PATCH /api/transfers/:id/approve`: Approve a transfer request (*restricted to admin, asset_manager*).
- `PATCH /api/transfers/:id/reject`: Reject a transfer request (*restricted to admin, asset_manager*).

### Maintenance
- `GET /api/maintenance`: Get all maintenance request logs.
- `POST /api/maintenance`: File a new maintenance request (e.g. filed by employees).
- `PATCH /api/maintenance/:id/approve`: Approve maintenance request (*restricted to admin, asset_manager*).
- `PATCH /api/maintenance/:id/start`: Transition request to In Progress (*restricted to admin, asset_manager*).
- `PATCH /api/maintenance/:id/resolve`: Resolve maintenance, return asset back to Available (*restricted to admin, asset_manager*).
- `PATCH /api/maintenance/:id/reject`: Reject request (*restricted to admin, asset_manager*).

### Dashboard Stats
- `GET /api/dashboard/stats`: Retrieve dashboard metrics and the 5 most recent activities (*restricted to admin, asset_manager*).

---

## 3. Database Indexes & Optimizations

To handle high data volumes, the following performance indexes are created on schemas:
- **User**: Unique index on `email`.
- **Asset**: Unique index on `assetTag`, index on `status`, index on `category`, and index on `isDeleted` to optimize soft-delete query execution.
- **Transfer**: Index on `asset`, `requestedBy`, and `status`.
- **Maintenance**: Index on `asset` and `status`.
- **Activity**: Index on `asset` and compound sorting index on `timestamp` (descending) to optimize recent activity queries.

---

## 4. Setup & Running

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables (`.env`)**:
   Create a `.env` file from the example:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/assetflow
   JWT_SECRET=your_jwt_secret_phrase
   JWT_EXPIRE=24h
   NODE_ENV=development
   ```

3. **Seed Database**:
   Populate initial demo users and assets:
   ```bash
   npm run db:seed
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Execute Validation Suite**:
   Runs the complete master verification suite testing all 21 operational scenarios:
   ```bash
   node testProduction.js
   ```
