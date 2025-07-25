import neo4j, { Driver } from 'neo4j-driver';

const uri = process.env.NEO4J_URI || 'bolt://neo4j:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || '';

export const neo4jDriver: Driver = neo4j.driver(
  uri,
  neo4j.auth.basic(user, password),
  {
    maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 2 * 60 * 1000, // 120 seconds
    disableLosslessIntegers: true
  }
);

// 接続テスト
neo4jDriver.verifyConnectivity()
  .then(() => console.log('Connected to Neo4j'))
  .catch((error) => console.error('Neo4j connection error:', error));

export default neo4jDriver;
