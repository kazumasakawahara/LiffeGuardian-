import { Request, Response } from 'express';
import aiInteractionService from '../services/aiInteraction.service';
import { ApiResponse, AIInteraction } from '../types';

export class AIInteractionController {
  // 全AI対話記録取得
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const interactions = await aiInteractionService.findAll();
      const response: ApiResponse<AIInteraction[]> = {
        success: true,
        data: interactions
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
      const interaction = await aiInteractionService.findById(id);
      
      if (!interaction) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'AI interaction not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<AIInteraction> = {
        success: true,
        data: interaction
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
      const interactionData = req.body;
      
      // 必須フィールドのバリデーション
      if (!interactionData.sessionId || !interactionData.query || !interactionData.response || 
          interactionData.confidence === undefined || !interactionData.requestedBy) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Missing required fields: sessionId, query, response, confidence, and requestedBy are required'
        };
        res.status(400).json(response);
        return;
      }

      // confidenceのバリデーション
      if (interactionData.confidence < 0 || interactionData.confidence > 1) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'confidence must be between 0 and 1'
        };
        res.status(400).json(response);
        return;
      }
      
      const newInteraction = await aiInteractionService.create(interactionData);
      const response: ApiResponse<AIInteraction> = {
        success: true,
        data: newInteraction,
        message: 'AI interaction created successfully'
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
      
      // confidenceのバリデーション（更新時）
      if (updateData.confidence !== undefined && 
          (updateData.confidence < 0 || updateData.confidence > 1)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'confidence must be between 0 and 1'
        };
        res.status(400).json(response);
        return;
      }
      
      const updatedInteraction = await aiInteractionService.update(id, updateData);
      
      if (!updatedInteraction) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'AI interaction not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<AIInteraction> = {
        success: true,
        data: updatedInteraction,
        message: 'AI interaction updated successfully'
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
      const deleted = await aiInteractionService.delete(id);
      
      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'AI interaction not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'AI interaction deleted successfully'
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

  // セッションID別で対話記録を取得
  async getBySessionId(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const interactions = await aiInteractionService.findBySessionId(sessionId);
      
      const response: ApiResponse<AIInteraction[]> = {
        success: true,
        data: interactions
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

  // 要求者別で対話記録を取得
  async getByRequestedBy(req: Request, res: Response): Promise<void> {
    try {
      const { requestedBy } = req.params;
      const interactions = await aiInteractionService.findByRequestedBy(requestedBy);
      
      const response: ApiResponse<AIInteraction[]> = {
        success: true,
        data: interactions
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

  // 期間指定で対話記録を取得
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
      
      const interactions = await aiInteractionService.findByDateRange(
        startDate as string,
        endDate as string
      );
      
      const response: ApiResponse<AIInteraction[]> = {
        success: true,
        data: interactions
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

  // 高信頼度の対話記録を取得
  async getHighConfidence(req: Request, res: Response): Promise<void> {
    try {
      const { minConfidence } = req.query;
      let confidence = 0.8; // デフォルト値
      
      if (minConfidence) {
        confidence = parseFloat(minConfidence as string);
        if (isNaN(confidence) || confidence < 0 || confidence > 1) {
          const response: ApiResponse<null> = {
            success: false,
            error: 'minConfidence must be a number between 0 and 1'
          };
          res.status(400).json(response);
          return;
        }
      }
      
      const interactions = await aiInteractionService.findHighConfidence(confidence);
      
      const response: ApiResponse<AIInteraction[]> = {
        success: true,
        data: interactions
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

  // AI対話を根拠データに関連付け
  async linkToEvidence(req: Request, res: Response): Promise<void> {
    try {
      const { interactionId } = req.params;
      const { evidenceId, evidenceType, relevanceScore } = req.body;
      
      if (!evidenceId || !evidenceType || relevanceScore === undefined) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'evidenceId, evidenceType, and relevanceScore are required'
        };
        res.status(400).json(response);
        return;
      }

      // evidenceTypeのバリデーション
      const validTypes = ['LifeEvent', 'Decision', 'Preference'];
      if (!validTypes.includes(evidenceType)) {
        const response: ApiResponse<null> = {
          success: false,
          error: `evidenceType must be one of: ${validTypes.join(', ')}`
        };
        res.status(400).json(response);
        return;
      }

      // relevanceScoreのバリデーション
      if (relevanceScore < 0 || relevanceScore > 1) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'relevanceScore must be between 0 and 1'
        };
        res.status(400).json(response);
        return;
      }
      
      const linked = await aiInteractionService.linkToEvidence(
        interactionId,
        evidenceId,
        evidenceType,
        relevanceScore
      );
      
      if (!linked) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Failed to link AI interaction to evidence'
        };
        res.status(400).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'AI interaction linked to evidence successfully'
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

  // AI対話の根拠データを取得
  async getEvidence(req: Request, res: Response): Promise<void> {
    try {
      const { interactionId } = req.params;
      const evidence = await aiInteractionService.getEvidence(interactionId);
      
      const response: ApiResponse<any[]> = {
        success: true,
        data: evidence
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

  // セッションの統計情報を取得
  async getSessionStats(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const stats = await aiInteractionService.getSessionStats(sessionId);
      
      if (!stats) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Session not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<any> = {
        success: true,
        data: stats
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

export default new AIInteractionController();
