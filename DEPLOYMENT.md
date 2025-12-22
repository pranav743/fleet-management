# Fleet Management System - AWS Deployment Guide

Complete deployment guide for backend, admin portal (Next.js), and frontend (React) components.

---

## Prerequisites

- AWS Account with CLI configured
- Node.js and Docker installed
- MongoDB Atlas account (free tier)
- AWS ElastiCache Redis or equivalent

---

## 1. Backend Deployment (ECS)

### 1.1 Setup External Services

**MongoDB Atlas:**
- Create cluster at mongodb.com/atlas
- Whitelist IP: `0.0.0.0/0`
- Copy connection string

**Redis:**
- Create ElastiCache Redis in same VPC as ECS
- Note the endpoint

### 1.2 Deploy to ECS

```bash
# Build and tag
cd backend
docker build -t fleet-backend:latest .

# Create ECR repository
aws ecr create-repository --repository-name fleet-backend --region us-east-1

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag fleet-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/fleet-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/fleet-backend:latest
```

### 1.3 Create ECS Resources

**Task Definition:**
- Launch type: Fargate
- CPU: 512, Memory: 1024 MB
- Container port: 5000
- Environment variables:
  ```
  MONGODB_URI=<atlas-connection-string>
  REDIS_HOST=<redis-endpoint>
  REDIS_PORT=6379
  JWT_SECRET=<your-secret>
  PORT=5000
  NODE_ENV=production
  ```

**Service:**
- Cluster: fleet-cluster (create if needed)
- Launch type: Fargate
- Desired tasks: 1
- Public IP: Enabled
- Security group: Allow port 5000 (TCP)

**Access:** `http://<backend-ecs-ip>:5000/api/health`

---

## 2. Admin Portal Deployment (S3 Static)

### 2.1 Configure for Static Export

Update [part-1/next.config.ts](part-1/next.config.ts):
```typescript
const nextConfig: NextConfig = {
  output: "export",
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"]
  }
};
```

### 2.2 Set Environment Variables

Create `part-1/.env.production`:
```env
NEXT_PUBLIC_API_URL=http://<backend-ecs-ip>:5000
NEXTAUTH_URL=http://<s3-bucket-name>.s3-website-us-east-1.amazonaws.com
NEXTAUTH_SECRET=<your-secret>
```

### 2.3 Build and Deploy

```bash
cd part-1
npm run build

# Create S3 bucket
aws s3 mb s3://fleet-admin-portal --region us-east-1

# Upload files
aws s3 sync out/ s3://fleet-admin-portal/ --delete
```

### 2.4 Configure S3 Bucket

**Settings:**
- Uncheck "Block all public access"
- Enable static website hosting
- Index document: `index.html`

**Bucket Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::fleet-admin-portal/*"
  }]
}
```

**Access:** `http://fleet-admin-portal.s3-website-us-east-1.amazonaws.com`

---

## 3. Frontend Deployment (ECS)

### 3.1 Configure API Endpoint

Update `part-2/src/lib/axios.ts`:
```typescript
baseURL: 'http://<backend-ecs-ip>:5000'
```

### 3.2 Build and Push

```bash
cd part-2
docker build -t fleet-frontend:latest .

# Create ECR repository
aws ecr create-repository --repository-name fleet-frontend --region us-east-1

# Login, tag, and push
aws ecr get-login-password --region us-east-1 | \
docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag fleet-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/fleet-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/fleet-frontend:latest
```

### 3.3 Create ECS Service

**Task Definition:**
- Launch type: Fargate
- CPU: 256, Memory: 512 MB
- Container port: 4000

**Service:**
- Cluster: fleet-cluster
- Desired tasks: 1
- Public IP: Enabled
- Security group: Allow port 4000 (TCP)

**Access:** `http://<frontend-ecs-ip>:4000`

---

## 4. Post-Deployment

### Update CORS
Update backend to allow frontend origins in CORS configuration.

### Optional: Production Enhancements
- **HTTPS:** Use Application Load Balancer + ACM certificates
- **CDN:** CloudFront for frontend and admin portal
- **Domain:** Route 53 for custom domain
- **Monitoring:** CloudWatch for logs and metrics
- **Scaling:** Configure auto-scaling for ECS services

---

## Quick Updates

**Backend:**
```bash
docker build -t fleet-backend:latest .
docker tag fleet-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/fleet-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/fleet-backend:latest
# Update ECS service to force new deployment
```

**Admin Portal:**
```bash
cd part-1 && npm run build
aws s3 sync out/ s3://fleet-admin-portal/ --delete
```

**Frontend:**
```bash
docker build -t fleet-frontend:latest .
docker tag fleet-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/fleet-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/fleet-frontend:latest
# Update ECS service to force new deployment
```
