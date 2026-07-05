# ============================================================
# Student Helpdesk Agent — Backend Dockerfile (Production)
# ============================================================
# Multi-stage optimized Node.js runtime for Express API & MongoDB.
# ============================================================

FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies first for optimal layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY src/ ./src/

# Set production environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Expose API port
EXPOSE 5000

# Healthcheck to verify Express API responsiveness
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api || exit 1

# Start the server
CMD ["node", "src/index.js"]
