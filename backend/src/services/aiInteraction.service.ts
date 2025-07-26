const { v4: uuidv4 } = require('uuid');
import { neo4jDriver } from '../config/database';
import { AIInteraction } from '../types';

export class AIInteractionService {
  // 全AI対話記録取得
  async findAll(): Promise<AIInteraction[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (ai:AIInteraction) RETURN ai ORDER BY ai.timestamp DESC'
      );
      return result.records.map(record => record.get('ai').properties);
    } finally {
      await session.close();
    }
  }

  // ID指定で取得
  async findById(id: string): Promise<AIInteraction | null> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (ai:AIInteraction {id: $id}) RETURN ai',
        { id }
      );
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('ai').properties;
    } finally {
      await session.close();
    }
  }

  // 新規作成
  async create(interactionData: Omit<AIInteraction, 'id' | 'timestamp'>): Promise<AIInteraction> {
    const session = neo4jDriver.session();
    try {
      const id = uuidv4();
      const timestamp = new Date().toISOString();
      
      const result = await session.run(
        `CREATE (ai:AIInteraction {
          id: $id,
          sessionId: $sessionId,
          query: $query,
          response: $response,
          confidence: $confidence,
          usedData: $usedData,
          timestamp: $timestamp,
          requestedBy: $requestedBy
        }) RETURN ai`,
        {
          id,
          ...interactionData,
          usedData: interactionData.usedData || [],
          timestamp
        }
      );
      
      return result.records[0].get('ai').properties;
    } finally {
      await session.close();
    }
  }

  // 更新（主に信頼度やレスポンスの修正用）
  async update(id: string, updateData: Partial<AIInteraction>): Promise<AIInteraction | null> {
    const session = neo4jDriver.session();
    try {
      // 動的にSET句を構築
      const setClause = Object.keys(updateData)
        .filter(key => key !== 'id' && key !== 'timestamp')
        .map(key => `ai.${key} = $${key}`)
        .join(', ');
      
      if (!setClause) {
        throw new Error('No valid fields to update');
      }
      
      const result = await session.run(
        `MATCH (ai:AIInteraction {id: $id})
         SET ${setClause}
         RETURN ai`,
        {
          id,
          ...updateData
        }
      );
      
      if (result.records.length === 0) {
        return null;
      }
      
      return result.records[0].get('ai').properties;
    } finally {
      await session.close();
    }
  }

  // 削除
  async delete(id: string): Promise<boolean> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (ai:AIInteraction {id: $id}) DELETE ai RETURN ai',
        { id }
      );
      
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  // セッションID別で対話記録を取得
  async findBySessionId(sessionId: string): Promise<AIInteraction[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (ai:AIInteraction {sessionId: $sessionId})
         RETURN ai ORDER BY ai.timestamp ASC`,
        { sessionId }
      );
      
      return result.records.map(record => record.get('ai').properties);
    } finally {
      await session.close();
    }
  }

  // 要求者別で対話記録を取得
  async findByRequestedBy(requestedBy: string): Promise<AIInteraction[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (ai:AIInteraction {requestedBy: $requestedBy})
         RETURN ai ORDER BY ai.timestamp DESC`,
        { requestedBy }
      );
      
      return result.records.map(record => record.get('ai').properties);
    } finally {
      await session.close();
    }
  }

  // 期間指定で対話記録を取得
  async findByDateRange(startDate: string, endDate: string): Promise<AIInteraction[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (ai:AIInteraction)
         WHERE ai.timestamp >= $startDate AND ai.timestamp <= $endDate
         RETURN ai ORDER BY ai.timestamp DESC`,
        { startDate, endDate }
      );
      
      return result.records.map(record => record.get('ai').properties);
    } finally {
      await session.close();
    }
  }

  // 高信頼度の対話記録を取得
  async findHighConfidence(minConfidence: number = 0.8): Promise<AIInteraction[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (ai:AIInteraction)
         WHERE ai.confidence >= $minConfidence
         RETURN ai ORDER BY ai.confidence DESC, ai.timestamp DESC`,
        { minConfidence }
      );
      
      return result.records.map(record => record.get('ai').properties);
    } finally {
      await session.close();
    }
  }

  // AI対話を根拠データに関連付け
  async linkToEvidence(interactionId: string, evidenceId: string, evidenceType: string, relevanceScore: number): Promise<boolean> {
    const session = neo4jDriver.session();
    try {
      let query = '';
      
      // evidenceTypeに応じて適切なノードラベルを選択
      switch(evidenceType) {
        case 'LifeEvent':
          query = `MATCH (ai:AIInteraction {id: $interactionId}), (e:LifeEvent {id: $evidenceId})
                   CREATE (ai)-[r:BASED_ON {relevanceScore: $relevanceScore}]->(e)
                   RETURN r`;
          break;
        case 'Decision':
          query = `MATCH (ai:AIInteraction {id: $interactionId}), (d:Decision {id: $evidenceId})
                   CREATE (ai)-[r:BASED_ON {relevanceScore: $relevanceScore}]->(d)
                   RETURN r`;
          break;
        case 'Preference':
          query = `MATCH (ai:AIInteraction {id: $interactionId}), (p:Preference {id: $evidenceId})
                   CREATE (ai)-[r:BASED_ON {relevanceScore: $relevanceScore}]->(p)
                   RETURN r`;
          break;
        default:
          throw new Error(`Invalid evidence type: ${evidenceType}`);
      }
      
      const result = await session.run(query, {
        interactionId,
        evidenceId,
        relevanceScore
      });
      
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }

  // AI対話の根拠データを取得
  async getEvidence(interactionId: string): Promise<any[]> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (ai:AIInteraction {id: $interactionId})-[r:BASED_ON]->(evidence)
         RETURN evidence, labels(evidence)[0] as type, r.relevanceScore as relevanceScore
         ORDER BY r.relevanceScore DESC`,
        { interactionId }
      );
      
      return result.records.map(record => ({
        evidence: record.get('evidence').properties,
        type: record.get('type'),
        relevanceScore: record.get('relevanceScore')
      }));
    } finally {
      await session.close();
    }
  }

  // セッションの統計情報を取得
  async getSessionStats(sessionId: string): Promise<any> {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(
        `MATCH (ai:AIInteraction {sessionId: $sessionId})
         RETURN 
           count(ai) as totalInteractions,
           avg(ai.confidence) as avgConfidence,
           min(ai.timestamp) as sessionStart,
           max(ai.timestamp) as sessionEnd`,
        { sessionId }
      );
      
      if (result.records.length === 0) {
        return null;
      }
      
      const record = result.records[0];
      return {
        totalInteractions: record.get('totalInteractions').toNumber(),
        avgConfidence: record.get('avgConfidence'),
        sessionStart: record.get('sessionStart'),
        sessionEnd: record.get('sessionEnd')
      };
    } finally {
      await session.close();
    }
  }
}

export default new AIInteractionService();
