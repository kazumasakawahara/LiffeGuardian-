// LifeGuardian サンプルデータ投入スクリプト
// テスト用のサンプルデータを作成

// 既存のサンプルデータをクリーンアップ（オプション）
// MATCH (n) WHERE n.isSampleData = true DETACH DELETE n;

// サンプル：本人の作成
CREATE (person:Person {
    id: randomUUID(),
    name: '山田太郎',
    birthDate: date('1950-05-15'),
    profileImageUrl: '/images/profile/yamada.jpg',
    currentHealthStatus: '安定',
    communicationAbility: 'レベル3：日常会話可能',
    createdAt: datetime(),
    updatedAt: datetime(),
    isSampleData: true
});

// サンプル：家族支援者の作成
MATCH (p:Person {name: '山田太郎'})
CREATE (s:Supporter {
    id: randomUUID(),
    name: '山田花子',
    role: '家族（娘）',
    email: 'hanako@example.com',
    phone: '090-1234-5678',
    organization: '',
    accessLevel: 5,
    verificationStatus: '確認済み',
    verifiedAt: datetime(),
    createdAt: datetime(),
    isSampleData: true
})
CREATE (p)-[:HAS_SUPPORTER {
    startDate: date('2024-01-01'),
    isPrimary: true
}]->(s);

// サンプル：医療支援者の作成
MATCH (p:Person {name: '山田太郎'})
CREATE (s:Supporter {
    id: randomUUID(),
    name: '佐藤医師',
    role: '主治医',
    email: 'sato.dr@hospital.com',
    phone: '03-1234-5678',
    organization: '東京総合病院',
    accessLevel: 4,
    verificationStatus: '確認済み',
    verifiedAt: datetime(),
    createdAt: datetime(),
    isSampleData: true
})
CREATE (p)-[:HAS_SUPPORTER {
    startDate: date('2023-06-01'),
    isPrimary: false
}]->(s);

// サンプル：ケアマネージャーの作成
MATCH (p:Person {name: '山田太郎'})
CREATE (s:Supporter {
    id: randomUUID(),
    name: '鈴木ケアマネージャー',
    role: 'ケアマネージャー',
    email: 'suzuki.cm@care-center.com',
    phone: '03-5678-1234',
    organization: '地域ケアセンター',
    accessLevel: 3,
    verificationStatus: '確認済み',
    verifiedAt: datetime(),
    createdAt: datetime(),
    isSampleData: true
})
CREATE (p)-[:HAS_SUPPORTER {
    startDate: date('2024-03-01'),
    isPrimary: false
}]->(s);

// サンプル：人生の出来事（複数）の作成
MATCH (p:Person {name: '山田太郎'})
MATCH (s:Supporter {name: '山田花子'})
WITH p, s
UNWIND [
    {title: '孫の誕生', description: '初孫が生まれました。とても嬉しい出来事でした。', eventDate: date('2020-03-15'), eventType: '家族', emotionalValue: 10},
    {title: '定年退職', description: '40年間勤めた会社を定年退職しました。', eventDate: date('2015-05-31'), eventType: '仕事', emotionalValue: 8},
    {title: '金婚式', description: '妻と結婚50周年を迎えました。', eventDate: date('2019-10-20'), eventType: '家族', emotionalValue: 9},
    {title: '趣味の写真展で入賞', description: '地域の写真展で特別賞をいただきました。', eventDate: date('2021-11-15'), eventType: '趣味', emotionalValue: 7}
] AS event
CREATE (le:LifeEvent {
    id: randomUUID(),
    title: event.title,
    description: event.description,
    eventDate: event.eventDate,
    eventType: event.eventType,
    location: '東京都',
    photos: [],
    emotionalValue: event.emotionalValue,
    createdAt: datetime(),
    createdBy: s.id,
    isSampleData: true
})
CREATE (p)-[:EXPERIENCED {significance: event.emotionalValue}]->(le);

// サンプル：好みの記録（複数）
MATCH (p:Person {name: '山田太郎'})
MATCH (s:Supporter {name: '山田花子'})
WITH p, s
UNWIND [
    {category: '食事', item: '朝食', preference: 'パンよりもご飯が好き。特に白米と味噌汁の組み合わせ。', importance: 4},
    {category: '食事', item: '飲み物', preference: '熱いお茶が好き。コーヒーは苦手。', importance: 3},
    {category: '趣味', item: '音楽', preference: '演歌や昭和歌謡が好き。特に美空ひばり。', importance: 5},
    {category: '生活様式', item: '起床時間', preference: '朝は6時に起きるのが習慣。', importance: 4},
    {category: '医療', item: '薬の服用', preference: '錠剤は水で飲む。粉薬は苦手。', importance: 5}
] AS pref
CREATE (preference:Preference {
    id: randomUUID(),
    category: pref.category,
    item: pref.item,
    preference: pref.preference,
    importance: pref.importance,
    notes: '',
    validFrom: date('1970-01-01'),
    createdAt: datetime(),
    updatedAt: datetime(),
    isSampleData: true
})
CREATE (p)-[:HAS_PREFERENCE {
    confirmedDate: date('2024-01-15'),
    confirmedBy: s.id
}]->(preference);

// サンプル：意思決定の記録
MATCH (p:Person {name: '山田太郎'})
MATCH (s:Supporter {role: '主治医'})
WITH p, s
CREATE (d:Decision {
    id: randomUUID(),
    category: '医療',
    title: '延命治療に関する意思表示',
    description: '自然な最期を迎えたい。過度な延命治療は望まない。',
    decisionDate: date('2023-12-01'),
    context: '健康な状態で、家族と相談の上で決定',
    reasoning: '尊厳を保ちながら自然な形で最期を迎えたいという価値観に基づく',
    witnesses: [s.id],
    documentUrl: '/documents/advance_directive.pdf',
    isActive: true,
    createdAt: datetime(),
    createdBy: p.id,
    isSampleData: true
})
CREATE (p)-[:MADE_DECISION {decisionCapacity: '完全'}]->(d)
CREATE (d)-[:WITNESSED_BY {
    witnessDate: date('2023-12-01'),
    witnessRole: '医療専門家として'
}]->(s);

// サンプル：財産に関する意思決定
MATCH (p:Person {name: '山田太郎'})
MATCH (s:Supporter {name: '山田花子'})
CREATE (d:Decision {
    id: randomUUID(),
    category: '財産',
    title: '財産管理の委任',
    description: '認知症等で判断能力が低下した場合、娘に財産管理を委任する。',
    decisionDate: date('2024-01-20'),
    context: '将来に備えて、元気なうちに決定',
    reasoning: '信頼できる家族に任せることで安心して生活したい',
    witnesses: [s.id],
    documentUrl: '/documents/power_of_attorney.pdf',
    isActive: true,
    createdAt: datetime(),
    createdBy: p.id,
    isSampleData: true
})
CREATE (p)-[:MADE_DECISION {decisionCapacity: '完全'}]->(d);

// サンプル：緊急連絡先情報
MATCH (p:Person {name: '山田太郎'})
WITH p
UNWIND [
    {infoType: '連絡先', title: '緊急時の第一連絡先', content: '娘（山田花子）: 090-1234-5678', priority: 1},
    {infoType: '医療', title: 'かかりつけ医', content: '東京総合病院 佐藤医師: 03-1234-5678', priority: 2},
    {infoType: '医療', title: '持病・アレルギー', content: '高血圧（薬服用中）、そばアレルギー', priority: 1},
    {infoType: 'その他', title: '常備薬', content: '血圧降下剤（朝1錠）、胃薬（食後）', priority: 2}
] AS info
CREATE (e:EmergencyInfo {
    id: randomUUID(),
    infoType: info.infoType,
    title: info.title,
    content: info.content,
    priority: info.priority,
    lastUpdated: datetime(),
    isSampleData: true
})
CREATE (p)-[:HAS_EMERGENCY_INFO]->(e);

// サンプル：文書の登録
MATCH (p:Person {name: '山田太郎'})
MATCH (s:Supporter {name: '山田花子'})
WITH p, s
UNWIND [
    {title: '事前指示書', documentType: '医療指示書', description: '延命治療に関する意思表示文書'},
    {title: '財産管理委任契約書', documentType: '委任状', description: '財産管理に関する委任契約'},
    {title: '健康保険証コピー', documentType: '身分証明書', description: '健康保険証のコピー'}
] AS doc
CREATE (d:Document {
    id: randomUUID(),
    title: doc.title,
    documentType: doc.documentType,
    fileUrl: '/documents/' + replace(doc.title, ' ', '_') + '.pdf',
    description: doc.description,
    uploadedAt: datetime(),
    uploadedBy: s.id,
    tags: [doc.documentType],
    isSampleData: true
})
CREATE (p)-[:OWNS_DOCUMENT {accessPermission: 3}]->(d);

// サンプルデータ作成完了メッセージ
RETURN "サンプルデータの作成が完了しました" as message;