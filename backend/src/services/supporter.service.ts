const { v4: uuidv4 } = require('uuid');
import { neo4jDriver } from '../config/database';
import { Supporter } from '../types';

export class SupporterService {
  // 全支援者取得
  async findAll(): Promise<Supporter[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (s:Supporter) RETURN s ORDER BY s.name'
      );
      return result.records.map(record => record.get('s').properties);
    } finally {
      await session.close();
    }
  }

  // ID指定で取得
  async findById(id: string): Promise<Supporter | null> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (s:Supporter {id: $id}) RETURN s',
        { id }
      );
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('s').properties;
    } finally {
      await session.close();
    }
  }

  // 新規作成
  async create(supporterData: Omit<Supporter, 'id' | 'createdAt' | 'verificationStatus' | 'verifiedAt'>): Promise<Supporter> {
    const session = neo4jDriver.session();
    try {
      const id = uuidv4();
      const createdAt = new Date().toISOString();
      
      const result = await session.run(
        `CREATE (s:Supporter {
          id: $id,
          name: $name,
          role: $role,
          email: $email,
          phone: $phone,
          organization: $organization,
          accessLevel: $accessLevel,
          verificationStatus: $verificationStatus,
          createdAt: $createdAt
        }) RETURN s`,
        {
          id,
          ...supporterData,
          verificationStatus: 'unverified',
          createdAt
        }
      );
      
      return result.records[0].get('s').properties;
    } finally {
      await session.close();
    }
  }

  // 更新
  async update(id: string, updateData: Partial<Supporter>): Promise<Supporter | null> {
    const session = neo4jDriver.session();
    try {
      // 動的にSET句を構築
      const setClause = Object.keys(updateData)
        .filter(key => key !== 'id' && key !== 'createdAt')
        .map(key => `s.${key} = $${key}`)
        .join(', ');
      
      if (!setClause) {
        throw new Error('No valid fields to update');
      }
      
      const result = await session.run(
        `MATCH (s:Supporter {id: $id})
         SET ${setClause}
         RETURN s`,
        {
          id,
          ...updateData
        }
      );
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('s').properties;
    } finally {
      await session.close();
    }
  }

  // 削除
  async delete(id: string): Promise<boolean> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (s:Supporter {id: $id}) DELETE s RETURN s',
        { id }
      );
      
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  // 支援者を本人に関連付け
  async assignToPerson(supporterId: string, personId: string, isPrimary: boolean = false): Promise<boolean> {
    const session = neo4jDriver.session();
    try {
      const startDate = new Date().toISOString();
      
      const result = await session.run(
        `MATCH (p:Person {id: $personId}), (s:Supporter {id: $supporterId})
         CREATE (p)-[r:HAS_SUPPORTER {
           startDate: $startDate,
           isPrimary: $isPrimary
         }]->(s)
         RETURN r`,
        {
          personId,
          supporterId,
          startDate,
          isPrimary
        }
      );
      
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  // 本人から支援者の関連を削除
  async removeFromPerson(supporterId: string, personId: string): Promise<boolean> {
    const session = neo4jDriver.session();
    try {
      const endDate = new Date().toISOString();
      
      // 関連を削除せずに終了日を設定
      const result = await session.run(
        `MATCH (p:Person {id: $personId})-[r:HAS_SUPPORTER]->(s:Supporter {id: $supporterId})
         SET r.endDate = $endDate
         RETURN r`,
        {
          personId,
          supporterId,
          endDate
        }
      );
      
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  // 特定の本人の支援者を取得
  async findByPersonId(personId: string): Promise<any[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (p:Person {id: $personId})-[r:HAS_SUPPORTER]->(s:Supporter)
         WHERE r.endDate IS NULL
         RETURN s, r ORDER BY s.name`,
        { personId }
      );
      
      return result.records.map(record => ({
        ...record.get('s').properties,
        relationship: record.get('r').properties
      }));
    } finally {
      await session.close();
    }
  }

  // 支援者の検証ステータスを更新
  async verify(id: string): Promise<Supporter | null> {
    const session = neo4jDriver.session();
    try {
      const verifiedAt = new Date().toISOString();
      
      const result = await session.run(
        `MATCH (s:Supporter {id: $id})
         SET s.verificationStatus = 'verified', s.verifiedAt = $verifiedAt
         RETURN s`,
        {
          id,
          verifiedAt
        }
      );
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('s').properties;
    } finally {
      await session.close();
    }
  }
}

export default new SupporterService();
