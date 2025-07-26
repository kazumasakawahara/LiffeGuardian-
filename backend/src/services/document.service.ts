const { v4: uuidv4 } = require('uuid');
import { neo4jDriver } from '../config/database';
import { Document } from '../types';

export class DocumentService {
  // 全文書取得
  async findAll(): Promise<Document[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (d:Document) RETURN d ORDER BY d.uploadedAt DESC'
      );
      return result.records.map(record => record.get('d').properties);
    } finally {
      await session.close();
    }
  }

  // ID指定で取得
  async findById(id: string): Promise<Document | null> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (d:Document {id: $id}) RETURN d',
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
  async create(documentData: Omit<Document, 'id' | 'uploadedAt'>): Promise<Document> {
    const session = neo4jDriver.session();
    try {
      const id = uuidv4();
      const uploadedAt = new Date().toISOString();
      
      const result = await session.run(
        `CREATE (d:Document {
          id: $id,
          title: $title,
          documentType: $documentType,
          fileUrl: $fileUrl,
          description: $description,
          uploadedAt: $uploadedAt,
          uploadedBy: $uploadedBy,
          expirationDate: $expirationDate,
          tags: $tags
        }) RETURN d`,
        {
          id,
          ...documentData,
          tags: documentData.tags || [],
          uploadedAt
        }
      );
      
      return result.records[0].get('d').properties;
    } finally {
      await session.close();
    }
  }

  // 更新
  async update(id: string, updateData: Partial<Document>): Promise<Document | null> {
    const session = neo4jDriver.session();
    try {
      // 動的にSET句を構築
      const setClause = Object.keys(updateData)
        .filter(key => key !== 'id' && key !== 'uploadedAt')
        .map(key => `d.${key} = $${key}`)
        .join(', ');
      
      if (!setClause) {
        throw new Error('No valid fields to update');
      }
      
      const result = await session.run(
        `MATCH (d:Document {id: $id})
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
        'MATCH (d:Document {id: $id}) DELETE d RETURN d',
        { id }
      );
      
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  // 文書を本人に関連付け
  async assignToPerson(documentId: string, personId: string, accessPermission: number = 3): Promise<boolean> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (p:Person {id: $personId}), (d:Document {id: $documentId})
         CREATE (p)-[r:OWNS_DOCUMENT {
           accessPermission: $accessPermission
         }]->(d)
         RETURN r`,
        {
          personId,
          documentId,
          accessPermission
        }
      );
      
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  // 特定の本人の文書を取得
  async findByPersonId(personId: string): Promise<any[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (p:Person {id: $personId})-[r:OWNS_DOCUMENT]->(d:Document)
         RETURN d, r ORDER BY d.uploadedAt DESC`,
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

  // タイプ別で文書を取得
  async findByType(documentType: string): Promise<Document[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (d:Document {documentType: $documentType})
         RETURN d ORDER BY d.uploadedAt DESC`,
        { documentType }
      );
      
      return result.records.map(record => record.get('d').properties);
    } finally {
      await session.close();
    }
  }

  // タグで文書を検索
  async findByTag(tag: string): Promise<Document[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (d:Document)
         WHERE $tag IN d.tags
         RETURN d ORDER BY d.uploadedAt DESC`,
        { tag }
      );
      
      return result.records.map(record => record.get('d').properties);
    } finally {
      await session.close();
    }
  }

  // 期限切れの文書を取得
  async findExpired(): Promise<Document[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (d:Document)
         WHERE d.expirationDate IS NOT NULL AND d.expirationDate <= datetime()
         RETURN d ORDER BY d.expirationDate DESC`
      );
      
      return result.records.map(record => record.get('d').properties);
    } finally {
      await session.close();
    }
  }
}

export default new DocumentService();
