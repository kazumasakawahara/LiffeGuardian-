const { v4: uuidv4 } = require('uuid');
import { neo4jDriver } from '../config/database';
import { LifeEvent } from '../types';

export class LifeEventService {
  // 全イベント取得
  async findAll(): Promise<LifeEvent[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (e:LifeEvent) RETURN e ORDER BY e.eventDate DESC'
      );
      return result.records.map(record => record.get('e').properties);
    } finally {
      await session.close();
    }
  }

  // ID指定で取得
  async findById(id: string): Promise<LifeEvent | null> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (e:LifeEvent {id: $id}) RETURN e',
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
  async create(eventData: Omit<LifeEvent, 'id' | 'createdAt'>): Promise<LifeEvent> {
    const session = neo4jDriver.session();
    try {
      const id = uuidv4();
      const createdAt = new Date().toISOString();
      
      const result = await session.run(
        `CREATE (e:LifeEvent {
          id: $id,
          title: $title,
          description: $description,
          eventDate: $eventDate,
          eventType: $eventType,
          location: $location,
          photos: $photos,
          emotionalValue: $emotionalValue,
          createdAt: $createdAt,
          createdBy: $createdBy
        }) RETURN e`,
        {
          id,
          ...eventData,
          photos: eventData.photos || [],
          createdAt
        }
      );
      
      return result.records[0].get('e').properties;
    } finally {
      await session.close();
    }
  }

  // 更新
  async update(id: string, updateData: Partial<LifeEvent>): Promise<LifeEvent | null> {
    const session = neo4jDriver.session();
    try {
      // 動的にSET句を構築
      const setClause = Object.keys(updateData)
        .filter(key => key !== 'id' && key !== 'createdAt')
        .map(key => `e.${key} = $${key}`)
        .join(', ');
      
      if (!setClause) {
        throw new Error('No valid fields to update');
      }
      
      const result = await session.run(
        `MATCH (e:LifeEvent {id: $id})
         SET ${setClause}
         RETURN e`,
        {
          id,
          ...updateData
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
        'MATCH (e:LifeEvent {id: $id}) DELETE e RETURN e',
        { id }
      );
      
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  // イベントを本人に関連付け
  async assignToPerson(eventId: string, personId: string, significance: number = 5): Promise<boolean> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (p:Person {id: $personId}), (e:LifeEvent {id: $eventId})
         CREATE (p)-[r:EXPERIENCED {
           significance: $significance
         }]->(e)
         RETURN r`,
        {
          personId,
          eventId,
          significance
        }
      );
      
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  // 特定の本人のイベントを取得
  async findByPersonId(personId: string): Promise<any[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (p:Person {id: $personId})-[r:EXPERIENCED]->(e:LifeEvent)
         RETURN e, r ORDER BY e.eventDate DESC`,
        { personId }
      );
      
      return result.records.map(record => ({
        ...record.get('e').properties,
        relationship: record.get('r').properties
      }));
    } finally {
      await session.close();
    }
  }

  // 期間指定でイベントを取得
  async findByDateRange(startDate: string, endDate: string): Promise<LifeEvent[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (e:LifeEvent)
         WHERE e.eventDate >= $startDate AND e.eventDate <= $endDate
         RETURN e ORDER BY e.eventDate DESC`,
        { startDate, endDate }
      );
      
      return result.records.map(record => record.get('e').properties);
    } finally {
      await session.close();
    }
  }

  // タイプ別でイベントを取得
  async findByType(eventType: string): Promise<LifeEvent[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (e:LifeEvent {eventType: $eventType})
         RETURN e ORDER BY e.eventDate DESC`,
        { eventType }
      );
      
      return result.records.map(record => record.get('e').properties);
    } finally {
      await session.close();
    }
  }

  // イベント間の関連を作成
  async createRelation(fromEventId: string, toEventId: string, relationshipType: string): Promise<boolean> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (e1:LifeEvent {id: $fromEventId}), (e2:LifeEvent {id: $toEventId})
         CREATE (e1)-[r:RELATED_TO {
           relationshipType: $relationshipType
         }]->(e2)
         RETURN r`,
        {
          fromEventId,
          toEventId,
          relationshipType
        }
      );
      
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }
}

export default new LifeEventService();
