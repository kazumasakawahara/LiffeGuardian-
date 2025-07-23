# LifeGuardian Cypherクエリガイド

## 基本的なクエリパターン

### 1. 本人情報の取得

#### 本人の基本情報を取得
```cypher
MATCH (p:Person {id: $personId})
RETURN p
```

#### 本人とすべての支援者を取得
```cypher
MATCH (p:Person {id: $personId})
OPTIONAL MATCH (p)-[r:HAS_SUPPORTER]->(s:Supporter)
RETURN p, collect({
    supporter: s,
    relationship: r
}) as supporters
```

### 2. ライフイベントの操作

#### 期間を指定してライフイベントを取得
```cypher
MATCH (p:Person {id: $personId})-[:EXPERIENCED]->(le:LifeEvent)
WHERE le.eventDate >= date($startDate) 
  AND le.eventDate <= date($endDate)
RETURN le
ORDER BY le.eventDate DESC
```

#### 感情的価値の高いイベントTOP10
```cypher
MATCH (p:Person {id: $personId})-[r:EXPERIENCED]->(le:LifeEvent)
RETURN le
ORDER BY le.emotionalValue DESC, r.significance DESC
LIMIT 10
```

### 3. 意思決定の管理

#### カテゴリー別の意思決定を取得
```cypher
MATCH (p:Person {id: $personId})-[:MADE_DECISION]->(d:Decision)
WHERE d.category = $category AND d.isActive = true
RETURN d
ORDER BY d.decisionDate DESC
```

### 4. 好み・価値観の検索

#### カテゴリー別の好みを取得
```cypher
MATCH (p:Person {id: $personId})-[r:HAS_PREFERENCE]->(pref:Preference)
WHERE pref.category = $category
  AND (pref.validUntil IS NULL OR pref.validUntil >= date())
RETURN pref
ORDER BY pref.importance DESC
```

### 5. 緊急時情報の取得

#### 優先度順の緊急時情報
```cypher
MATCH (p:Person {id: $personId})-[:HAS_EMERGENCY_INFO]->(e:EmergencyInfo)
RETURN e
ORDER BY e.priority ASC
```
