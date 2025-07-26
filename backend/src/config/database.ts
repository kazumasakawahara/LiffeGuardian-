import neo4j, { Driver } from 'neo4j-driver';

// Docker環境では内部ポートを使用
const uri = process.env.NEO4J_URI || 'bolt://neo4j:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || '';

// NEO4J_AUTH=none の場合、認証なしで接続
export const neo4jDriver: Driver = neo4j.driver(
  uri,
  neo4j.auth.basic('', ''), // 認証無効化されているため空の認証情報
  {
    maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 2 * 60 * 1000, // 120 seconds
    disableLosslessIntegers: true,
    encrypted: 'ENCRYPTION_OFF' // 暗号化を明示的に無効化
  }
);

// 接続テスト
neo4jDriver.verifyConnectivity()
  .then(() => console.log('Connected to Neo4j'))
  .catch((error) => {
    console.error('Neo4j connection error:', error);
    console.error('Connection details:', {
      uri,
      authProvided: false,
      encrypted: 'ENCRYPTION_OFF'
    });
  });

export default neo4jDriver;
