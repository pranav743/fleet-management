# Fleet Management Backend - AWS ECS Deployment

## Prerequisites
- AWS Account with CLI configured
- Docker installed
- MongoDB Atlas cluster (free tier works)
- Redis cluster (AWS ElastiCache recommended)

## Environment Variables Required
```env
MONGODB_URI=<mongodb-atlas-connection-string>
REDIS_HOST=<redis-host>
REDIS_PORT=6379
JWT_SECRET=<your-secret>
PORT=5000
NODE_ENV=production
```

---

## Deployment Steps

### 1. Setup MongoDB Atlas
- Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Whitelist IP: `0.0.0.0/0` (or specific ECS IPs)
- Copy connection string for `MONGODB_URI`

### 2. Setup Redis
- Create ElastiCache Redis cluster in same VPC as ECS
- Note the endpoint for `REDIS_HOST`

### 3. Build Docker Image
```bash
docker build -t fleet-backend:latest .
```

### 4. Create ECR Repository
```bash
aws ecr create-repository --repository-name fleet-backend --region us-east-1
```

### 5. Push to Amazon ECR
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag fleet-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/fleet-backend:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/fleet-backend:latest
```

### 6. Create ECS Task Definition
- **Launch type**: Fargate
- **CPU**: 512 (.5 vCPU)
- **Memory**: 1024 MB (1 GB)
- **Container**:
  - Image: `<account-id>.dkr.ecr.us-east-1.amazonaws.com/fleet-backend:latest`
  - Port: `5000`
  - Environment variables: Add all required env vars
- **Execution role**: `ecsTaskExecutionRole`

### 7. Create ECS Cluster
```bash
aws ecs create-cluster --cluster-name fleet-cluster --region us-east-1
```

### 8. Create ECS Service
- **Cluster**: fleet-cluster
- **Launch type**: Fargate
- **Desired tasks**: 1
- **Auto-assign Public IP**: Enabled
- **VPC**: Default or custom
- **Subnets**: Select public subnets

### 9. Configure Security Group
**Inbound Rules:**
- Port `5000` (TCP) - Source: `0.0.0.0/0` - API access
- Port `27017` (TCP) - Source: `0.0.0.0/0` - MongoDB (if self-hosted)
- Port `6379` (TCP) - Source: Security Group ID - Redis access

**Outbound Rules:**
- All traffic - Required for MongoDB Atlas and Redis

### 10. Access Application
```
http://<ecs-public-ip>:5000/api/health
```

---

## Quick Deploy with Docker Compose (Development)
```bash
docker-compose up -d
```

Access at: `http://localhost:5000`