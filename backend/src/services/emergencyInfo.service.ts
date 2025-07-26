const { v4: uuidv4 } = require('uuid');
import { neo4jDriver } from '../config/database';
import { EmergencyInfo } from '../types';

export class EmergencyInfoService {
  // 全緊急情報取得
  async findAll(): Promise<EmergencyInfo[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (e:EmergencyInfo) RETURN e ORDER BY e.priority ASC, e.lastUpdated DESC'
      );
      return result.records.map(record => record.get('e').properties);
    } finally {
      await session.close();
    }
  }

  // ID指定で取得
  async findById(id: string): Promise<EmergencyInfo | null> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (e:EmergencyInfo {id: $id}) RETURN e',
        { id }
      );
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('e').properties;
    } finally {
      await session.close();
    }
  }

  // 新規作成
  async create(infoData: Omit<EmergencyInfo, 'id' | 'lastUpdated'>): Promise<EmergencyInfo> {
    const session = neo4jDriver.session();
    try {
      const id = uuidv4();
      const lastUpdated = new Date().toISOString();
      
      const result = await session.run(
        `CREATE (e:EmergencyInfo {
          id: $id,
          infoType: $infoType,
          title: $title,
          content: $content,
          priority: $priority,
          lastUpdated: $lastUpdated
        }) RETURN e`,
        {
          id,
          ...infoData,
          lastUpdated
        }
      );
      
      return result.records[0].get('e').properties;
    } finally {
      await session.close();
    }
  }

  // 更新
  async update(id: string, updateData: Partial<EmergencyInfo>): Promise<EmergencyInfo | null> {
    const session = neo4jDriver.session();
    try {
      const lastUpdated = new Date().toISOString();
      
      // 動的にSET句を構築
      const setClause = Object.keys(updateData)
        .filter(key => key !== 'id')
        .map(key => `e.${key} = $${key}`)
        .join(', ');
      
      if (!setClause) {
        throw new Error('No valid fields to update');
      }
      
      const result = await session.run(
        `MATCH (e:EmergencyInfo {id: $id})
         SET ${setClause}, e.lastUpdated = $lastUpdated
         RETURN e`,
        {
          id,
          ...updateData,
          lastUpdated
        }
      );
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('e').properties;
    } finally {
      await session.close();
    }
  }

  // 削除
  async delete(id: string): Promise<boolean> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (e:EmergencyInfo {id: $id}) DELETE e RETURN e',
        { id }
      );
      
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  // 緊急情報を本人に関連付け
  async assignToPerson(infoId: string, personId: string): Promise<boolean> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (p:Person {id: $personId}), (e:EmergencyInfo {id: $infoId})
         CREATE (p)-[r:HAS_EMERGENCY_INFO]->(e)
         RETURN r`,
        {
          personId,
          infoId
        }
      );
      
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  // 特定の本人の緊急情報を取得
  async findByPersonId(personId: string): Promise<EmergencyInfo[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (p:Person {id: $personId})-[:HAS_EMERGENCY_INFO]->(e:EmergencyInfo)
         RETURN e ORDER BY e.priority ASC, e.lastUpdated DESC`,
        { personId }
      );
      
      return result.records.map(record => record.get('e').properties);
    } finally {
      await session.close();
    }
  }

  // タイプ別で緊急情報を取得
  async findByType(infoType: string): Promise<EmergencyInfo[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (e:EmergencyInfo {infoType: $infoType})
         RETURN e ORDER BY e.priority ASC, e.lastUpdated DESC`,
        { infoType }
      );
      
      return result.records.map(record => record.get('e').properties);
    } finally {
      await session.close();
    }
  }

  // 優先度別で緊急情報を取得
  async findByPriority(priority: number): Promise<EmergencyInfo[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (e:EmergencyInfo {priority: $priority})
         RETURN e ORDER BY e.lastUpdated DESC`,
        { priority }
      );
      
      return result.records.map(record => record.get('e').properties);
    } finally {
      await session.close();
    }
  }

  // 高優先度の緊急情報を取得（優先度1と2）
  async findHighPriority(): Promise<EmergencyInfo[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (e:EmergencyInfo)
         WHERE e.priority <= 2
         RETURN e ORDER BY e.priority ASC, e.lastUpdated DESC`
      );
      
      return result.records.map(record => record.get('e').properties);
    } finally {
      await session.close();
    }
  }

  // 特定の本人の緊急連絡先を取得（高速アクセス用）
  async getEmergencyContacts(personId: string): Promise<EmergencyInfo[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (p:Person {id: $personId})-[:HAS_EMERGENCY_INFO]->(e:EmergencyInfo)
         WHERE e.infoType = '連絡先'
         RETURN e ORDER BY e.priority ASC`,
        { personId }
      );
      
      return result.records.map(record => record.get('e').properties);
    } finally {
      await session.close();
    }
  }
}

export default new EmergencyInfoService();
