
# Multi-stage Dockerfile for SCRYPTEX Backend
# Optimized for both development and production builds

# Base stage with Node.js
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    curl \
    git \
    python3 \
    make \
    g++ \
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Development stage
FROM base AS development

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p logs uploads

# Set up proper permissions
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Development command
CMD ["npm", "run", "dev"]

# Production dependencies stage
FROM base AS prod-deps

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Build stage
FROM base AS build

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S scryptex -u 1001

# Copy package files
COPY package*.json ./

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy built application
COPY --from=build /app/dist ./dist

# Copy necessary runtime files
COPY --from=build /app/migrations ./migrations

# Create directories
RUN mkdir -p logs uploads && \
    chown -R scryptex:nodejs /app

# Switch to non-root user
USER scryptex

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Production command
CMD ["npm", "start"]

# Multi-platform support
LABEL maintainer="SCRYPTEX Team <team@scryptex.com>" \
      version="1.0.0" \
      description="SCRYPTEX Multi-Chain DEX Backend" \
      org.opencontainers.image.source="https://github.com/scryptex/backend" \
      org.opencontainers.image.description="Production-ready Node.js backend for SCRYPTEX platform" \
      org.opencontainers.image.vendor="SCRYPTEX" \
      org.opencontainers.image.licenses="MIT"

# Build arguments for customization
ARG NODE_ENV=production
ARG API_VERSION=v1
ARG BUILD_DATE
ARG GIT_COMMIT

ENV NODE_ENV=${NODE_ENV} \
    API_VERSION=${API_VERSION} \
    BUILD_DATE=${BUILD_DATE} \
    GIT_COMMIT=${GIT_COMMIT}
