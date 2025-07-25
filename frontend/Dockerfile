# Build stage - force x86_64 platform for better compatibility
FROM --platform=linux/amd64 node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Clean install with proper architecture handling
RUN npm ci --ignore-scripts && \
    npm rebuild && \
    npm run postinstall --if-present

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM --platform=linux/amd64 node:20-alpine AS production

WORKDIR /app

# Create user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nuxtjs -u 1001 -G nodejs

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/.output ./.output

# Change to non-root user
USER nuxtjs

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
