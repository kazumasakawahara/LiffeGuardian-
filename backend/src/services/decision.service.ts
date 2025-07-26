const { v4: uuidv4 } = require('uuid');
import { neo4jDriver } from '../config/database';
import { Decision } from '../types';

export class DecisionService {
  // 全決定事項取得
  async findAll(): Promise<Decision[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (d:Decision) RETURN d ORDER BY d.decisionDate DESC'
      );
      return result.records.map(record => record.get('d').properties);
    } finally {
      await session.close();
    }
  }

  // ID指定で取得
  async findById(id: string): Promise<Decision | null> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (d:Decision {id: $id}) RETURN d',
        { id }
      );
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('d').properties;
    } finally {
      await session.close();
    }
  }

  // 新規作成
  async create(decisionData: Omit<Decision, 'id' | 'createdAt'>): Promise<Decision> {
    const session = neo4jDriver.session();
    try {
      const id = uuidv4();
      const createdAt = new Date().toISOString();
      
      const result = await session.run(
        `CREATE (d:Decision {
          id: $id,
          category: $category,
          title: $title,
          description: $description,
          decisionDate: $decisionDate,
          context: $context,
          reasoning: $reasoning,
          witnesses: $witnesses,
          documentUrl: $documentUrl,
          isActive: $isActive,
          createdAt: $createdAt,
          createdBy: $createdBy
        }) RETURN d`,
        {
          id,
          ...decisionData,
          witnesses: decisionData.witnesses || [],
          isActive: decisionData.isActive ?? true,
          createdAt
        }
      );
      
      return result.records[0].get('d').properties;
    } finally {
      await session.close();
    }
  }

  // 更新
  async update(id: string, updateData: Partial<Decision>): Promise<Decision | null> {
    const session = neo4jDriver.session();
    try {
      // 動的にSET句を構築
      const setClause = Object.keys(updateData)
        .filter(key => key !== 'id' && key !== 'createdAt')
        .map(key => `d.${key} = $${key}`)
        .join(', ');
      
      if (!setClause) {
        throw new Error('No valid fields to update');
      }
      
      const result = await session.run(
        `MATCH (d:Decision {id: $id})
         SET ${setClause}
         RETURN d`,
        {
          id,
          ...updateData
        }
      );
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('d').properties;
    } finally {
      await session.close();
    }
  }

  // 削除
  async delete(id: string): Promise<boolean> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (d:Decision {id: $id}) DELETE d RETURN d',
        { id }
      );
      
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  // 決定を本人に関連付け
  async assignToPerson(decisionId: string, personId: string, decisionCapacity?: string): Promise<boolean> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (p:Person {id: $personId}), (d:Decision {id: $decisionId})
         CREATE (p)-[r:MADE_DECISION {
           decisionCapacity: $decisionCapacity
         }]->(d)
         RETURN r`,
        {
          personId,
          decisionId,
          decisionCapacity: decisionCapacity || 'full'
        }
      );
      
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  // 特定の本人の決定事項を取得
  async findByPersonId(personId: string): Promise<any[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (p:Person {id: $personId})-[r:MADE_DECISION]->(d:Decision)
         RETURN d, r ORDER BY d.decisionDate DESC`,
        { personId }
      );
      
      return result.records.map(record => ({
        ...record.get('d').properties,
        relationship: record.get('r').properties
      }));
    } finally {
      await session.close();
    }
  }

  // カテゴリー別で決定事項を取得
  async findByCategory(category: string): Promise<Decision[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (d:Decision {category: $category})
         RETURN d ORDER BY d.decisionDate DESC`,
        { category }
      );
      
      return result.records.map(record => record.get('d').properties);
    } finally {
      await session.close();
    }
  }

  // アクティブな決定事項のみ取得
  async findActive(): Promise<Decision[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (d:Decision {isActive: true})
         RETURN d ORDER BY d.decisionDate DESC`
      );
      
      return result.records.map(record => record.get('d').properties);
    } finally {
      await session.close();
    }
  }

  // 立会人を追加
  async addWitness(decisionId: string, supporterId: string, witnessRole: string): Promise<boolean> {
    const session = neo4jDriver.session();
    try {
      const witnessDate = new Date().toISOString();
      
      const result = await session.run(
        `MATCH (d:Decision {id: $decisionId}), (s:Supporter {id: $supporterId})
         CREATE (d)-[r:WITNESSED_BY {
           witnessDate: $witnessDate,
           witnessRole: $witnessRole
         }]->(s)
         RETURN r`,
        {
          decisionId,
          supporterId,
          witnessDate,
          witnessRole
        }
      );
      
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  // 決定事項の立会人を取得
  async getWitnesses(decisionId: string): Promise<any[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (d:Decision {id: $decisionId})-[r:WITNESSED_BY]->(s:Supporter)
         RETURN s, r ORDER BY r.witnessDate`,
        { decisionId }
      );
      
      return result.records.map(record => ({
        ...record.get('s').properties,
        witnessInfo: record.get('r').properties
      }));
    } finally {
      await session.close();
    }
  }
}

export default new DecisionService();
