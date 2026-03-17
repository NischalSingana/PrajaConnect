# Production image
FROM node:20-alpine
WORKDIR /app

# Enable corepack for modern package manager support and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of your app's source code
COPY . .

# Build the Vite frontend application
RUN npm run build

# Install tsx globally (required for server/index.ts)
RUN npm install -g tsx

# Expose the API server port (Coolify default or specified via $PORT)
EXPOSE 3000

# Add standard Coolify healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the full-stack server
CMD ["npm", "run", "start"]
