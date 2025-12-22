# Fleet Management Admin Portal - S3 Static Deployment

## Prerequisites
- AWS Account with CLI configured
- Node.js installed
- Backend API deployed and accessible

---

## Deployment Steps

### 1. Configure Next.js for Static Export

Update [next.config.ts](next.config.ts):
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"]
  }
};

export default nextConfig;
```

Update [package.json](package.json) scripts:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "deploy": "next build",
  "lint": "eslint"
}
```

### 2. Set Environment Variables

Create `.env.production`:
```env
NEXT_PUBLIC_API_URL=<your-backend-api-url>
NEXTAUTH_URL=<your-s3-website-url>
NEXTAUTH_SECRET=<your-secret>
```

### 3. Build Static Files

```bash
npm run deploy
```

This creates an `out/` directory with all static files.

### 4. Create S3 Bucket

```bash
aws s3 mb s3://fleet-admin-portal --region us-east-1
```

Or via AWS Console:
- Bucket name: `fleet-admin-portal`
- Region: us-east-1
- **Uncheck** "Block all public access"

### 5. Enable Static Website Hosting

AWS Console → S3 → Your Bucket → Properties → Static website hosting:
- Enable hosting
- Index document: `index.html`
- Error document: `404.html`

Note the endpoint URL: `http://fleet-admin-portal.s3-website-us-east-1.amazonaws.com`

### 6. Set Bucket Policy

Add this policy for public read access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::fleet-admin-portal/*"
    }
  ]
}
```

### 7. Upload to S3

```bash
aws s3 sync out/ s3://fleet-admin-portal/ --delete
```

The `--delete` flag removes old files.

### 8. Access Your Site

Open the S3 website endpoint in browser:
```
http://fleet-admin-portal.s3-website-us-east-1.amazonaws.com
```

---

## Optional: CloudFront CDN (HTTPS)

### 1. Create CloudFront Distribution
- Origin: S3 website endpoint
- Viewer Protocol: Redirect HTTP to HTTPS
- Default root object: `index.html`

### 2. Update Environment
Update `NEXTAUTH_URL` to CloudFront URL and redeploy.

---

## Update Workflow

After making changes:

```bash
npm run deploy
aws s3 sync out/ s3://fleet-admin-portal/ --delete
```

CloudFront cache invalidation (if using CDN):
```bash
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```
