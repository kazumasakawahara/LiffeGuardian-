FROM node:18-alpine AS base
WORKDIR /app

# 開発環境
FROM base AS development
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# ビルド環境
FROM base AS builder
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# 本番環境
FROM base AS production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
