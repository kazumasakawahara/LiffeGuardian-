import { Request, Response } from 'express';
import decisionService from '../services/decision.service';
import { ApiResponse, Decision } from '../types';

export class DecisionController {
  // 全決定事項取得
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const decisions = await decisionService.findAll();
      const response: ApiResponse<Decision[]> = {
        success: true,
        data: decisions
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
      const decision = await decisionService.findById(id);
      
      if (!decision) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Decision not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<Decision> = {
        success: true,
        data: decision
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
      const decisionData = req.body;
      
      // 必須フィールドのバリデーション
      if (!decisionData.category || !decisionData.title || !decisionData.description || 
          !decisionData.decisionDate || !decisionData.createdBy) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Missing required fields: category, title, description, decisionDate, and createdBy are required'
        };
        res.status(400).json(response);
        return;
      }

      // categoryのバリデーション
      const validCategories = ['医療', '財産', '生活', 'その他'];
      if (!validCategories.includes(decisionData.category)) {
        const response: ApiResponse<null> = {
          success: false,
          error: `category must be one of: ${validCategories.join(', ')}`
        };
        res.status(400).json(response);
        return;
      }
      
      const newDecision = await decisionService.create(decisionData);
      const response: ApiResponse<Decision> = {
        success: true,
        data: newDecision,
        message: 'Decision created successfully'
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
      
      // categoryのバリデーション（更新時）
      const validCategories = ['医療', '財産', '生活', 'その他'];
      if (updateData.category && !validCategories.includes(updateData.category)) {
        const response: ApiResponse<null> = {
          success: false,
          error: `category must be one of: ${validCategories.join(', ')}`
        };
        res.status(400).json(response);
        return;
      }
      
      const updatedDecision = await decisionService.update(id, updateData);
      
      if (!updatedDecision) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Decision not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<Decision> = {
        success: true,
        data: updatedDecision,
        message: 'Decision updated successfully'
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
      const deleted = await decisionService.delete(id);
      
      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Decision not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Decision deleted successfully'
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

  // 決定を本人に関連付け
  async assignToPerson(req: Request, res: Response): Promise<void> {
    try {
      const { decisionId, personId } = req.params;
      const { decisionCapacity } = req.body;
      
      const assigned = await decisionService.assignToPerson(decisionId, personId, decisionCapacity);
      
      if (!assigned) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Failed to assign decision to person'
        };
        res.status(400).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Decision assigned to person successfully'
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

  // 特定の本人の決定事項を取得
  async getByPersonId(req: Request, res: Response): Promise<void> {
    try {
      const { personId } = req.params;
      const decisions = await decisionService.findByPersonId(personId);
      
      const response: ApiResponse<any[]> = {
        success: true,
        data: decisions
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

  // カテゴリー別で決定事項を取得
  async getByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const decisions = await decisionService.findByCategory(category);
      
      const response: ApiResponse<Decision[]> = {
        success: true,
        data: decisions
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

  // アクティブな決定事項のみ取得
  async getActive(req: Request, res: Response): Promise<void> {
    try {
      const decisions = await decisionService.findActive();
      
      const response: ApiResponse<Decision[]> = {
        success: true,
        data: decisions
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

  // 立会人を追加
  async addWitness(req: Request, res: Response): Promise<void> {
    try {
      const { decisionId, supporterId } = req.params;
      const { witnessRole } = req.body;
      
      if (!witnessRole) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'witnessRole is required'
        };
        res.status(400).json(response);
        return;
      }
      
      const added = await decisionService.addWitness(decisionId, supporterId, witnessRole);
      
      if (!added) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Failed to add witness to decision'
        };
        res.status(400).json(response);
        return;
      }
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Witness added successfully'
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

  // 決定事項の立会人を取得
  async getWitnesses(req: Request, res: Response): Promise<void> {
    try {
      const { decisionId } = req.params;
      const witnesses = await decisionService.getWitnesses(decisionId);
      
      const response: ApiResponse<any[]> = {
        success: true,
        data: witnesses
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

export default new DecisionController();
