# ======================
# Stage 1: Build
# ======================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json package-lock.json ./

# Install dependencies (production + dev for build tools)
RUN npm ci

# Copy environment variables (required for Vite build-time environment variable substitution)
# IMPORTANT: Ensure .env file exists before building Docker image
# .env must contain: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
COPY .env .env

# Copy source code
COPY . .

# Build the production bundle
# Vite reads VITE_* environment variables at build time and embeds them into the bundle
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

# Copy custom nginx config (replaces default config)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port (standard HTTP)
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
