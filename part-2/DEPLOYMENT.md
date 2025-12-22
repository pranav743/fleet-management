# Fleet Management Frontend - AWS ECS Deployment

## Prerequisites
- AWS Account with CLI configured
- Docker installed
- Backend API URL

## Environment Variables
Update the API endpoint in `src/lib/axios.ts` to point to your backend ECS service.

---

## Deployment Steps

### 1. Build Docker Image
```bash
docker build -t fleet-frontend:latest .
```

### 2. Create ECR Repository
```bash
aws ecr create-repository --repository-name fleet-frontend --region us-east-1
```

### 3. Push to Amazon ECR
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag fleet-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/fleet-frontend:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/fleet-frontend:latest
```

### 4. Create ECS Task Definition
- **Launch type**: Fargate
- **CPU**: 256 (.25 vCPU)
- **Memory**: 512 MB
- **Container**:
  - Image: `<account-id>.dkr.ecr.us-east-1.amazonaws.com/fleet-frontend:latest`
  - Port: `4000`
- **Execution role**: `ecsTaskExecutionRole`

### 5. Create ECS Service
- **Cluster**: fleet-cluster (reuse or create new)
- **Launch type**: Fargate
- **Desired tasks**: 1
- **Auto-assign Public IP**: Enabled
- **VPC**: Same as backend
- **Subnets**: Select public subnets

### 6. Configure Security Group
**Inbound Rules:**
- Port `4000` (TCP) - Source: `0.0.0.0/0` - Web access

**Outbound Rules:**
- All traffic

### 7. Access Application
```
http://<ecs-public-ip>:4000
```

---

## Production Notes
- For production, use Application Load Balancer with HTTPS
- Configure custom domain with Route 53
- Update CORS settings in backend to allow frontend domain
- Consider CloudFront CDN for better performance
