const { v4: uuidv4 } = require('uuid');
import { neo4jDriver } from '../config/database';
import { Preference } from '../types';

export class PreferenceService {
  // 全好み取得
  async findAll(): Promise<Preference[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (p:Preference) RETURN p ORDER BY p.category, p.item'
      );
      return result.records.map(record => record.get('p').properties);
    } finally {
      await session.close();
    }
  }

  // ID指定で取得
  async findById(id: string): Promise<Preference | null> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (p:Preference {id: $id}) RETURN p',
        { id }
      );
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('p').properties;
    } finally {
      await session.close();
    }
  }

  // 新規作成
  async create(preferenceData: Omit<Preference, 'id' | 'createdAt' | 'updatedAt'>): Promise<Preference> {
    const session = neo4jDriver.session();
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      const result = await session.run(
        `CREATE (p:Preference {
          id: $id,
          category: $category,
          item: $item,
          preference: $preference,
          importance: $importance,
          notes: $notes,
          validFrom: $validFrom,
          validUntil: $validUntil,
          createdAt: $createdAt,
          updatedAt: $updatedAt
        }) RETURN p`,
        {
          id,
          ...preferenceData,
          createdAt: now,
          updatedAt: now
        }
      );
      
      return result.records[0].get('p').properties;
    } finally {
      await session.close();
    }
  }

  // 更新
  async update(id: string, updateData: Partial<Preference>): Promise<Preference | null> {
    const session = neo4jDriver.session();
    try {
      const updatedAt = new Date().toISOString();
      
      // 動的にSET句を構築
      const setClause = Object.keys(updateData)
        .filter(key => key !== 'id' && key !== 'createdAt')
        .map(key => `p.${key} = $${key}`)
        .join(', ');
      
      if (!setClause) {
        throw new Error('No valid fields to update');
      }
      
      const result = await session.run(
        `MATCH (p:Preference {id: $id})
         SET ${setClause}, p.updatedAt = $updatedAt
         RETURN p`,
        {
          id,
          ...updateData,
          updatedAt
        }
      );
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('p').properties;
    } finally {
      await session.close();
    }
  }

  // 削除
  async delete(id: string): Promise<boolean> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (p:Preference {id: $id}) DELETE p RETURN p',
        { id }
      );
      
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  // 好みを本人に関連付け
  async assignToPerson(preferenceId: string, personId: string, confirmedBy: string): Promise<boolean> {
    const session = neo4jDriver.session();
    try {
      const confirmedDate = new Date().toISOString();
      
      const result = await session.run(
        `MATCH (person:Person {id: $personId}), (pref:Preference {id: $preferenceId})
         CREATE (person)-[r:HAS_PREFERENCE {
           confirmedDate: $confirmedDate,
           confirmedBy: $confirmedBy
         }]->(pref)
         RETURN r`,
        {
          personId,
          preferenceId,
          confirmedDate,
          confirmedBy
        }
      );
      
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  // 特定の本人の好みを取得
  async findByPersonId(personId: string): Promise<any[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (person:Person {id: $personId})-[r:HAS_PREFERENCE]->(p:Preference)
         WHERE p.validUntil IS NULL OR p.validUntil > datetime()
         RETURN p, r ORDER BY p.category, p.importance DESC`,
        { personId }
      );
      
      return result.records.map(record => ({
        ...record.get('p').properties,
        relationship: record.get('r').properties
      }));
    } finally {
      await session.close();
    }
  }

  // カテゴリー別で好みを取得
  async findByCategory(category: string): Promise<Preference[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (p:Preference {category: $category})
         WHERE p.validUntil IS NULL OR p.validUntil > datetime()
         RETURN p ORDER BY p.importance DESC, p.item`,
        { category }
      );
      
      return result.records.map(record => record.get('p').properties);
    } finally {
      await session.close();
    }
  }

  // 重要度別で好みを取得
  async findByImportance(minImportance: number): Promise<Preference[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (p:Preference)
         WHERE p.importance >= $minImportance AND (p.validUntil IS NULL OR p.validUntil > datetime())
         RETURN p ORDER BY p.importance DESC, p.category, p.item`,
        { minImportance }
      );
      
      return result.records.map(record => record.get('p').properties);
    } finally {
      await session.close();
    }
  }

  // 有効期限切れの好みを取得
  async findExpired(): Promise<Preference[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (p:Preference)
         WHERE p.validUntil IS NOT NULL AND p.validUntil <= datetime()
         RETURN p ORDER BY p.validUntil DESC`
      );
      
      return result.records.map(record => record.get('p').properties);
    } finally {
      await session.close();
    }
  }
}

export default new PreferenceService();
