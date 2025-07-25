FROM node:18-alpine AS base
WORKDIR /app

# 開発環境
FROM base AS development
# package.jsonのみコピー（キャッシュ効率化）
COPY package.json ./
# 依存関係をインストール
RUN npm install
# ソースコードをコピー
COPY . .
# ポート公開
EXPOSE 3000
# 開発サーバー起動
CMD ["npm", "start"]

# ビルド環境
FROM base AS builder
COPY package.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# 本番環境
FROM nginx:alpine AS production
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
