# Build stage
FROM --platform=linux/amd64 node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Build the TypeScript application
RUN npm run build

# Production stage
FROM --platform=linux/amd64 node:20-alpine AS production

# Install SQLite
RUN apk add --no-cache sqlite

WORKDIR /app

# Create user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001 -G nodejs

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/config ./config

# Create data directory with proper permissions
RUN mkdir -p /app/data && \
    chown -R backend:nodejs /app/data && \
    chmod 755 /app/data

# Change to non-root user
USER backend

# Expose port
EXPOSE 5003

# Start application
CMD ["npm", "start"]
