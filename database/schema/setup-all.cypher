// LifeGuardian Neo4j 完全セットアップスクリプト
// このスクリプトを実行すると、制約、インデックス、サンプルデータがすべて作成されます

// 1. 制約の作成
:source /import/schema/01-create-constraints.cypher

// 2. インデックスの作成
:source /import/schema/02-create-indexes.cypher

// 3. サンプルデータの投入（オプション）
:source /import/schema/03-sample-data.cypher

// セットアップ完了の確認
MATCH (n)
RETURN labels(n) as NodeType, count(n) as Count
ORDER BY Count DESC;