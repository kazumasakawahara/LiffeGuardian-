# LifeGuardianⅡ Makefile
# 開発・運用を効率化するためのコマンド集

.PHONY: help
help: ## ヘルプを表示
	@echo "LifeGuardianⅡ Docker環境管理コマンド"
	@echo ""
	@echo "使用方法: make [コマンド]"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: init
init: ## 初期セットアップ（初回のみ実行）
	@echo "🚀 LifeGuardianⅡ環境を初期化中..."
	@cp -n .env.example .env || true
	@echo "✅ 初期化完了！"

.PHONY: setup
setup: init build ## 完全セットアップ（初期化＋ビルド）
	@echo "🎉 セットアップ完了！"

.PHONY: build
build: ## 全サービスをビルド
	docker-compose build

.PHONY: up
up: ## 全サービスを起動
	docker-compose up -d
	@echo "🌟 LifeGuardianⅡ起動完了！"
	@echo ""
	@echo "アクセスURL:"
	@echo "  - フロントエンド: http://localhost:3000"
	@echo "  - バックエンドAPI: http://localhost:3001"
	@echo "  - Neo4j Browser: http://localhost:7474"
	@echo "  - n8n: http://localhost:5678"
	@echo "  - Adminer: http://localhost:8080"
	@echo "  - MailHog: http://localhost:8025"
	@echo "  - Portainer: http://localhost:9000"

.PHONY: down
down: ## 全サービスを停止
	docker-compose down

.PHONY: restart
restart: down up ## 全サービスを再起動

.PHONY: clean
clean: ## コンテナとボリュームを削除（注意：データも削除されます）
	docker-compose down -v

.PHONY: logs
logs: ## 全サービスのログを表示
	docker-compose logs -f

.PHONY: logs-backend
logs-backend: ## バックエンドのログを表示
	docker-compose logs -f backend

.PHONY: logs-frontend
logs-frontend: ## フロントエンドのログを表示
	docker-compose logs -f frontend

.PHONY: logs-neo4j
logs-neo4j: ## Neo4jのログを表示
	docker-compose logs -f neo4j

.PHONY: db-init
db-init: ## データベースを初期化
	@echo "📊 データベースを初期化中..."
	docker-compose exec neo4j cypher-shell -u neo4j -p $${NEO4J_PASSWORD:-lifeguardian2024} < database/schema/setup-all.cypher
	@echo "✅ データベース初期化完了！"

.PHONY: db-seed
db-seed: ## サンプルデータを投入
	@echo "🌱 サンプルデータを投入中..."
	docker-compose exec neo4j cypher-shell -u neo4j -p $${NEO4J_PASSWORD:-lifeguardian2024} < database/schema/03-sample-data.cypher
	@echo "✅ サンプルデータ投入完了！"

.PHONY: shell-backend
shell-backend: ## バックエンドコンテナにシェルで接続
	docker-compose exec backend /bin/sh

.PHONY: cypher-shell
cypher-shell: ## Cypher Shellを起動
	docker-compose exec neo4j cypher-shell -u neo4j -p $${NEO4J_PASSWORD:-lifeguardian2024}

.PHONY: status
status: ## サービスの状態を確認
	@echo "🔍 サービス状態確認中..."
	@docker-compose ps
