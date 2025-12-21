# API Documentation

Base URL: `http://localhost:5000/api/v1`

## Authentication

### Signup
**POST** `/auth/signup`

```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password123",
    "role": "OWNER"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "email": "owner@example.com",
      "role": "OWNER",
      "_id": "657b1234...",
      "createdAt": "2023-12-14T10:00:00.000Z",
      "updatedAt": "2023-12-14T10:00:00.000Z",
      "isDeleted": false,
      "deletedAt": null
    }
  }
}
```

### Login
**POST** `/auth/login`

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "status": "success",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "user": {
      "email": "owner@example.com",
      "role": "OWNER",
      "_id": "657b1234...",
      "createdAt": "2023-12-14T10:00:00.000Z",
      "updatedAt": "2023-12-14T10:00:00.000Z",
      "isDeleted": false,
      "deletedAt": null
    }
  }
}
```

### Refresh Token
**POST** `/auth/refresh`

```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<REFRESH_TOKEN>"
  }'
```

**Response:**
```json
{
  "status": "success",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Logout
**POST** `/auth/logout`

```bash
curl -X POST http://localhost:5000/api/v1/auth/logout \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

---

## Drivers (Protected: ADMIN only)

### Create Driver
**POST** `/drivers`

Allows admins to create new driver accounts.

```bash
curl -X POST http://localhost:5000/api/v1/drivers \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Driver created successfully",
  "data": {
    "driver": {
      "_id": "657b7890...",
      "email": "driver@example.com",
      "role": "DRIVER",
      "isDeleted": false,
      "deletedAt": null,
      "createdAt": "2023-12-14T10:00:00.000Z",
      "updatedAt": "2023-12-14T10:00:00.000Z"
    }
  }
}
```

### Get All Drivers
**GET** `/drivers`

Get all drivers with pagination and filtering support.

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Number of items per page
- `email` (optional): Filter by email (case-insensitive partial match)
- `sortBy` (optional, default: 'createdAt'): Field to sort by (createdAt, email, updatedAt)
- `order` (optional, default: 'desc'): Sort order ('asc' or 'desc')

```bash
# Get all drivers (default pagination)
curl -X GET http://localhost:5000/api/v1/drivers \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"

# With pagination
curl -X GET "http://localhost:5000/api/v1/drivers?page=1&limit=5" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"

# Filter by email
curl -X GET "http://localhost:5000/api/v1/drivers?email=john" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"

# With sorting
curl -X GET "http://localhost:5000/api/v1/drivers?sortBy=email&order=asc" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"

# Combined filters
curl -X GET "http://localhost:5000/api/v1/drivers?page=1&limit=5&email=driver&sortBy=createdAt&order=desc" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "results": 2,
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 2,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "data": {
    "drivers": [
      {
        "_id": "657b7890...",
        "email": "driver1@example.com",
        "role": "DRIVER",
        "isDeleted": false,
        "createdAt": "2023-12-14T10:00:00.000Z",
        "updatedAt": "2023-12-14T10:00:00.000Z"
      },
      {
        "_id": "657b7891...",
        "email": "driver2@example.com",
        "role": "DRIVER",
        "isDeleted": false,
        "createdAt": "2023-12-14T11:00:00.000Z",
        "updatedAt": "2023-12-14T11:00:00.000Z"
      }
    ]
  }
}
```

### Get Driver by ID
**GET** `/drivers/:id`

```bash
curl -X GET http://localhost:5000/api/v1/drivers/<DRIVER_ID> \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "driver": {
      "_id": "657b7890...",
      "email": "driver@example.com",
      "role": "DRIVER",
      "isDeleted": false,
      "createdAt": "2023-12-14T10:00:00.000Z",
      "updatedAt": "2023-12-14T10:00:00.000Z"
    }
  }
}
```

### Delete Driver (Soft Delete)
**DELETE** `/drivers/:id`

Soft deletes a driver. Automatically unregisters driver from any assigned vehicle. Cannot delete if driver has active trips.

```bash
curl -X DELETE http://localhost:5000/api/v1/drivers/<DRIVER_ID> \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "data": null
}
```

**Error Cases:**
- Driver not found
- Driver has active trips (ASSIGNED or STARTED status)

**Note:** If driver is registered to a vehicle, they are automatically unregistered before deletion.

---

## Vehicles (Protected: ADMIN, OWNER)

### Create Vehicle
**POST** `/vehicles`

```bash
curl -X POST http://localhost:5000/api/v1/vehicles \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Toyota",
    "vehicleModel": "Camry",
    "registrationNumber": "ABC-1234",
    "type": "SEDAN"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "vehicle": {
      "ownerId": "657b1234...",
      "make": "Toyota",
      "vehicleModel": "Camry",
      "registrationNumber": "ABC-1234",
      "type": "SEDAN",
      "status": "IDLE",
      "_id": "657b5678...",
      "createdAt": "2023-12-14T11:00:00.000Z",
      "updatedAt": "2023-12-14T11:00:00.000Z",
      "isDeleted": false,
      "deletedAt": null
    }
  }
}
```

### Get All Vehicles
**GET** `/vehicles`

Get all vehicles with pagination, filtering, and sorting support. Results are filtered based on user role.

**Query Parameters:**
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 10): Number of items per page
- `sortBy` (optional, default: 'createdAt'): Field to sort by (createdAt, make, vehicleModel, year, status, type)
- `order` (optional, default: 'desc'): Sort order ('asc' or 'desc')
- `status` (optional): Filter by vehicle status (IDLE, IN_TRANSIT, MAINTENANCE)
- `type` (optional): Filter by vehicle type (SUV, SEDAN, TRUCK, VAN)
- `make` (optional): Filter by vehicle make (case-insensitive partial match)
- `model` (optional): Filter by vehicle model (case-insensitive partial match)
- `registrationNumber` (optional): Filter by registration number (case-insensitive partial match)
- `year` (optional): Filter by vehicle year

```bash
curl -X GET "http://localhost:5000/api/v1/vehicles" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

curl -X GET "http://localhost:5000/api/v1/vehicles?page=1&limit=5" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

curl -X GET "http://localhost:5000/api/v1/vehicles?status=IDLE&type=SEDAN" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

curl -X GET "http://localhost:5000/api/v1/vehicles?make=Toyota&sortBy=year&order=desc" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "results": 2,
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 2,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "data": {
    "vehicles": [
      {
        "_id": "657b5678...",
        "make": "Toyota",
        "vehicleModel": "Camry",
        "status": "IDLE",
        "type": "SEDAN",
        "registrationNumber": "ABC-1234",
        "year": 2022,
        "ownerId": "657b1234...",
        "createdAt": "2023-12-14T11:00:00.000Z",
        "updatedAt": "2023-12-14T11:00:00.000Z"
      }
    ]
  }
}
```

**Role-Based Filtering:**
- **OWNER**: Only sees vehicles they own
- **DRIVER**: Only sees IDLE vehicles
- **ADMIN**: Sees all vehicles

### Get Vehicle by ID
**GET** `/vehicles/:id`

```bash
curl -X GET http://localhost:5000/api/v1/vehicles/<VEHICLE_ID> \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "vehicle": {
      "_id": "657b5678...",
      "make": "Toyota",
      "vehicleModel": "Camry",
      "status": "IDLE",
      "type": "SEDAN",
      "registrationNumber": "ABC-1234",
      "ownerId": "657b1234..."
    }
  }
}
```

### Update Vehicle
**PATCH** `/vehicles/:id`

```bash
curl -X PATCH http://localhost:5000/api/v1/vehicles/<VEHICLE_ID> \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "MAINTENANCE"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "vehicle": {
      "_id": "657b5678...",
      "make": "Toyota",
      "vehicleModel": "Camry",
      "status": "MAINTENANCE",
      "type": "SEDAN",
      "registrationNumber": "ABC-1234",
      "ownerId": "657b1234..."
    }
  }
}
```

### Delete Vehicle (Soft Delete)
**DELETE** `/vehicles/:id`

Soft deletes a vehicle. The vehicle cannot be deleted if it has active bookings or active trips.

```bash
curl -X DELETE http://localhost:5000/api/v1/vehicles/<VEHICLE_ID> \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "data": null
}
```

**Error Cases:**
- Vehicle not found (404)
- Permission denied (403) - Only vehicle owner or admin can delete
- Active bookings exist (400) - Cannot delete vehicle with PENDING or CONFIRMED bookings
- Active trips exist (400) - Cannot delete vehicle with ASSIGNED or STARTED trips

**Validation:**
- Checks for active bookings (PENDING, CONFIRMED status)
- Checks for active trips (ASSIGNED, STARTED status)
- Vehicle is soft deleted (isDeleted = true, deletedAt is set)

### Register Vehicle (DRIVER only)
**POST** `/vehicles/register`

Allows a driver to register themselves to an available vehicle. A driver can only be registered to one vehicle at a time.

```bash
curl -X POST http://localhost:5000/api/v1/vehicles/register \
  -H "Authorization: Bearer <DRIVER_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "<VEHICLE_ID>"
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Successfully registered to vehicle",
  "data": {
    "vehicle": {
      "_id": "657b5678...",
      "ownerId": "657b1234...",
      "driverId": "657b7890...",
      "make": "Toyota",
      "vehicleModel": "Camry",
      "registrationNumber": "ABC-1234",
      "type": "SEDAN",
      "status": "IDLE",
      "createdAt": "2023-12-14T11:00:00.000Z",
      "updatedAt": "2023-12-14T14:00:00.000Z",
      "isDeleted": false,
      "deletedAt": null
    }
  }
}
```

**Error Cases:**
- Driver already registered to another vehicle
- Vehicle is not available (status not IDLE)
- Vehicle already has another driver registered

### Get Registered Vehicle (DRIVER only)
**GET** `/vehicles/registered`

Retrieves the currently registered vehicle for the authenticated driver.

```bash
curl -X GET http://localhost:5000/api/v1/vehicles/registered \
  -H "Authorization: Bearer <DRIVER_ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "vehicle": {
      "_id": "657b5678...",
      "ownerId": {
        "_id": "657b1234...",
        "email": "owner@example.com",
        "role": "OWNER"
      },
      "driverId": "657b7890...",
      "make": "Toyota",
      "vehicleModel": "Camry",
      "registrationNumber": "ABC-1234",
      "type": "SEDAN",
      "status": "IDLE",
      "createdAt": "2023-12-14T11:00:00.000Z",
      "updatedAt": "2023-12-14T14:00:00.000Z",
      "isDeleted": false,
      "deletedAt": null
    }
  }
}
```

**Error Cases:**
- Driver has no registered vehicle (404)

### Return Vehicle (DRIVER, OWNER, ADMIN)
**POST** `/vehicles/return`

Allows a driver to unregister from their currently assigned vehicle. Cannot return vehicle with active trips.

```bash
curl -X POST http://localhost:5000/api/v1/vehicles/return \
  -H "Authorization: Bearer <DRIVER_ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "message": "Successfully returned vehicle",
  "data": {
    "vehicle": {
      "_id": "657b5678...",
      "ownerId": "657b1234...",
      "driverId": null,
      "make": "Toyota",
      "vehicleModel": "Camry",
      "registrationNumber": "ABC-1234",
      "type": "SEDAN",
      "status": "IDLE",
      "createdAt": "2023-12-14T11:00:00.000Z",
      "updatedAt": "2023-12-14T15:00:00.000Z",
      "isDeleted": false,
      "deletedAt": null
    }
  }
}
```

**Error Cases:**
- Driver has no registered vehicle
- Active trips exist for the vehicle

### Get Available Vehicles (Protected)
**GET** `/vehicles/available`

Returns all vehicles with availability status. Supports pagination, filtering, and sorting. Vehicles without drivers or with conflicting bookings are marked as unavailable.

**Query Parameters:**
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 10): Number of items per page
- `sortBy` (optional, default: 'createdAt'): Field to sort by (createdAt, make, vehicleModel, year, status, type)
- `order` (optional, default: 'desc'): Sort order ('asc' or 'desc')
- `startDate` (optional): Start date for availability check (ISO 8601 format)
- `endDate` (optional): End date for availability check (ISO 8601 format)
- `type` (optional): Vehicle type (SUV, SEDAN, TRUCK, VAN)
- `status` (optional): Vehicle status (IDLE, IN_TRANSIT, MAINTENANCE)
- `make` (optional): Filter by vehicle make (case-insensitive partial match)
- `model` (optional): Filter by vehicle model (case-insensitive partial match)
- `registrationNumber` (optional): Filter by registration number (case-insensitive partial match)
- `year` (optional): Filter by vehicle year

```bash
curl -X GET "http://localhost:5000/api/v1/vehicles/available" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

curl -X GET "http://localhost:5000/api/v1/vehicles/available?page=1&limit=5" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

curl -X GET "http://localhost:5000/api/v1/vehicles/available?startDate=2023-12-25T10:00:00Z&endDate=2023-12-27T10:00:00Z" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

curl -X GET "http://localhost:5000/api/v1/vehicles/available?type=SEDAN&status=IDLE&make=Toyota" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

curl -X GET "http://localhost:5000/api/v1/vehicles/available?sortBy=year&order=desc&page=1&limit=10" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "results": 2,
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 2,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "data": {
    "vehicles": [
      {
        "_id": "657b5678...",
        "ownerId": {
          "_id": "657b1234...",
          "email": "owner@example.com",
          "role": "OWNER"
        },
        "driverId": {
          "_id": "657b7890...",
          "email": "driver@example.com",
          "role": "DRIVER"
        },
        "make": "Toyota",
        "vehicleModel": "Camry",
        "registrationNumber": "ABC-1234",
        "type": "SEDAN",
        "status": "IDLE",
        "year": 2022,
        "availableForBooking": true,
        "createdAt": "2023-12-14T11:00:00.000Z",
        "updatedAt": "2023-12-14T14:00:00.000Z"
      },
      {
        "_id": "657b5679...",
        "ownerId": {
          "_id": "657b1234...",
          "email": "owner@example.com",
          "role": "OWNER"
        },
        "driverId": null,
        "make": "Honda",
        "vehicleModel": "Accord",
        "registrationNumber": "XYZ-5678",
        "type": "SEDAN",
        "status": "IDLE",
        "year": 2023,
        "availableForBooking": false,
        "createdAt": "2023-12-14T11:00:00.000Z",
        "updatedAt": "2023-12-14T14:00:00.000Z"
      }
    ]
  }
}
```

**Note:** 
- `availableForBooking: true` means vehicle has a driver and is not booked for the requested dates
- `availableForBooking: false` means vehicle either has no driver or has conflicting bookings

---

## Bookings (Protected)

### Create Booking (CUSTOMER, ADMIN only)
**POST** `/bookings`

Creates a booking for a vehicle. The vehicle must have a registered driver. A trip is automatically created and assigned to the registered driver.

**Allowed Roles:** CUSTOMER, ADMIN

```bash
curl -X POST http://localhost:5000/api/v1/bookings \
  -H "Authorization: Bearer <CUSTOMER_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "<VEHICLE_ID>",
    "startDate": "2023-12-25T10:00:00Z",
    "endDate": "2023-12-27T10:00:00Z"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "booking": {
      "customerId": "657b9012...",
      "vehicleId": "657b5678...",
      "startDate": "2023-12-25T10:00:00.000Z",
      "endDate": "2023-12-27T10:00:00.000Z",
      "totalCost": 200,
      "status": "CONFIRMED",
      "_id": "657b3456...",
      "createdAt": "2023-12-14T12:00:00.000Z",
      "updatedAt": "2023-12-14T12:00:00.000Z",
      "isDeleted": false,
      "deletedAt": null
    }
  }
}
```

**Note:** A trip is automatically created with status `ASSIGNED` and assigned to the vehicle's registered driver.

**Error Cases:**
- Vehicle not found
- Vehicle does not have a registered driver
- Vehicle is already booked for the requested dates
- Vehicle is not IDLE

### Get Bookings (CUSTOMER, ADMIN, OWNER)
**GET** `/bookings`

Get bookings based on user role with pagination support. Customers see only their bookings. Admins and owners can filter by multiple criteria.

**Allowed Roles:** CUSTOMER, ADMIN, OWNER

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Number of items per page

**Additional Parameters (ADMIN/OWNER only):**
- `vehicleId` (optional): Filter by specific vehicle
- `customerId` (optional): Filter by specific customer
- `status` (optional): Filter by booking status (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- `registrationNumber` (optional): Filter by vehicle registration number (case-insensitive partial match)
- `startDate` (optional): Filter bookings starting from this date
- `endDate` (optional): Filter bookings ending before this date

```bash
# Customer - get own bookings with pagination
curl -X GET "http://localhost:5000/api/v1/bookings?page=1&limit=5" \
  -H "Authorization: Bearer <CUSTOMER_ACCESS_TOKEN>"

# Admin/Owner - filter by vehicle, status, date range with pagination
curl -X GET "http://localhost:5000/api/v1/bookings?page=1&limit=10&vehicleId=<VEHICLE_ID>&status=CONFIRMED&startDate=2023-12-20T00:00:00Z&endDate=2023-12-31T00:00:00Z" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"

# Admin/Owner - filter by registration number
curl -X GET "http://localhost:5000/api/v1/bookings?registrationNumber=ABC-1234" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "results": 1,
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  },
  "data": {
    "bookings": [
      {
        "_id": "657b3456...",
        "customerId": {
          "_id": "657b9012...",
          "email": "customer@example.com",
          "role": "CUSTOMER"
        },
        "vehicleId": {
          "_id": "657b5678...",
          "make": "Toyota",
          "vehicleModel": "Camry",
          "registrationNumber": "ABC-1234"
        },
        "startDate": "2023-12-25T10:00:00.000Z",
        "endDate": "2023-12-27T10:00:00.000Z",
        "totalCost": 200,
        "status": "CONFIRMED",
        "createdAt": "2023-12-14T12:00:00.000Z",
        "updatedAt": "2023-12-14T12:00:00.000Z"
      }
    ]
  }
}
```

**Note:** Owners automatically see only bookings for their vehicles.

### Cancel Booking (CUSTOMER, ADMIN, OWNER)
**PATCH** `/bookings/:id/cancel`

Cancel a booking. Customers can cancel their own bookings. Owners can cancel bookings for their vehicles. Admins can cancel any booking.

**Allowed Roles:** CUSTOMER, ADMIN, OWNER

```bash
curl -X PATCH http://localhost:5000/api/v1/bookings/<BOOKING_ID>/cancel \
  -H "Authorization: Bearer <CUSTOMER_ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "message": "Booking cancelled successfully",
  "data": {
    "booking": {
      "_id": "657b3456...",
      "customerId": "657b9012...",
      "vehicleId": "657b5678...",
      "startDate": "2023-12-25T10:00:00.000Z",
      "endDate": "2023-12-27T10:00:00.000Z",
      "totalCost": 200,
      "status": "CANCELLED",
      "createdAt": "2023-12-14T12:00:00.000Z",
      "updatedAt": "2023-12-14T15:00:00.000Z"
    }
  }
}
```

**Error Cases:**
- Booking not found
- No permission to cancel (customer can only cancel own bookings, owner only for their vehicles)
- Booking already cancelled
- Cannot cancel completed bookings

**Note:** Associated trip is automatically soft-deleted if still in ASSIGNED status.

---

## Trips (Protected)

### Create Trip (ADMIN only)
**POST** `/trips`

```bash
curl -X POST http://localhost:5000/api/v1/trips \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "<BOOKING_ID>",
    "driverId": "<DRIVER_USER_ID>"
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "trip": {
      "bookingId": "657b3456...",
      "driverId": "657b7890...",
      "vehicleId": "657b5678...",
      "status": "ASSIGNED",
      "_id": "657b9999...",
      "createdAt": "2023-12-14T13:00:00.000Z",
      "updatedAt": "2023-12-14T13:00:00.000Z",
      "isDeleted": false,
      "deletedAt": null
    }
  }
}
```

### Get Assigned Trips (DRIVER only)
**GET** `/trips`

```bash
curl -X GET http://localhost:5000/api/v1/trips \
  -H "Authorization: Bearer <DRIVER_ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "results": 1,
  "data": {
    "trips": [
      {
        "_id": "657b9999...",
        "bookingId": { ... },
        "driverId": "657b7890...",
        "vehicleId": { ... },
        "status": "ASSIGNED"
      }
    ]
  }
}
```

### Update Trip Status (DRIVER only)
**PATCH** `/trips/:id`

```bash
curl -X PATCH http://localhost:5000/api/v1/trips/<TRIP_ID> \
  -H "Authorization: Bearer <DRIVER_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "STARTED"
  }'
```
*Note: Status can be `STARTED` or `COMPLETED`.*

**Response:**
```json
{
  "status": "success",
  "data": {
    "trip": {
      "_id": "657b9999...",
      "status": "STARTED",
      "startOdometer": 1000,
      "startTime": "2023-12-14T13:30:00.000Z",
      "bookingId": "657b3456...",
      "driverId": "657b7890...",
      "vehicleId": "657b5678..."
    }
  }
}
```

### Cancel Trip (ADMIN only)
**DELETE** `/trips/:id`

Soft deletes a trip and cascades changes. If trip was started, vehicle status is reset to IDLE. Associated booking is cancelled if not completed.

```bash
curl -X DELETE http://localhost:5000/api/v1/trips/<TRIP_ID> \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "message": "Trip cancelled successfully",
  "data": {
    "trip": {
      "_id": "657b9999...",
      "bookingId": "657b3456...",
      "driverId": "657b7890...",
      "vehicleId": "657b5678...",
      "status": "STARTED",
      "isDeleted": true,
      "deletedAt": "2023-12-14T15:00:00.000Z",
      "createdAt": "2023-12-14T13:00:00.000Z",
      "updatedAt": "2023-12-14T15:00:00.000Z"
    }
  }
}
```

**Error Cases:**
- Trip not found
- Trip is already cancelled
- Cannot cancel completed trips

**Cascade Effects:**
- If trip status was STARTED: Vehicle status reset to IDLE
- Associated booking status set to CANCELLED (if not already COMPLETED)
- Trip is soft deleted (isDeleted = true)

---

## Analytics (Protected: ADMIN, OWNER, DRIVER)

### Get Dashboard Stats
**GET** `/analytics/dashboard`

Get analytics dashboard data. Response varies based on user role.

**Admin Response:**
```bash
curl -X GET http://localhost:5000/api/v1/analytics/dashboard \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "stats": {
      "totalRevenue": 5000,
      "activeTrips": 3,
      "vehicleUtilization": {
        "totalVehicles": 10,
        "activeVehicles": 4,
        "utilizationRate": 40
      },
      "totalBookings": 15,
      "completedTrips": 12
    }
  }
}
```

### Get Top Revenue Owners (ADMIN only)
**GET** `/analytics/top-owners`

Get list of owners ranked by total revenue generated from their vehicles. Supports pagination, filtering, and sorting.

**Query Parameters:**
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 10): Number of items per page
- `sortBy` (optional, default: 'totalRevenue'): Field to sort by (totalRevenue, totalBookings, vehicleCount, email)
- `order` (optional, default: 'desc'): Sort order ('asc' or 'desc')
- `email` (optional): Filter by owner email (case-insensitive partial match)
- `minRevenue` (optional): Filter owners with minimum total revenue
- `minBookings` (optional): Filter owners with minimum total bookings

```bash
curl -X GET http://localhost:5000/api/v1/analytics/top-owners \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"

curl -X GET "http://localhost:5000/api/v1/analytics/top-owners?page=1&limit=5" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"

curl -X GET "http://localhost:5000/api/v1/analytics/top-owners?email=owner1&minRevenue=5000" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"

curl -X GET "http://localhost:5000/api/v1/analytics/top-owners?sortBy=totalBookings&order=desc&minBookings=10" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "results": 5,
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 15,
    "itemsPerPage": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "data": {
    "owners": [
      {
        "ownerId": "657b1234...",
        "email": "owner1@example.com",
        "totalRevenue": 15000,
        "totalBookings": 45,
        "vehicleCount": 8
      },
      {
        "ownerId": "657b1235...",
        "email": "owner2@example.com",
        "totalRevenue": 12000,
        "totalBookings": 38,
        "vehicleCount": 5
      }
    ]
  }
}
```

### Get Top Vehicles (ADMIN only)
**GET** `/analytics/top-vehicles`

Get list of vehicles ranked by total revenue generated from bookings. Supports pagination, filtering, and sorting.

**Query Parameters:**
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 10): Number of items per page
- `sortBy` (optional, default: 'totalRevenue'): Field to sort by (totalRevenue, totalBookings, completedTrips)
- `order` (optional, default: 'desc'): Sort order ('asc' or 'desc')
- `make` (optional): Filter by vehicle make (case-insensitive partial match)
- `model` (optional): Filter by vehicle model (case-insensitive partial match)
- `registrationNumber` (optional): Filter by registration number (case-insensitive partial match)
- `minRevenue` (optional): Filter vehicles with minimum total revenue
- `minBookings` (optional): Filter vehicles with minimum total bookings

```bash
curl -X GET http://localhost:5000/api/v1/analytics/top-vehicles \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"

curl -X GET "http://localhost:5000/api/v1/analytics/top-vehicles?page=1&limit=5" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"

curl -X GET "http://localhost:5000/api/v1/analytics/top-vehicles?make=Toyota&minRevenue=3000" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"

curl -X GET "http://localhost:5000/api/v1/analytics/top-vehicles?sortBy=totalBookings&order=desc&minBookings=15" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "results": 5,
  "pagination": {
    "currentPage": 1,
    "totalPages": 4,
    "totalItems": 20,
    "itemsPerPage": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "data": {
    "vehicles": [
      {
        "vehicleId": "657b5678...",
        "make": "Toyota",
        "model": "Camry",
        "registrationNumber": "ABC-1234",
        "year": 2022,
        "ownerEmail": "owner1@example.com",
        "totalBookings": 25,
        "totalRevenue": 8000,
        "completedTrips": 22
      },
      {
        "vehicleId": "657b5679...",
        "make": "Honda",
        "model": "Accord",
        "registrationNumber": "XYZ-5678",
        "year": 2023,
        "ownerEmail": "owner2@example.com",
        "totalBookings": 20,
        "totalRevenue": 6500,
        "completedTrips": 18
      }
    ]
  }
}
```

### Get Top Customers (ADMIN only)
**GET** `/analytics/top-customers`

Get list of customers ranked by total number of trips completed. Supports pagination, filtering, and sorting.

**Query Parameters:**
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 10): Number of items per page
- `sortBy` (optional, default: 'totalTrips'): Field to sort by (totalTrips, completedTrips, totalSpent, uniqueVehiclesUsed)
- `order` (optional, default: 'desc'): Sort order ('asc' or 'desc')
- `email` (optional): Filter by customer email (case-insensitive partial match)
- `minTrips` (optional): Filter customers with minimum total trips
- `minSpent` (optional): Filter customers with minimum total spending

```bash
curl -X GET http://localhost:5000/api/v1/analytics/top-customers \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"

curl -X GET "http://localhost:5000/api/v1/analytics/top-customers?page=1&limit=5" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"

curl -X GET "http://localhost:5000/api/v1/analytics/top-customers?email=customer&minTrips=10" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"

curl -X GET "http://localhost:5000/api/v1/analytics/top-customers?sortBy=totalSpent&order=desc&minSpent=5000" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "results": 5,
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 25,
    "itemsPerPage": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "data": {
    "customers": [
      {
        "customerId": "657b3456...",
        "email": "customer1@example.com",
        "totalTrips": 35,
        "completedTrips": 32,
        "totalSpent": 10500,
        "uniqueVehiclesUsed": 8
      },
      {
        "customerId": "657b3457...",
        "email": "customer2@example.com",
        "totalTrips": 28,
        "completedTrips": 25,
        "totalSpent": 8200,
        "uniqueVehiclesUsed": 6
      }
    ]
  }
}
```

**Owner Response:**
```bash
curl -X GET http://localhost:5000/api/v1/analytics/dashboard \
  -H "Authorization: Bearer <OWNER_ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "stats": {
      "totalVehicles": 5,
      "totalBookings": 12,
      "totalRevenue": 2400,
      "completedTrips": 8,
      "activeTrips": 2,
      "topVehicles": [
        {
          "vehicleId": "657b5678...",
          "make": "Toyota",
          "model": "Camry",
          "registrationNumber": "ABC-1234",
          "bookingCount": 8,
          "totalRevenue": 1600
        },
        {
          "vehicleId": "657b5679...",
          "make": "Honda",
          "model": "Accord",
          "registrationNumber": "XYZ-5678",
          "bookingCount": 4,
          "totalRevenue": 800
        }
      ],
      "tripDurations": [
        {
          "vehicleId": "657b5678...",
          "make": "Toyota",
          "model": "Camry",
          "registrationNumber": "ABC-1234",
          "totalTrips": 5,
          "avgDurationHours": 12.5,
          "totalDurationHours": 62.5
        },
        {
          "vehicleId": "657b5679...",
          "make": "Honda",
          "model": "Accord",
          "registrationNumber": "XYZ-5678",
          "totalTrips": 3,
          "avgDurationHours": 10.2,
          "totalDurationHours": 30.6
        }
      ]
    }
  }
}
```

**Owner Analytics Include:**
- Total vehicles owned
- Total bookings for owned vehicles
- Total revenue from bookings
- Completed and active trips count
- Top 3 most booked vehicles with booking counts and revenue
- Trip durations for each vehicle (sorted by total duration)
  - Total number of trips
  - Average trip duration in hours
  - Total trip duration in hours

**Driver Response:**
```bash
curl -X GET http://localhost:5000/api/v1/analytics/dashboard \
  -H "Authorization: Bearer <DRIVER_ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "stats": {
      "totalTrips": 15,
      "completedTrips": 12,
      "activeTrips": 1,
      "totalVehiclesDriven": 3,
      "longestTrip": {
        "tripId": "657b9999...",
        "vehicle": {
          "make": "Toyota",
          "model": "Camry",
          "registrationNumber": "ABC-1234"
        },
        "durationHours": 18.5,
        "startTime": "2023-12-14T08:00:00.000Z",
        "endTime": "2023-12-15T02:30:00.000Z",
        "startOdometer": 1000,
        "endOdometer": 1450
      },
      "drivingStats": {
        "totalDrivingHours": 145.75,
        "averageTripHours": 12.15
      },
      "vehiclesDriven": [
        {
          "vehicleId": "657b5678...",
          "make": "Toyota",
          "model": "Camry",
          "registrationNumber": "ABC-1234",
          "tripCount": 8,
          "completedTrips": 7
        },
        {
          "vehicleId": "657b5679...",
          "make": "Honda",
          "model": "Accord",
          "registrationNumber": "XYZ-5678",
          "tripCount": 5,
          "completedTrips": 4
        },
        {
          "vehicleId": "657b5680...",
          "make": "Ford",
          "model": "F-150",
          "registrationNumber": "DEF-9012",
          "tripCount": 2,
          "completedTrips": 1
        }
      ]
    }
  }
}
```

**Driver Analytics Include:**
- Total trips assigned to the driver
- Completed and active trips count
- Total number of unique vehicles driven
- Longest trip details:
  - Vehicle information
  - Duration in hours
  - Start and end times
  - Odometer readings
- Driving statistics:
  - Total driving hours across all completed trips
  - Average trip duration in hours
- List of all vehicles driven with:
  - Vehicle details
  - Total trip count
  - Completed trips count
  - Sorted by trip count (descending)
