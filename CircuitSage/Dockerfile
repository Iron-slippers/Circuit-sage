# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code and configuration files
COPY . .

# Build the application (frontend + backend)
RUN npm run build

# Production stage
FROM node:20-alpine

# Set production environment
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Create non-root user for security
RUN adduser -D -u 1001 nodeuser

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

# Copy database configuration if exists
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts 2>/dev/null || true

# Change ownership to non-root user
RUN chown -R nodeuser:nodeuser /usr/src/app

USER nodeuser

# Expose the application port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/formulas', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/index.js"]
