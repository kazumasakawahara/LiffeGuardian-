const { v4: uuidv4 } = require('uuid');
import { neo4jDriver } from '../config/database';
import { Person } from '../types';

export class PersonService {
  // 全員取得
  async findAll(): Promise<Person[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (p:Person) RETURN p ORDER BY p.name'
      );
      return result.records.map(record => record.get('p').properties);
    } finally {
      await session.close();
    }
  }

  // ID指定で取得
  async findById(id: string): Promise<Person | null> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (p:Person {id: $id}) RETURN p',
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
  async create(personData: Omit<Person, 'id' | 'createdAt' | 'updatedAt'>): Promise<Person> {
    const session = neo4jDriver.session();
    try {
      const id = uuidv4();
      const createdAt = new Date().toISOString();
      
      const result = await session.run(
        `CREATE (p:Person {
          id: $id,
          name: $name,
          birthDate: $birthDate,
          profileImageUrl: $profileImageUrl,
          medicalHistory: $medicalHistory,
          currentHealthStatus: $currentHealthStatus,
          livingEnvironment: $livingEnvironment,
          familyStructure: $familyStructure,
          communicationAbility: $communicationAbility,
          cognitiveStatus: $cognitiveStatus,
          createdAt: $createdAt,
          updatedAt: $createdAt
        }) RETURN p`,
        {
          id,
          ...personData,
          createdAt
        }
      );
      
      return result.records[0].get('p').properties;
    } finally {
      await session.close();
    }
  }

  // 更新
  async update(id: string, updateData: Partial<Person>): Promise<Person | null> {
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
        `MATCH (p:Person {id: $id})
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
        'MATCH (p:Person {id: $id}) DELETE p RETURN p',
        { id }
      );
      
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  // 関連する支援者を取得
  async getSupporters(personId: string): Promise<any[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (p:Person {id: $personId})-[:HAS_SUPPORTER]->(s:Supporter)
         RETURN s ORDER BY s.name`,
        { personId }
      );
      
      return result.records.map(record => record.get('s').properties);
    } finally {
      await session.close();
    }
  }
}

export default new PersonService();
