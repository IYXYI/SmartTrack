# Multi-stage Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production || npm install --production

# Copy backend and built frontend
COPY server.js ./
COPY data ./data
COPY --from=builder /app/frontend/dist ./dist

EXPOSE 8080
ENV NODE_ENV=production
CMD ["node", "server.js"]
