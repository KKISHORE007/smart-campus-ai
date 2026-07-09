# ============================================================
# Student Helpdesk Agent — Frontend Dockerfile (Production)
# ============================================================
# Multi-stage build: Vite compilation -> Nginx Alpine serving.
# ============================================================

# Stage 1: Build the React + Vite bundle
FROM node:20-alpine AS build
WORKDIR /app

# Copy package configuration and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Build production static bundle (defaults API path to /api for reverse proxy)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine AS serve
WORKDIR /usr/share/nginx/html

# Remove default Nginx welcome page
RUN rm -rf ./*

# Copy compiled production bundle from Stage 1
COPY --from=build /app/dist ./

# Copy custom Nginx proxy and routing configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Healthcheck for frontend accessibility
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
