# Fleet Management System

A comprehensive fleet management system with three components:
- **Backend**: Node.js/Express/TypeScript API with MongoDB and Redis
- **Part-1**: Next.js admin portal (port 3000)
- **Part-2**: React/Vite user dashboard (port 4000)

## Default Credentials

### Admin Account
- **Email**: `admin@fleet.com`
- **Password**: `password`

### Seeded User Accounts
All automatically created user accounts have the password: `password`

---

## Quick Start (Recommended)

### Prerequisites
- **MongoDB** (running on default port 27017)
- **Redis** (running on default port 6379)
- **Docker** (for Part-1 and Part-2)

### Steps to Start

1. **Start MongoDB and Redis**
   ```bash
   # Start MongoDB
   mongod
   
   # Start Redis (in another terminal)
   redis-server
   ```

2. **Start the Backend**
   ```bash
   cd backend
   chmod +x start.sh
   ./start.sh
   ```
   The backend will run on `http://localhost:5000` and automatically seed the database.

3. **Start the Admin Portal (Part-1)**
   ```bash
   cd part-1
   chmod +x start.sh
   ./start.sh
   ```
   The admin portal will be available at `http://localhost:3000`

4. **Start the User Dashboard (Part-2)**
   ```bash
   cd part-2
   chmod +x start.sh
   ./start.sh
   ```
   The user dashboard will be available at `http://localhost:4000`

5. **Login**
   - Access the admin portal at `http://localhost:3000`
   - Login with admin credentials (admin@fleet.com / password)
   - View user list and pick any user email
   - Use that email to login on the user dashboard at `http://localhost:4000`

---

## Detailed Setup Instructions

### 1. Backend Setup (Express API)

The backend provides the API for both frontends and includes automatic database seeding.

#### Installation

```bash
cd backend
npm install
```

#### Environment Configuration

Create a `.env` file in the `backend` directory (if not exists):

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/fleet-management

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000,http://localhost:4000
```

#### Running the Backend

**Option 1: Using the start script** (recommended)
```bash
chmod +x start.sh
./start.sh
```

The script will:
- Check MongoDB and Redis connectivity
- Install dependencies if needed
- Automatically seed the database with sample data
- Start the development server

**Option 2: Manual start**
```bash
npm run dev
```

The backend will run on `http://localhost:5000`
If backend fails to start you will have to run it manually using `yarn dev`

#### Database Seeding

The backend automatically seeds the database on startup with:
- 1 admin account
- Sample drivers, vehicles, trips, and bookings
- All seeded accounts use the password: `password`

---

### 2. Part-1 Setup (Next.js Admin Portal)

Admin portal for managing the fleet system.

#### Installation

```bash
cd part-1
npm install
```

#### Environment Configuration

Create a `.env.local` file in the `part-1` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
```

#### Running Part-1

**Option 1: Docker (recommended)**
```bash
chmod +x start.sh
./start.sh
```

This will:
- Build a Docker image
- Run the container on port 3000

**Option 2: Development mode**
```bash
npm run dev
```

The admin portal will be available at `http://localhost:3000`

---

### 3. Part-2 Setup (React/Vite User Dashboard)

User-facing dashboard built with React and Vite.

#### Installation

```bash
cd part-2
npm install
```

#### Environment Configuration

Create a `.env` file in the `part-2` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

#### Running Part-2

**Option 1: Docker (recommended)**
```bash
chmod +x start.sh
./start.sh
```

This will:
- Build a Docker image
- Run the container on port 4000

**Option 2: Development mode**
```bash
npm run dev
```

The user dashboard will be available at `http://localhost:4000`

---

## Default Credentials

### Admin Account
- **Email**: `admin@fleet.com`
- **Password**: `password`

### Seeded User Accounts
All automatically created user accounts have the password: `password`

---

## Quick Start Guide

1. **Start MongoDB and Redis**
   ```bash
   # Start MongoDB
   mongod
   
   # Start Redis (in another terminal)
   redis-server
   ```

2. **Start the Backend**
   ```bash
   cd backend
   ./start.sh
   ```

3. **Start the Admin Portal (Part-1)**
   ```bash
   cd part-1
   ./start.sh
   ```

4. **Start the User Dashboard (Part-2)**
   ```bash
   cd part-2
   ./start.sh
   ```

5. **Access the Applications**
   - Backend API: `http://localhost:5000`
   - Admin Portal: `http://localhost:3000`
   - User Dashboard: `http://localhost:4000`

---

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check if MongoDB is accessible on port 27017

### Redis Connection Issues
- Ensure Redis is running: `redis-cli ping` (should return PONG)
- Check if Redis is accessible on port 6379

### Port Already in Use
- Backend (5000): Check and kill the process using `lsof -ti:5000 | xargs kill`
- Part-1 (3000): Check and kill the process using `lsof -ti:3000 | xargs kill`
- Part-2 (4000): Check and kill the process using `lsof -ti:4000 | xargs kill`

### Docker Issues
- Ensure Docker is running
- Check container status: `docker ps -a`
- View logs: `docker logs <container-name>`

---

## Development Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Manually run database seeding

### Part-1 (Next.js)
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Part-2 (React/Vite)
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

## Admin Portal Screenshots

![Screenshot 1](screenshots/Screenshot%202025-12-21%20at%2010.09.34%20PM.png)
![Screenshot 2](screenshots/Screenshot%202025-12-21%20at%2010.09.57%20PM.png)
![Screenshot 3](screenshots/Screenshot%202025-12-21%20at%2010.11.01%20PM.png)
![Screenshot 4](screenshots/Screenshot%202025-12-21%20at%2010.11.26%20PM.png)
![Screenshot 5](screenshots/Screenshot%202025-12-21%20at%2010.11.43%20PM.png)