# Multi-stage production build for SatQuery AI
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy application sources
COPY . .

# Build Vite frontend and compile TypeScript backend
RUN npm run build

# Production runtime image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Create runtime directories for uploads and logs
RUN mkdir -p uploads logs

EXPOSE 3000

CMD ["node", "dist/server.js"]
