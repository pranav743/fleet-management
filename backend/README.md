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

```bash
curl -X GET "http://localhost:5000/api/v1/vehicles?status=IDLE" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "results": 1,
  "data": {
    "vehicles": [
      {
        "_id": "657b5678...",
        "make": "Toyota",
        "vehicleModel": "Camry",
        "status": "IDLE",
        "type": "SEDAN",
        "registrationNumber": "ABC-1234",
        "ownerId": "657b1234..."
      }
    ]
  }
}
```

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

---

## Bookings (Protected)

### Create Booking
**POST** `/bookings`

```bash
curl -X POST http://localhost:5000/api/v1/bookings \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
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
      "status": "PENDING",
      "_id": "657b3456...",
      "createdAt": "2023-12-14T12:00:00.000Z",
      "updatedAt": "2023-12-14T12:00:00.000Z",
      "isDeleted": false,
      "deletedAt": null
    }
  }
}
```

### Get My Bookings
**GET** `/bookings`

```bash
curl -X GET http://localhost:5000/api/v1/bookings \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Response:**
```json
{
  "status": "success",
  "results": 1,
  "data": {
    "bookings": [
      {
        "_id": "657b3456...",
        "customerId": "657b9012...",
        "vehicleId": {
          "_id": "657b5678...",
          "make": "Toyota",
          "vehicleModel": "Camry",
          "registrationNumber": "ABC-1234"
        },
        "startDate": "2023-12-25T10:00:00.000Z",
        "endDate": "2023-12-27T10:00:00.000Z",
        "totalCost": 200,
        "status": "PENDING"
      }
    ]
  }
}
```

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

---

## Analytics (Protected: ADMIN only)

### Get Dashboard Stats
**GET** `/analytics/dashboard`

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
