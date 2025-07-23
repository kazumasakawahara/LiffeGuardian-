// LifeGuardian Neo4j 制約作成スクリプト
// 一意性制約とインデックスを作成

// Person（本人）の制約
CREATE CONSTRAINT person_id_unique IF NOT EXISTS
FOR (p:Person) REQUIRE p.id IS UNIQUE;

// Supporter（支援者）の制約
CREATE CONSTRAINT supporter_id_unique IF NOT EXISTS
FOR (s:Supporter) REQUIRE s.id IS UNIQUE;

CREATE CONSTRAINT supporter_email_unique IF NOT EXISTS
FOR (s:Supporter) REQUIRE s.email IS UNIQUE;

// LifeEvent（人生の出来事）の制約
CREATE CONSTRAINT lifeevent_id_unique IF NOT EXISTS
FOR (le:LifeEvent) REQUIRE le.id IS UNIQUE;

// Decision（意思決定）の制約
CREATE CONSTRAINT decision_id_unique IF NOT EXISTS
FOR (d:Decision) REQUIRE d.id IS UNIQUE;

// Preference（好み・価値観）の制約
CREATE CONSTRAINT preference_id_unique IF NOT EXISTS
FOR (p:Preference) REQUIRE p.id IS UNIQUE;

// Document（文書）の制約
CREATE CONSTRAINT document_id_unique IF NOT EXISTS
FOR (d:Document) REQUIRE d.id IS UNIQUE;

// EmergencyInfo（緊急時情報）の制約
CREATE CONSTRAINT emergency_id_unique IF NOT EXISTS
FOR (e:EmergencyInfo) REQUIRE e.id IS UNIQUE;

// AIInteraction（AI対話記録）の制約
CREATE CONSTRAINT ai_interaction_id_unique IF NOT EXISTS
FOR (ai:AIInteraction) REQUIRE ai.id IS UNIQUE;