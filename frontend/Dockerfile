# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files first for better caching
COPY package.json ./
COPY package-lock.jso[n] ./

# Install dependencies
RUN npm ci

# Copy source code and configuration files
COPY . .

# Set build-time environment variables
ARG VITE_API_URL=http://localhost:5003
ARG VITE_API_PREFIX=/api
ARG VITE_DEPLOY_URL=http://localhost:3000

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_PREFIX=$VITE_API_PREFIX
ENV VITE_DEPLOY_URL=$VITE_DEPLOY_URL

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S frontend -u 1001 -G nodejs

# Copy package files
COPY package.json ./
COPY package-lock.jso[n] ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/.output ./.output

# Change ownership of the app directory to non-root user
RUN chown -R frontend:nodejs /app

# Switch to non-root user
USER frontend

# Render provides PORT environment variable dynamically
EXPOSE 3000

# Health check with fixed port fallback
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/ || curl -f http://localhost:3000/ || exit 1

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
