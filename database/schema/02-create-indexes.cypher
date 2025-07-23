// LifeGuardian Neo4j インデックス作成スクリプト
// 検索パフォーマンスを向上させるためのインデックス

// 日付でのイベント検索用
CREATE INDEX lifeevent_date IF NOT EXISTS
FOR (le:LifeEvent) ON (le.eventDate);

// イベントタイプでの検索用
CREATE INDEX lifeevent_type IF NOT EXISTS
FOR (le:LifeEvent) ON (le.eventType);

// カテゴリーでの意思決定検索用
CREATE INDEX decision_category IF NOT EXISTS
FOR (d:Decision) ON (d.category);

// アクティブな意思決定の検索用
CREATE INDEX decision_active IF NOT EXISTS
FOR (d:Decision) ON (d.isActive);

// 好みのカテゴリー検索用
CREATE INDEX preference_category IF NOT EXISTS
FOR (p:Preference) ON (p.category);

// 文書タイプでの検索用
CREATE INDEX document_type IF NOT EXISTS
FOR (d:Document) ON (d.documentType);

// 緊急情報の優先度検索用
CREATE INDEX emergency_priority IF NOT EXISTS
FOR (e:EmergencyInfo) ON (e.priority);

// AI対話のタイムスタンプ検索用
CREATE INDEX ai_timestamp IF NOT EXISTS
FOR (ai:AIInteraction) ON (ai.timestamp);

// 支援者の役割検索用
CREATE INDEX supporter_role IF NOT EXISTS
FOR (s:Supporter) ON (s.role);

// 支援者のアクセスレベル検索用
CREATE INDEX supporter_access IF NOT EXISTS
FOR (s:Supporter) ON (s.accessLevel);