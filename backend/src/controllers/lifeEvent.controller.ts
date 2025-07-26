import { Request, Response } from 'express';
import lifeEventService from '../services/lifeEvent.service';
import { ApiResponse, LifeEvent } from '../types';

export class LifeEventController {
  // 全イベント取得
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const events = await lifeEventService.findAll();
      const response: ApiResponse<LifeEvent[]> = {
        success: true,
        data: events
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // ID指定で取得
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const event = await lifeEventService.findById(id);
      
      if (!event) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Life event not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<LifeEvent> = {
        success: true,
        data: event
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // 新規作成
  async create(req: Request, res: Response): Promise<void> {
    try {
      const eventData = req.body;
      
      // 必須フィールドのバリデーション
      if (!eventData.title || !eventData.description || !eventData.eventDate || 
          !eventData.eventType || !eventData.createdBy) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Missing required fields: title, description, eventDate, eventType, and createdBy are required'
        };
        res.status(400).json(response);
        return;
      }

      // emotionalValueのバリデーション
      if (eventData.emotionalValue !== undefined && 
          (eventData.emotionalValue < 1 || eventData.emotionalValue > 10)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'emotionalValue must be between 1 and 10'
        };
        res.status(400).json(response);
        return;
      }

      // eventTypeのバリデーション
      const validEventTypes = ['誕生', '卒業', '結婚', '仕事', '趣味', '病気', 'その他'];
      if (!validEventTypes.includes(eventData.eventType)) {
        const response: ApiResponse<null> = {
          success: false,
          error: `eventType must be one of: ${validEventTypes.join(', ')}`
        };
        res.status(400).json(response);
        return;
      }
      
      const newEvent = await lifeEventService.create(eventData);
      const response: ApiResponse<LifeEvent> = {
        success: true,
        data: newEvent,
        message: 'Life event created successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // 更新
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // emotionalValueのバリデーション（更新時）
      if (updateData.emotionalValue !== undefined && 
          (updateData.emotionalValue < 1 || updateData.emotionalValue > 10)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'emotionalValue must be between 1 and 10'
        };
        res.status(400).json(response);
        return;
      }

      // eventTypeのバリデーション（更新時）
      const validEventTypes = ['誕生', '卒業', '結婚', '仕事', '趣味', '病気', 'その他'];
      if (updateData.eventType && !validEventTypes.includes(updateData.eventType)) {
        const response: ApiResponse<null> = {
          success: false,
          error: `eventType must be one of: ${validEventTypes.join(', ')}`
        };
        res.status(400).json(response);
        return;
      }
      
      const updatedEvent = await lifeEventService.update(id, updateData);
      
      if (!updatedEvent) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Life event not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<LifeEvent> = {
        success: true,
        data: updatedEvent,
        message: 'Life event updated successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // 削除
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await lifeEventService.delete(id);
      
      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Life event not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Life event deleted successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // イベントを本人に関連付け
  async assignToPerson(req: Request, res: Response): Promise<void> {
    try {
      const { eventId, personId } = req.params;
      const { significance } = req.body;
      
      // significanceのバリデーション
      if (significance !== undefined && (significance < 1 || significance > 10)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'significance must be between 1 and 10'
        };
        res.status(400).json(response);
        return;
      }
      
      const assigned = await lifeEventService.assignToPerson(eventId, personId, significance);
      
      if (!assigned) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Failed to assign life event to person'
        };
        res.status(400).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Life event assigned to person successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // 特定の本人のイベントを取得
  async getByPersonId(req: Request, res: Response): Promise<void> {
    try {
      const { personId } = req.params;
      const events = await lifeEventService.findByPersonId(personId);
      
      const response: ApiResponse<any[]> = {
        success: true,
        data: events
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // 期間指定でイベントを取得
  async getByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'startDate and endDate are required query parameters'
        };
        res.status(400).json(response);
        return;
      }
      
      const events = await lifeEventService.findByDateRange(
        startDate as string, 
        endDate as string
      );
      
      const response: ApiResponse<LifeEvent[]> = {
        success: true,
        data: events
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // タイプ別でイベントを取得
  async getByType(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      const events = await lifeEventService.findByType(type);
      
      const response: ApiResponse<LifeEvent[]> = {
        success: true,
        data: events
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // イベント間の関連を作成
  async createRelation(req: Request, res: Response): Promise<void> {
    try {
      const { fromEventId, toEventId } = req.params;
      const { relationshipType } = req.body;
      
      if (!relationshipType) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'relationshipType is required'
        };
        res.status(400).json(response);
        return;
      }
      
      const created = await lifeEventService.createRelation(fromEventId, toEventId, relationshipType);
      
      if (!created) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Failed to create relation between events'
        };
        res.status(400).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Relation created successfully'
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }
}

export default new LifeEventController();
