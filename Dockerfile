FROM node:20-alpine AS builder
WORKDIR /app

# Enable corepack for modern package manager support and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of your app's source code
COPY . .

# Build the Vite frontend application
RUN npm run build

# Production image
FROM node:20-alpine
WORKDIR /app

# Copy production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Install tsx globally (required since your script uses tsx server/index.ts)
RUN npm install -g tsx

# Copy the built frontend and the backend server files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/src ./src

# Expose the API server port (this port must match your $PORT in Coolify)
EXPOSE 3001

# Add standard Coolify healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the full-stack server
CMD ["npm", "run", "start-server"]
