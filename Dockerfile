# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim AS production

WORKDIR /app

# Install curl and openssl (optional but useful)
RUN apt update && apt install -y curl openssl && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -s /bin/bash appuser

# Copy built app from builder
COPY --from=builder /app /app

# Set permissions
RUN chown -R appuser /app

# Switch to non-root user
USER appuser

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/api/health || exit 1

CMD ["node", "dist/main.js"]
