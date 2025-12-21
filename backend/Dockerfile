# Multi-stage build for smaller image size
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN yarn build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install only production dependencies
RUN yarn install --production --frozen-lockfile && \
    yarn cache clean

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Expose port for Node App
EXPOSE 5000

# Environment variables
ENV NODE_ENV=production \
    PORT=5000

USER nodejs

CMD ["node", "dist/server.js"]
