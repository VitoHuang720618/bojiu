# Multi-stage build for optimization
FROM node:18-alpine AS builder

# Build Demo Frontend
WORKDIR /build/demo
COPY demo/package.json demo/yarn.lock ./
RUN yarn install --production=false
COPY demo/ ./
RUN yarn build

# Build Manager Frontend (needs shared package)
WORKDIR /build
COPY shared/ ./shared/
WORKDIR /build/manager/front
COPY manager/front/package.json manager/front/yarn.lock ./
RUN yarn install --production=false
COPY manager/front/ ./
RUN npx vite build

# Production stage
FROM nginx:alpine

# Install Node.js for backend
RUN apk add --no-cache nodejs npm curl openssl certbot

# Copy built frontends
COPY --from=builder /build/demo/dist /usr/share/nginx/html/demo
COPY --from=builder /build/manager/front/dist /usr/share/nginx/html/manager

# Setup backend
WORKDIR /app/backend
COPY manager/backend/package*.json ./

# Install all dependencies for building
RUN npm install

# Copy backend source and build TypeScript
COPY manager/backend/ ./

# Install TypeScript globally and compile
RUN npm install -g typescript && tsc

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Copy Nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/.htpasswd /etc/nginx/.htpasswd

# Create required directories with proper permissions
RUN mkdir -p /app/uploads /app/data /etc/nginx/ssl && \
    chown -R nginx:nginx /app/uploads /app/data /etc/nginx/ssl && \
    chmod 755 /app/uploads /app/data /etc/nginx/ssl

# Create volume mount points
VOLUME ["/app/uploads", "/app/data"]

# Setup startup script
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

# Health check with comprehensive validation
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT:-80}/health && \
    curl -f http://localhost:${PORT:-80}/api/health && \
    curl -f http://localhost:${PORT:-80}/ >/dev/null && \
    curl -f http://localhost:${PORT:-80}/admin/ >/dev/null || exit 1

EXPOSE 80 443
CMD ["/start.sh"]