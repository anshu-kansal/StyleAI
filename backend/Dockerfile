# Stage 1: Build TypeScript source code
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src/ ./src/

RUN npm run build

# Stage 2: Production Runner environment
FROM node:18-alpine AS runner

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist

# Apply security best practice: run as non-root user
USER node

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
