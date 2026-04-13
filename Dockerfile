# ======================
# Stage 1: Build
# ======================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json package-lock.json ./

# Install dependencies (production + dev for build tools)
RUN npm ci

# Copy source code
COPY . .

# Build the production bundle
RUN npm run build

# Remove node_modules to reduce build context
RUN rm -rf node_modules

# ======================
# Stage 2: Serve with Nginx
# ======================
FROM nginx:alpine

# Labels for Docker metadata
LABEL maintainer="SmartMessX Team"
LABEL description="Production-ready React + Vite application"

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Fix permissions for nginx user to write cache and temp files
RUN mkdir -p /var/cache/nginx /run /var/run \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /run \
    && chown -R nginx:nginx /var/run \
    && chown -R nginx:nginx /usr/share/nginx/html

# Switch to non-root user for security
USER nginx

# Expose port (standard HTTP)
EXPOSE 80

# Health check to ensure container is running properly
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
