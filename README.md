# LifeGuardianⅡ

意思決定支援システム - 認知症や意思疎通が困難な方々の尊厳を守り、その人らしい生活を支援するためのシステム

## 概要

LifeGuardianⅡは、認知症や意思疎通が困難な方々の過去の意思決定、好み、人生の歩みを記録・分析し、現在の意思決定を支援するシステムです。

## 主な機能

- **ライフストーリー記録**: 人生の重要な出来事や思い出を記録
- **意思決定支援**: 過去の決定パターンに基づくAI支援
- **支援者ネットワーク**: 家族、医療従事者、ケアマネージャーとの連携
- **緊急時対応**: 重要な医療情報への迅速なアクセス

## 技術スタック

- **フロントエンド**: React + TypeScript
- **バックエンド**: Node.js + Express
- **データベース**: Neo4j (グラフDB) + PostgreSQL
- **キャッシュ**: Redis
- **自動化**: n8n
- **コンテナ**: Docker + Docker Compose

## クイックスタート

1. 環境変数の設定
   ```bash
   cp .env.example .env
   ```

2. Dockerコンテナの起動
   ```bash
   make up
   ```

3. データベースの初期化
   ```bash
   make db-init
   make db-seed
   ```

## アクセスURL

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:3001
- Neo4j Browser: http://localhost:7474
- n8n: http://localhost:5678
- Adminer: http://localhost:8080

## 開発者向け情報

詳細な開発ガイドは `docs/` フォルダを参照してください。

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
